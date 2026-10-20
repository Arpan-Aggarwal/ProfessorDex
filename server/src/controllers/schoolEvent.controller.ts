import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.ts";
import { prisma } from "../config/database.ts";

const ratingKeys = [
  "teachingAura",
  "humourMeter",
  "classroomVibe",
  "mentorEnergy",
  "classroomPresence",
] as const;

type RatingKey = (typeof ratingKeys)[number];

function errorResponse(res: Response, error: unknown) {
  if (error instanceof Error) {
    const messages: Record<string, [number, string]> = {
      NOT_FOUND: [404, "School teacher not found"],
      NOT_OPEN: [
        409,
        "Ratings are paused or closed for this teacher.",
      ],
      ALREADY_COMPLETED: [
        409,
        "This teacher cannot be reopened for rating.",
      ],
      INVALID_STATUS: [
        400,
        "Only OPEN and PAUSED are allowed.",
      ],
      INVALID_INPUT: [
        400,
        "Invalid teacher information.",
      ],
      CONCURRENT_UPDATE: [
        409,
        "Teacher status changed. Please try again.",
      ],
    };

    const match = messages[error.message];

    if (match) {
      return res.status(match[0]).json({
        success: false,
        message: match[1],
      });
    }
  }

  console.error("School Event error:", error);

  return res.status(500).json({
    success: false,
    message: "School Event request failed",
  });
}

function parseTeacherFields(
  body: Record<string, unknown>,
  partial = false
) {
  const data: {
    name?: string;
    schoolName?: string;
  } = {};

  for (const key of ["name", "schoolName"] as const) {
    if (body[key] === undefined && partial) continue;

    const value = body[key];

    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.trim().length > 160
    ) {
      throw new Error("INVALID_INPUT");
    }

    data[key] = value.trim();
  }

  return data;
}

// ADMIN: Create school teacher
export async function createSchoolTeacher(
  req: Request,
  res: Response
) {
  try {
    const data = parseTeacherFields(req.body);

    const teacher = await prisma.schoolTeacher.create({
      data: {
        name: data.name!,
        schoolName: data.schoolName!,
        photoUrl: req.file
          ? `/uploads/school-teachers/${req.file.filename}`
          : null,
      },
    });

    return res.status(201).json({
      success: true,
      teacher,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
}

// ADMIN: List all school teachers
export async function listSchoolTeachersAdmin(
  _req: Request,
  res: Response
) {
  try {
    const teachers = await prisma.schoolTeacher.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            ratings: true,
          },
        },
        card: true,
      },
    });

    return res.json({
      success: true,
      teachers,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
}

// ADMIN: Get one teacher
export async function getSchoolTeacherAdmin(
  req: Request,
  res: Response
) {
  try {
    const teacher = await prisma.schoolTeacher.findUnique({
      where: {
        id: req.params.id as string,
      },
      include: {
        _count: {
          select: {
            ratings: true,
          },
        },
        card: true,
      },
    });

    if (!teacher) throw new Error("NOT_FOUND");

    return res.json({
      success: true,
      teacher,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
}

// ADMIN: Edit name, school, or photo
export async function updateSchoolTeacher(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id as string;
    const data = parseTeacherFields(req.body, true);

    const teacher = await prisma.schoolTeacher.update({
      where: { id },
      data: {
        ...data,
        ...(req.file
          ? {
              photoUrl:
                `/uploads/school-teachers/${req.file.filename}`,
            }
          : {}),
      },
    });

    return res.json({
      success: true,
      teacher,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return errorResponse(res, new Error("NOT_FOUND"));
    }

    return errorResponse(res, error);
  }
}

// ADMIN: Pause or resume ratings
export async function changeSchoolTeacherStatus(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id as string;
    const status = req.body?.status;

    if (status !== "OPEN" && status !== "PAUSED") {
      throw new Error("INVALID_STATUS");
    }

    const result = await prisma.schoolTeacher.updateMany({
      where: {
        id,
        status: {
          in: ["OPEN", "PAUSED"],
        },
      },
      data: { status },
    });

    if (!result.count) {
      const existing = await prisma.schoolTeacher.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!existing) throw new Error("NOT_FOUND");

      throw new Error("ALREADY_COMPLETED");
    }

    const teacher = await prisma.schoolTeacher.findUniqueOrThrow({
      where: { id },
    });

    return res.json({
      success: true,
      teacher,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
}

// PUBLIC: Only teachers currently accepting ratings
export async function listOpenSchoolTeachers(
  _req: Request,
  res: Response
) {
  try {
    const teachers = await prisma.schoolTeacher.findMany({
      where: {
        status: "OPEN",
      },
      select: {
        id: true,
        name: true,
        schoolName: true,
        photoUrl: true,
      },
      orderBy: [
        { schoolName: "asc" },
        { name: "asc" },
      ],
    });

    res.setHeader("Cache-Control", "no-store");

    return res.json({
      success: true,
      teachers,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
}

// PUBLIC: Submit anonymous student rating
export async function submitSchoolRating(
  req: Request,
  res: Response
) {
  try {
    const teacherId = req.params.id as string;

    const ratings = {} as Record<RatingKey, number>;

    for (const key of ratingKeys) {
      const value = req.body?.[key];

      if (
        !Number.isInteger(value) ||
        value < 1 ||
        value > 5
      ) {
        return res.status(400).json({
          success: false,
          message: `${key} must be an integer from 1 to 5`,
        });
      }

      ratings[key] = value;
    }

    // Transaction protects against simultaneous
    // status changes and rating submissions.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const rating = await prisma.$transaction(
          async (tx) => {
            const teacher = await tx.schoolTeacher.findUnique({
              where: { id: teacherId },
              select: { status: true },
            });

            if (!teacher) throw new Error("NOT_FOUND");

            if (teacher.status !== "OPEN") {
              throw new Error("NOT_OPEN");
            }

            await tx.schoolTeacher.update({
              where: { id: teacherId },
              data: { updatedAt: new Date() },
            });

            return tx.schoolRating.create({
              data: {
                teacherId,
                ...ratings,
              },
            });
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          }
        );

        return res.status(201).json({
          success: true,
          ratingId: rating.id,
          message: "Rating saved. Next student may begin.",
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034"
        ) {
          if (attempt < 2) continue;

          throw new Error("CONCURRENT_UPDATE");
        }

        throw error;
      }
    }

    throw new Error("CONCURRENT_UPDATE");
  } catch (error) {
    return errorResponse(res, error);
  }
}

// ADMIN: Check eligibility to forge a card
export async function getSchoolForgeEligibility(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id as string;

    const teacher = await prisma.schoolTeacher.findUnique({
      where: { id },
      select: {
        status: true,
        name: true,
        photoUrl: true,
      },
    });

    if (!teacher) throw new Error("NOT_FOUND");

    const ratingCount = await prisma.schoolRating.count({
      where: { teacherId: id },
    });

    return res.json({
      success: true,
      teacher,
      ratingCount,
      minimumRatings: 5,
      canForge:
        ratingCount >= 5 &&
        ["OPEN", "PAUSED"].includes(teacher.status),
      remainingRatings: Math.max(0, 5 - ratingCount),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
}