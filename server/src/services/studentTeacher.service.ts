import { prisma } from "../config/database.ts";
import { createVoteHash } from "../utils/voteHash.ts";

export async function getStudentTeachers(
  studentId: string,
  semesterId: number
) {
  const teachers = await prisma.teacher.findMany({
    where: {
      isActive: true,

      semesters: {
        some: {
          semesterId,
        },
      },
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      department: true,
      description: true,
      photoUrl: true,
    },
  });

  if (teachers.length === 0) {
    return [];
  }

  const teacherHashes = teachers.map((teacher) => ({
    teacherId: teacher.id,
    voteHash: createVoteHash(
      studentId,
      teacher.id
    ),
  }));

  const ratings = await prisma.rating.findMany({
    where: {
      voteHash: {
        in: teacherHashes.map(
          (item) => item.voteHash
        ),
      },
    },

    select: {
      voteHash: true,
    },
  });

  const ratedHashes = new Set(
    ratings.map((rating) => rating.voteHash)
  );

  return teachers.map((teacher) => {
    const hash = teacherHashes.find(
      (item) =>
        item.teacherId === teacher.id
    )!.voteHash;

    return {
      ...teacher,
      rated: ratedHashes.has(hash),
    };
  });
}

export async function getStudentTeacherById(
  studentId: string,
  semesterId: number,
  teacherId: string
) {
  const teacher = await prisma.teacher.findFirst({
    where: {
      id: teacherId,
      isActive: true,

      semesters: {
        some: {
          semesterId,
        },
      },
    },

    select: {
      id: true,
      name: true,
      department: true,
      description: true,
      photoUrl: true,
    },
  });

  if (!teacher) {
    return null;
  }

  const voteHash = createVoteHash(
    studentId,
    teacher.id
  );

  const existingRating =
    await prisma.rating.findUnique({
      where: {
        voteHash,
      },

      select: {
        id: true,
      },
    });

  return {
    ...teacher,
    rated: Boolean(existingRating),
  };
}