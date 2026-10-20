import { Router } from "express";

import {
  loginStudentController,
  logoutStudentController,
  registerStudentController,
  studentMeController,
} from "../controllers/studentAuth.controller.ts";

import {
  requireStudent,
} from "../middleware/student.middleware.ts";

const router = Router();

router.post(
  "/register",
  registerStudentController
);

router.post(
  "/login",
  loginStudentController
);

router.post(
  "/logout",
  requireStudent,
  logoutStudentController
);

router.get(
  "/me",
  requireStudent,
  studentMeController
);

export default router;