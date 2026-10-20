import type {
  Request,
  Response,
} from "express";

import {
  getRatingOptions,
  submitRating,
} from "../services/rating.service.ts";

export async function ratingOptionsController(
  _req: Request,
  res: Response
) {
  try {
    const categories =
      await getRatingOptions();

    return res.status(200).json({
      success: true,

      questions: {
        TEACHING_AURA:
          "How easily do you understand concepts in their class?",

        HUMOUR_METER:
          "How would you describe the humour in their classes?",

        CLASSROOM_VIBE:
          "What does the overall atmosphere around them feel like?",

        MENTOR_ENERGY:
          "How supportive are they when students need guidance?",

        CLASSROOM_PRESENCE:
          "How strong is their presence while taking a class?",
      },

      categories,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to load rating options",
    });
  }
}

export async function submitRatingController(
  req: Request,
  res: Response
) {
  try {
    const rating =
      await submitRating(
        res.locals.studentId,
        res.locals.semesterId,
        req.params.teacherId,
        {
          teachingAura: Number(
            req.body.teachingAura
          ),

          humourMeter: Number(
            req.body.humourMeter
          ),

          classroomVibe: Number(
            req.body.classroomVibe
          ),

          mentorEnergy: Number(
            req.body.mentorEnergy
          ),

          classroomPresence: Number(
            req.body.classroomPresence
          ),
        }
      );

    return res.status(201).json({
      success: true,
      message:
        "Professor rated successfully",
      rating: {
        teacherId:
          rating.teacherId,
        submittedAt:
          rating.createdAt,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message === "RATINGS_CLOSED"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Ratings are currently closed for your semester",
      });
    }

    if (
      message ===
      "TEACHER_NOT_AVAILABLE"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "This professor is not available in your semester",
      });
    }

    if (
      message ===
      "INVALID_RATING_VALUES"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Every category must contain a valid rating option",
      });
    }

    if (
      message === "ALREADY_RATED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already rated this professor",
      });
    }

    console.error(
      "Rating submission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit rating",
    });
  }
}