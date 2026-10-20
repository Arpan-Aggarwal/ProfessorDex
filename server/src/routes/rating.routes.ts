import { Router } from "express";

import {
  requireStudent,
} from "../middleware/student.middleware.ts";

import {
  ratingOptionsController,
  submitRatingController,
} from "../controllers/rating.controller.ts";

const router = Router();

router.use(requireStudent);

router.get(
  "/options",
  ratingOptionsController
);

router.post(
  "/:teacherId",
  submitRatingController
);

export default router;