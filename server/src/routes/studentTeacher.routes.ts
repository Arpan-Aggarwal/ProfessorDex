import { Router } from "express";

import {
  requireStudent,
} from "../middleware/student.middleware.ts";

import {
  getStudentTeacherController,
  listStudentTeachersController,
} from "../controllers/studentTeacher.controller.ts";

const router = Router();

router.use(requireStudent);

router.get(
  "/",
  listStudentTeachersController
);

router.get(
  "/:id",
  getStudentTeacherController
);

export default router;