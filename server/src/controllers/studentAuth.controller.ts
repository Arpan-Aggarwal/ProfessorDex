import type {
  Request,
  Response,
} from "express";

import {
  registerStudent,
  loginStudent,
  getStudentProfile,
} from "../services/studentAuth.service.ts";


function setStudentCookie(
  res: Response,
  token: string
) {
  res.cookie("student_token", token, {
    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: "lax",

    maxAge:
      8 * 60 * 60 * 1000,
  });
}


// ======================================
// REGISTER
// ======================================

export async function registerStudentController(
  req: Request,
  res: Response
) {
  try {
    const {
      email,
      password,
      privateCode,
      semesterSlug,
    } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof privateCode !== "string" ||
      typeof semesterSlug !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, password, private code and semester are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters",
      });
    }

    const result =
      await registerStudent(
        email,
        password,
        privateCode,
        semesterSlug
      );

    setStudentCookie(
      res,
      result.token
    );

    return res.status(201).json({
      success: true,
      message:
        "Student registration successful",
      student: result.student,
    });

  } catch (error) {

    if (
      error instanceof Error &&
      error.message ===
        "EMAIL_ALREADY_REGISTERED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_CODE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid private code",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "CODE_ALREADY_USED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This private code has already been used",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "CODE_WRONG_SEMESTER"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This private code belongs to another semester",
      });
    }

    console.error(
      "Student registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to register student",
    });
  }
}


// ======================================
// LOGIN
// ======================================

export async function loginStudentController(
  req: Request,
  res: Response
) {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const result =
      await loginStudent(
        email,
        password
      );

    setStudentCookie(
      res,
      result.token
    );

    return res.status(200).json({
      success: true,
      message:
        "Student login successful",
      student: result.student,
    });

  } catch (error) {

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    console.error(
      "Student login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
}


// ======================================
// CURRENT STUDENT
// ======================================

export async function studentMeController(
  _req: Request,
  res: Response
) {
  const student =
    await getStudentProfile(
      res.locals.studentId
    );

  if (
    !student ||
    !student.isActive
  ) {
    return res.status(404).json({
      success: false,
      message:
        "Student account not found",
    });
  }

  return res.status(200).json({
    success: true,
    student,
  });
}


// ======================================
// LOGOUT
// ======================================

export function logoutStudentController(
  _req: Request,
  res: Response
) {
  res.clearCookie(
    "student_token"
  );

  return res.status(200).json({
    success: true,
    message:
      "Student logged out successfully",
  });
}