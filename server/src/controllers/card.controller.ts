import type {
  Request,
  Response,
} from "express";

import {
  approveCard,
  generateCardVariant,
  getCardBuilderData,
  getCardById,
  getTeacherCardHistory,
  rejectCard,
} from "../services/card.service.ts";


// =====================================================
// BUILDER DATA
// =====================================================

export async function getCardBuilderController(
  req: Request,
  res: Response
) {
  try {

    const teacher =
      await getCardBuilderData(
        req.params.teacherId
      );


    return res.status(200).json({
      success: true,
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
      "FINAL_STATS_INCOMPLETE" ||
      message ===
      "FINAL_TITLES_INCOMPLETE"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Professor final stats or titles are incomplete",
      });
    }


    if (
      message ===
      "PERSONALITY_INCOMPLETE"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Please select an archetype and special move first",
      });
    }


    console.error(error);


    return res.status(500).json({
      success: false,
      message:
        "Unable to load card builder",
    });
  }
}


// =====================================================
// GENERATE VARIANT
// =====================================================

export async function generateCardController(
  req: Request,
  res: Response
) {
  try {

    const card =
      await generateCardVariant(
        req.params.teacherId
      );


    return res.status(201).json({
      success: true,

      message:
        `Card variant v${card.version} generated successfully`,

      card,
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
          "Stats must be finalized before generating a card",
      });
    }


    if (
      message ===
      "PERSONALITY_INCOMPLETE"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Archetype and special move are required first",
      });
    }


    console.error(
      "Card generation error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to generate card",
    });
  }
}


// =====================================================
// CARD HISTORY
// =====================================================

export async function getCardHistoryController(
  req: Request,
  res: Response
) {
  try {

    const result =
      await getTeacherCardHistory(
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
        "Unable to load card history",
    });
  }
}


// =====================================================
// SINGLE CARD
// =====================================================

export async function getCardController(
  req: Request,
  res: Response
) {
  try {

    const card =
      await getCardById(
        req.params.cardId
      );


    return res.status(200).json({
      success: true,
      card,
    });

  } catch (error) {

    if (
      error instanceof Error &&
      error.message ===
        "CARD_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Card not found",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Unable to load card",
    });
  }
}


// =====================================================
// APPROVE
// =====================================================

export async function approveCardController(
  req: Request,
  res: Response
) {
  try {

    const card =
      await approveCard(
        req.params.cardId
      );


    return res.status(200).json({
      success: true,
      message:
        "Card approved and set as official",
      card,
    });

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "";


    if (
      message ===
      "CARD_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Card not found",
      });
    }


    if (
      message ===
      "CARD_ALREADY_APPROVED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This card is already approved",
      });
    }


    console.error(error);


    return res.status(500).json({
      success: false,
      message:
        "Unable to approve card",
    });
  }
}


// =====================================================
// REJECT
// =====================================================

export async function rejectCardController(
  req: Request,
  res: Response
) {
  try {

    const card =
      await rejectCard(
        req.params.cardId
      );


    return res.status(200).json({
      success: true,
      message:
        "Card rejected",
      card,
    });

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "";


    if (
      message ===
      "CARD_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Card not found",
      });
    }


    if (
      message ===
      "CANNOT_REJECT_OFFICIAL_CARD"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "The official approved card cannot be rejected directly",
      });
    }


    if (
      message ===
      "CARD_ALREADY_REJECTED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This card has already been rejected",
      });
    }


    console.error(error);


    return res.status(500).json({
      success: false,
      message:
        "Unable to reject card",
    });
  }
}