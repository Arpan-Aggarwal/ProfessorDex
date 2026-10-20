import { Router } from "express";

import { requireAdmin } from "../middleware/admin.middleware.ts";

import { professorPhotoUpload } from "../middleware/upload.middleware.ts";

import {
  createTeacherController,
  deleteTeacherController,
  getTeacherController,
  listTeachersController,
  updateTeacherController,
} from "../controllers/teacher.controller.ts";

const router = Router();

router.use(requireAdmin);

router.get("/", listTeachersController);

router.get("/:id", getTeacherController);

router.post(
  "/",
  professorPhotoUpload.single("photo"),
  createTeacherController
);

router.put(
  "/:id",
  professorPhotoUpload.single("photo"),
  updateTeacherController
);

router.delete(
  "/:id",
  deleteTeacherController
);

export default router;