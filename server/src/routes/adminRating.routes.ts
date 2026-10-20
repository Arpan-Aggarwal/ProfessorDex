import { Router } from "express";

import {
  requireAdmin,
} from "../middleware/admin.middleware.ts";


import {
  getRatingControlController,
  updateRatingControlController,
} from "../controllers/ratingControl.controller.ts";


import {
  listStatsTeachersController,
  teacherStatsPreviewController,
} from "../controllers/stats.controller.ts";


import {
  finalizeTeacherStatsController,
  getFinalizedTeacherController,
} from "../controllers/finalization.controller.ts";


const router = Router();


// =====================================================
// ALL ROUTES REQUIRE ADMIN
// =====================================================

router.use(requireAdmin);


// =====================================================
// SEMESTER RATING CONTROL
// =====================================================

router.get(
  "/semesters",
  getRatingControlController
);


router.patch(
  "/semesters/:semesterId",
  updateRatingControlController
);


// =====================================================
// STATS REVIEW
// =====================================================

router.get(
  "/stats/teachers",
  listStatsTeachersController
);


router.get(
  "/stats/teachers/:teacherId",
  teacherStatsPreviewController
);


// =====================================================
// STATS FINALIZATION
// =====================================================

router.put(
  "/stats/teachers/:teacherId/finalize",
  finalizeTeacherStatsController
);


router.get(
  "/stats/teachers/:teacherId/finalized",
  getFinalizedTeacherController
);


export default router;