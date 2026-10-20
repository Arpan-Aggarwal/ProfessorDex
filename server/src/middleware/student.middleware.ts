import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing from .env"
  );
}

interface StudentTokenPayload {
  studentId: string;
  semesterId: number;
  role: string;
}

export function requireStudent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token =
    req.cookies?.student_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message:
        "Student authentication required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as StudentTokenPayload;

    if (
      decoded.role !== "STUDENT" ||
      !decoded.studentId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid student session",
      });
    }

    res.locals.studentId =
      decoded.studentId;

    res.locals.semesterId =
      decoded.semesterId;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired student session",
    });
  }
}