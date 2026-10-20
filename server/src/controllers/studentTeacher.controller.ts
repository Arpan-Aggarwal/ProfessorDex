import type {
  Request,
  Response,
} from "express";

import {
  getStudentTeacherById,
  getStudentTeachers,
} from "../services/studentTeacher.service.ts";

export async function listStudentTeachersController(
  _req: Request,
  res: Response
) {
  try {
    const teachers =
      await getStudentTeachers(
        res.locals.studentId,
        res.locals.semesterId
      );

    return res.status(200).json({
      success: true,
      teachers,
    });
  } catch (error) {
    console.error(
      "Student teacher list error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load professors",
    });
  }
}

export async function getStudentTeacherController(
  req: Request,
  res: Response
) {
  try {
    const teacher =
      await getStudentTeacherById(
        res.locals.studentId,
        res.locals.semesterId,
        req.params.id
      );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message:
          "Professor not found for your semester",
      });
    }

    return res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to load professor",
    });
  }
}