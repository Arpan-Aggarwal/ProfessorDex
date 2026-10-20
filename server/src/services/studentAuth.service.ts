import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../config/database.ts";
import { hashPrivateCode } from "../utils/privateCode.ts";


const JWT_SECRET =
  process.env.JWT_SECRET;


if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing from .env"
  );
}

const VALID_STUDENT_SEMESTERS =
 new Set([
    "applied-dept-1",
    "applied-dept-2",
    "cse-2nd",
    "cse-3rd",
    "aiml-2nd",
    "aiml-3rd",
    "mechanical",
    "biotech",
    "ar",
    "ece",
    "bba",
  ]);


function createStudentToken(
  studentId: string,
  semesterId: number
) {
  return jwt.sign(
    {
      studentId,
      semesterId,
      role: "STUDENT",
    },

    JWT_SECRET,

    {
      expiresIn: "8h",
    }
  );
}


export async function registerStudent(
  email: string,
  password: string,
  privateCode: string,
  semesterSlug: string
) {
  if (
    !VALID_STUDENT_SEMESTERS.has(
      semesterSlug
    )
  ) {
    /*
     * Reuse an existing auth error rather
     * than introducing an unmapped controller
     * error code.
     */

    throw new Error(
      "CODE_WRONG_SEMESTER"
    );
  }


  const normalizedEmail =
    email
      .trim()
      .toLowerCase();


  const existingStudent =
    await prisma.student.findUnique({
      where: {
        email:
          normalizedEmail,
      },
    });


  if (existingStudent) {
    throw new Error(
      "EMAIL_ALREADY_REGISTERED"
    );
  }


  const codeHash =
    hashPrivateCode(
      privateCode
    );


  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );


  const student =
    await prisma.$transaction(
      async (tx) => {

        const code =
          await tx.privateCode.findUnique({
            where: {
              codeHash,
            },

            include: {
              semester: true,
            },
          });


        if (
          !code ||
          !code.semester.isActive
        ) {
          throw new Error(
            "INVALID_CODE"
          );
        }


        /*
         * Even if an invalid semester somehow
         * exists in the database, student
         * registration is limited to Sem 1–4.
         */

        if (
          !VALID_STUDENT_SEMESTERS.has(
            code.semester.slug
          )
        ) {
          throw new Error(
            "INVALID_CODE"
          );
        }


        if (
          code.semester.slug !==
          semesterSlug
        ) {
          throw new Error(
            "CODE_WRONG_SEMESTER"
          );
        }


        if (code.isUsed) {
          throw new Error(
            "CODE_ALREADY_USED"
          );
        }


        const claimedCode =
          await tx.privateCode.updateMany({
            where: {
              id:
                code.id,

              isUsed:
                false,
            },

            data: {
              isUsed:
                true,

              usedAt:
                new Date(),
            },
          });


        if (
          claimedCode.count !==
          1
        ) {
          throw new Error(
            "CODE_ALREADY_USED"
          );
        }


        return tx.student.create({
          data: {
            email:
              normalizedEmail,

            passwordHash,

            semesterId:
              code.semesterId,

            privateCodeId:
              code.id,
          },

          include: {
            semester: true,
          },
        });
      }
    );


  const token =
    createStudentToken(
      student.id,
      student.semesterId
    );


  return {
    token,

    student: {
      id:
        student.id,

      email:
        student.email,

      semester: {
        id:
          student.semester.id,

        name:
          student.semester.name,

        slug:
          student.semester.slug,

        ratingsOpen:
          student.semester
            .ratingsOpen,
      },
    },
  };
}


export async function loginStudent(
  email: string,
  password: string
) {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();


  const student =
    await prisma.student.findUnique({
      where: {
        email:
          normalizedEmail,
      },

      include: {
        semester: true,
      },
    });


  if (
    !student ||
    !student.isActive
  ) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }


  /*
   * Old/bad accounts belonging to unsupported
   * semester portals cannot authenticate.
   */

  if (
    !VALID_STUDENT_SEMESTERS.has(
      student.semester.slug
    )
  ) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }


  if (
    !student.semester.isActive
  ) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }


  const passwordMatches =
    await bcrypt.compare(
      password,
      student.passwordHash
    );


  if (!passwordMatches) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }


  const token =
    createStudentToken(
      student.id,
      student.semesterId
    );


  return {
    token,

    student: {
      id:
        student.id,

      email:
        student.email,

      semester: {
        id:
          student.semester.id,

        name:
          student.semester.name,

        slug:
          student.semester.slug,

        ratingsOpen:
          student.semester
            .ratingsOpen,
      },
    },
  };
}


export async function getStudentProfile(
  studentId: string
) {
  const student =
    await prisma.student.findUnique({
      where: {
        id:
          studentId,
      },

      select: {
        id: true,
        email: true,
        isActive: true,

        semester: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            ratingsOpen: true,
          },
        },

        createdAt: true,
      },
    });


  if (!student) {
    return null;
  }


  if (
    !VALID_STUDENT_SEMESTERS.has(
      student.semester.slug
    )
  ) {
    return null;
  }


  if (
    !student.semester.isActive
  ) {
    return null;
  }


  return student;
}