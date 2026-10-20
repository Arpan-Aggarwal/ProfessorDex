import type {
  Request,
  Response,
} from "express";

import {
  getArchetypeRecommendations,
  getTeacherPersonality,
  saveTeacherPersonality,
} from "../services/archetype.service.ts";


// =====================================================
// GET RECOMMENDATIONS
// =====================================================

export async function getArchetypeRecommendationsController(
  req: Request,
  res: Response
) {

  try {

    const result =
      await getArchetypeRecommendations(
        req.params.teacherId
      );


    return res.status(200).json({
      success: true,

      ...result,
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
      "STATS_NOT_FINALIZED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Professor stats must be finalized first",
      });
    }


    if (
      message ===
      "FINAL_STATS_INCOMPLETE"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Professor final stats are incomplete",
      });
    }


    if (
      message ===
      "NO_ARCHETYPES"
    ) {
      return res.status(500).json({
        success: false,
        message:
          "No archetypes are configured",
      });
    }


    console.error(
      "Archetype recommendation error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to calculate archetype recommendations",
    });
  }
}


// =====================================================
// SAVE PERSONALITY
// =====================================================

export async function saveTeacherPersonalityController(
  req: Request,
  res: Response
) {

  try {

    const {
      archetype,
      specialMove,
      specialMoveDescription,
    } = req.body;


    const teacher =
      await saveTeacherPersonality(
        req.params.teacherId,
        {
          archetype,
          specialMove,
          specialMoveDescription,
        }
      );


    return res.status(200).json({
      success: true,

      message:
        "Professor personality saved successfully",

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
      "STATS_NOT_FINALIZED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Professor stats must be finalized first",
      });
    }


    if (
      message ===
      "INVALID_ARCHETYPE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid archetype",
      });
    }


    if (
      message ===
      "INVALID_SPECIAL_MOVE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid special move",
      });
    }


    if (
      message ===
      "INVALID_MOVE_DESCRIPTION"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid special move description",
      });
    }


    console.error(
      "Personality save error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to save professor personality",
    });
  }
}


// =====================================================
// GET SAVED PERSONALITY
// =====================================================

export async function getTeacherPersonalityController(
  req: Request,
  res: Response
) {

  try {

    const teacher =
      await getTeacherPersonality(
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
        "Unable to load professor personality",
    });
  }
}