import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import schoolEventRoutes from "./routes/schoolEvent.routes.ts";
import { prisma } from "./config/database.ts";

import authRoutes from "./routes/auth.routes.ts";

import path from "path";
import teacherRoutes from "./routes/teacher.routes.ts";

import privateCodeRoutes from "./routes/privateCode.routes.ts";

import studentAuthRoutes from "./routes/studentAuth.routes.ts";

import studentTeacherRoutes from "./routes/studentTeacher.routes.ts";

import ratingRoutes from "./routes/rating.routes.ts";

import adminRatingRoutes from "./routes/adminRating.routes.ts";

import cardBuilderRoutes from "./routes/cardBuilder.routes.ts";

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use(
  "/uploads",
  express.static(
    path.resolve(process.cwd(), "uploads")
  )
);

app.use("/api/admin/teachers", teacherRoutes);

app.use(
  "/api/admin/codes",
  privateCodeRoutes
);

app.use(
  "/api/auth/student",
  studentAuthRoutes
);

app.use(
  "/api/student/teachers",
  studentTeacherRoutes
);

app.use(
  "/api/student/ratings",
  ratingRoutes
);

app.use(
  "/api/admin/ratings",
  adminRatingRoutes
);

app.use(
  "/api/admin/cards",
  cardBuilderRoutes
);
app.use("/api/school-event", schoolEventRoutes);
// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", async (_req, res) => {
  try {
    const semesterCount = await prisma.semester.count();

    res.status(200).json({
      success: true,
      message: "ProfessorDex API is running",
      database: "connected",
      semesters: semesterCount,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "ProfessorDex API is running, but database connection failed",
    });
  }
});


export default app;