import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../config/database.ts";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

export async function loginAdmin(
  email: string,
  password: string
) {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await prisma.admin.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!admin || !admin.isActive) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    admin.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    {
      adminId: admin.id,
      role: "ADMIN",
    },
    JWT_SECRET,
    {
      expiresIn: "8h",
    }
  );

  return {
    token,

    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  };
}