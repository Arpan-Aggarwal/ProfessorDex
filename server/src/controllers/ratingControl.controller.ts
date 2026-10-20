import type {
  Request,
  Response,
} from "express";

import {
  getSemesterRatingStatus,
  setSemesterRatingsOpen,
} from "../services/ratingControl.service.ts";

export async function getRatingControlController(
  _req: Request,
  res: Response
) {
  try {
    const semesters =
      await getSemesterRatingStatus();

    return res.status(200).json({
      success: true,
      semesters,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to load rating controls",
    });
  }
}

export async function updateRatingControlController(
  req: Request,
  res: Response
) {
  try {
    const semesterId =
      Number(req.params.semesterId);

    const { ratingsOpen } = req.body;

    if (!Number.isInteger(semesterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester ID",
      });
    }

    if (typeof ratingsOpen !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "ratingsOpen must be true or false",
      });
    }

    const semester =
      await setSemesterRatingsOpen(
        semesterId,
        ratingsOpen
      );

    return res.status(200).json({
      success: true,

      message: ratingsOpen
        ? `${semester.name} ratings opened`
        : `${semester.name} ratings closed`,

      semester,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "SEMESTER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to update rating status",
    });
  }
}