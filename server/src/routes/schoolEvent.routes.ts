import type { Request, Response } from "express";
import {
  forgeSchoolCard,
  SchoolForgeError,
} from "../services/schoolForge.service.ts";
import { prisma } from "../config/database.ts";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import { requireAdmin } from "../middleware/admin.middleware.ts";

import { schoolPhotoUpload } from "../middleware/schoolPhoto.middleware.ts";

import {
  createSchoolTeacher,
  listSchoolTeachersAdmin,
  getSchoolTeacherAdmin,
  updateSchoolTeacher,
  changeSchoolTeacherStatus,
  listOpenSchoolTeachers,
  submitSchoolRating,
  getSchoolForgeEligibility,
} from "../controllers/schoolEvent.controller.ts";

const router = Router();

// =====================================
// ADMIN ROUTES
// =====================================

const admin = Router();

admin.use(requireAdmin);

admin.get(
  "/teachers",
  listSchoolTeachersAdmin
);

admin.get(
  "/teachers/:id",
  getSchoolTeacherAdmin
);

admin.post(
  "/teachers",
  schoolPhotoUpload.single("photo"),
  createSchoolTeacher
);

admin.patch(
  "/teachers/:id",
  schoolPhotoUpload.single("photo"),
  updateSchoolTeacher
);

admin.delete("/teachers/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const teacher = await tx.schoolTeacher.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!teacher) return false;

      await tx.schoolRating.deleteMany({ where: { teacherId: id } });
      await tx.schoolCard.deleteMany({ where: { teacherId: id } });
      await tx.schoolTeacher.delete({ where: { id } });

      return true;
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "School teacher not found.",
      });
    }

    return res.json({ success: true, message: "Teacher deleted." });
  } catch (error) {
    console.error("Teacher deletion failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete school teacher.",
    });
  }
});

admin.patch(
  "/teachers/:id/status",
  changeSchoolTeacherStatus
);

admin.get(
  "/teachers/:id/forge-eligibility",
  getSchoolForgeEligibility
);
/**
 * POST /api/school-event/admin/teachers/:id/forge
 *
 * Admin-only: permanently finalize a school teacher's card.
 */
admin.post(
  "/teachers/:id/forge",
  async (req: Request, res: Response) => {
    try {
      const teacherId = req.params.id as string;

      const result = await forgeSchoolCard(teacherId);

      return res.status(201).json({
        success: true,
        message: "School teacher card forged successfully.",
        ...result,
      });
    } catch (error) {
      if (error instanceof SchoolForgeError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      console.error("School card forging failed:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to forge school card.",
      });
    }
  }
);

/**
 * GET /api/school-event/admin/cards
 *
 * Admin-only: all completed school cards.
 */
admin.get(
  "/cards",
  async (_req: Request, res: Response) => {
    try {
      const cards = await prisma.schoolCard.findMany({
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              schoolName: true,
              photoUrl: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({
        success: true,
        cards,
      });
    } catch (error) {
      console.error("School card gallery failed:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load school cards.",
      });
    }
  }
);

/**
 * GET /api/school-event/admin/cards/:id
 *
 * Admin-only: retrieve one forged school card.
 */
admin.delete("/cards/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const card = await tx.schoolCard.findUnique({
        where: { id },
        select: { teacherId: true },
      });

      if (!card) return false;

      await tx.schoolCard.delete({ where: { id } });

      await tx.schoolTeacher.updateMany({
        where: { id: card.teacherId, status: "COMPLETED" },
        data: { status: "PAUSED" },
      });

      return true;
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "School card not found.",
      });
    }

    return res.json({
      success: true,
      message: "Card deleted; teacher and ratings retained.",
    });
  } catch (error) {
    console.error("Card deletion failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete school card.",
    });
  }
});

admin.get(
  "/cards/:id",
  async (req: Request, res: Response) => {
    try {
      const card = await prisma.schoolCard.findUnique({
        where: { id: req.params.id as string },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              schoolName: true,
              photoUrl: true,
              status: true,
            },
          },
        },
      });

      if (!card) {
        return res.status(404).json({
          success: false,
          message: "School card not found.",
        });
      }

      return res.json({
        success: true,
        card,
      });
    } catch (error) {
      console.error("School card lookup failed:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load school card.",
      });
    }
  }
);
router.use("/admin", admin);

// =====================================
// PUBLIC SCHOOL RATING ROUTES
// =====================================

const ratingLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.get(
  "/teachers",
  listOpenSchoolTeachers
);

router.post(
  "/teachers/:id/ratings",
  ratingLimiter,
  submitSchoolRating
);

export default router;