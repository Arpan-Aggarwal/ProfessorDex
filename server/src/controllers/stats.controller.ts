import type {
  Request,
  Response,
} from "express";

import {
  getTeacherStatsPreview,
  getTeachersForStatsReview,
} from "../services/aggregation.service.ts";

export async function listStatsTeachersController(
  _req: Request,
  res: Response
) {
  try {
    const teachers =
      await getTeachersForStatsReview();

    return res.status(200).json({
      success: true,
      teachers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to load professors",
    });
  }
}

export async function teacherStatsPreviewController(
  req: Request,
  res: Response
) {
  try {
    const result =
      await getTeacherStatsPreview(
        req.params.teacherId
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "TEACHER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Professor not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to calculate professor stats",
    });
  }
}