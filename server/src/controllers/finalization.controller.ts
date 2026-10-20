import type {
  Request,
  Response,
} from "express";

import {
  finalizeTeacherStats,
  getFinalizedTeacherStats,
} from "../services/finalization.service.ts";


// =====================================================
// FINALIZE PROFESSOR
// =====================================================

export async function finalizeTeacherStatsController(
  req: Request,
  res: Response
) {
  try {
    const teachingAura =
      Number(req.body.teachingAura);

    const humourMeter =
      Number(req.body.humourMeter);

    const classroomVibe =
      Number(req.body.classroomVibe);

    const mentorEnergy =
      Number(req.body.mentorEnergy);

    const classroomPresence =
      Number(req.body.classroomPresence);


    const teachingAuraTitle =
      req.body.teachingAuraTitle;

    const humourMeterTitle =
      req.body.humourMeterTitle;

    const classroomVibeTitle =
      req.body.classroomVibeTitle;

    const mentorEnergyTitle =
      req.body.mentorEnergyTitle;

    const classroomPresenceTitle =
      req.body.classroomPresenceTitle;


    const teacher =
      await finalizeTeacherStats(
        req.params.teacherId,
        {
          teachingAura,
          humourMeter,
          classroomVibe,
          mentorEnergy,
          classroomPresence,

          teachingAuraTitle,
          humourMeterTitle,
          classroomVibeTitle,
          mentorEnergyTitle,
          classroomPresenceTitle,
        }
      );


    return res.status(200).json({
      success: true,

      message:
        "Professor stats finalized successfully",

      teacher,
    });

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "";


    if (
      message ===
      "TEACHER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Professor not found",
      });
    }


    if (
      message ===
      "NO_RATINGS"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Professor has no ratings to finalize",
      });
    }


    if (
      message ===
      "RATINGS_STILL_OPEN"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Ratings must be closed for all semesters assigned to this professor before finalization",
      });
    }


    if (
      message ===
      "INVALID_SCORES"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All final scores must be whole numbers between 0 and 100",
      });
    }


    if (
      message ===
      "INVALID_TITLES"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Every category must have a valid title",
      });
    }


    console.error(
      "Professor finalization error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to finalize professor stats",
    });
  }
}


// =====================================================
// GET FINALIZED PROFESSOR
// =====================================================

export async function getFinalizedTeacherController(
  req: Request,
  res: Response
) {
  try {
    const teacher =
      await getFinalizedTeacherStats(
        req.params.teacherId
      );


    return res.status(200).json({
      success: true,
      teacher,
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
        "Unable to load finalized stats",
    });
  }
}