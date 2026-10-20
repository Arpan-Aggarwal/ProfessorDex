import type {
  Request,
  Response,
} from "express";

import {
  deletePrivateCode,
  generateCodes,
  getPrivateCodes,
} from "../services/privateCode.service.ts";


export async function generateCodesController(
  req: Request,
  res: Response
) {
  try {
    const semesterId = Number(
      req.body.semesterId
    );

    const count = Number(req.body.count);

    if (
      !Number.isInteger(semesterId) ||
      !Number.isInteger(count)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "semesterId and count must be valid integers",
      });
    }

    const result = await generateCodes(
      semesterId,
      count
    );

    return res.status(201).json({
      success: true,
      message: `${result.count} private codes generated`,
      ...result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SEMESTER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_COUNT"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Code quantity must be between 1 and 500",
      });
    }

    console.error(
      "Private-code generation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate private codes",
    });
  }
}


export async function listCodesController(
  req: Request,
  res: Response
) {
  try {
    let semesterId: number | undefined;

    if (
      typeof req.query.semesterId === "string"
    ) {
      semesterId = Number(
        req.query.semesterId
      );

      if (!Number.isInteger(semesterId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid semesterId",
        });
      }
    }

    const codes =
      await getPrivateCodes(semesterId);

    return res.status(200).json({
      success: true,
      count: codes.length,
      codes,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to load codes",
    });
  }
}


export async function deleteCodeController(
  req: Request,
  res: Response
) {
  try {
    await deletePrivateCode(req.params.id);

    return res.status(200).json({
      success: true,
      message:
        "Private code deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CODE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Private code not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "CODE_ALREADY_USED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Used private codes cannot be deleted",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete private code",
    });
  }
}