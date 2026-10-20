import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

interface AdminTokenPayload {
  adminId: string;
  role: string;
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Admin authentication required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as AdminTokenPayload;

    if (
      decoded.role !== "ADMIN" ||
      !decoded.adminId
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin token",
      });
    }

    res.locals.adminId = decoded.adminId;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
}