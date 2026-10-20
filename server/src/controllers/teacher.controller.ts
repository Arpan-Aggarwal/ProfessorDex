import {
  createTeacher,
  deleteTeacher,
  getTeacherById,
  getTeachers,
  updateTeacher,
} from "../services/teacher.service.ts";
import type { Request,Response } from "express";
function parseSemesterIds(
  value: unknown
): number[] {
  if (Array.isArray(value)) {
    return value.map(Number);
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map(Number);
    }
  } catch {
    return value
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !Number.isNaN(id));
  }

  return [];
}

export async function createTeacherController(
  req: Request,
  res: Response
) {
  try {
    const {
      name,
      department,
      description,
    } = req.body;

    const semesterIds = parseSemesterIds(
      req.body.semesterIds
    );

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof department !== "string" ||
      !department.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Professor name and department are required",
      });
    }

    if (semesterIds.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one semester must be selected",
      });
    }

    const photoUrl = req.file
      ? `/uploads/professors/${req.file.filename}`
      : undefined;

    const teacher = await createTeacher({
      name,
      department,
      description,
      photoUrl,
      semesterIds,
    });

    return res.status(201).json({
      success: true,
      message: "Professor created successfully",
      teacher,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_SEMESTER"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester selected",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to create professor",
    });
  }
}

export async function listTeachersController(
  _req: Request,
  res: Response
) {
  const teachers = await getTeachers();

  return res.json({
    success: true,
    teachers,
  });
}

export async function getTeacherController(
  req: Request,
  res: Response
) {
  const teacher = await getTeacherById(
    req.params.id
  );

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Professor not found",
    });
  }

  return res.json({
    success: true,
    teacher,
  });
}

export async function updateTeacherController(
  req: Request,
  res: Response
) {
  try {
    let semesterIds: number[] | undefined;

    if (req.body.semesterIds !== undefined) {
      semesterIds = parseSemesterIds(
        req.body.semesterIds
      );
    }

    const photoUrl = req.file
      ? `/uploads/professors/${req.file.filename}`
      : undefined;

    const teacher = await updateTeacher(
      req.params.id,
      {
        name: req.body.name,
        department: req.body.department,
        description: req.body.description,
        semesterIds,
        photoUrl,
      }
    );

    return res.json({
      success: true,
      message: "Professor updated successfully",
      teacher,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TEACHER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Professor not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_SEMESTER"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester selected",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to update professor",
    });
  }
}

export async function deleteTeacherController(
  req: Request,
  res: Response
) {
  try {
    await deleteTeacher(
      req.params.id
    );

    return res.json({
      success: true,
      message:
        "Professor permanently deleted",
    });

  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "TEACHER_NOT_FOUND"
    ) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Professor not found",
        });
    }

    console.error(
      "Delete professor error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to delete professor",
      });
  }
}