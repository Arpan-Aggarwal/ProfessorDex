import { prisma } from "../config/database.ts";
import { createVoteHash } from "../utils/voteHash.ts";

export async function getRatingOptions() {
  const options =
    await prisma.ratingTitle.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          category: "asc",
        },
        {
          value: "asc",
        },
      ],
    });

  return {
    TEACHING_AURA: options.filter(
      (item) =>
        item.category ===
        "TEACHING_AURA"
    ),

    HUMOUR_METER: options.filter(
      (item) =>
        item.category ===
        "HUMOUR_METER"
    ),

    CLASSROOM_VIBE: options.filter(
      (item) =>
        item.category ===
        "CLASSROOM_VIBE"
    ),

    MENTOR_ENERGY: options.filter(
      (item) =>
        item.category ===
        "MENTOR_ENERGY"
    ),

    CLASSROOM_PRESENCE: options.filter(
      (item) =>
        item.category ===
        "CLASSROOM_PRESENCE"
    ),
  };
}

interface RatingInput {
  teachingAura: number;
  humourMeter: number;
  classroomVibe: number;
  mentorEnergy: number;
  classroomPresence: number;
}

export async function submitRating(
  studentId: string,
  semesterId: number,
  teacherId: string,
  input: RatingInput
) {
  const semester =
    await prisma.semester.findUnique({
      where: {
        id: semesterId,
      },
    });

  if (
    !semester ||
    !semester.isActive
  ) {
    throw new Error(
      "SEMESTER_NOT_FOUND"
    );
  }

  if (!semester.ratingsOpen) {
    throw new Error(
      "RATINGS_CLOSED"
    );
  }

  const teacher =
    await prisma.teacher.findFirst({
      where: {
        id: teacherId,
        isActive: true,

        semesters: {
          some: {
            semesterId,
          },
        },
      },
    });

  if (!teacher) {
    throw new Error(
      "TEACHER_NOT_AVAILABLE"
    );
  }

  const values = [
    input.teachingAura,
    input.humourMeter,
    input.classroomVibe,
    input.mentorEnergy,
    input.classroomPresence,
  ];

  const valid = values.every(
    (value) =>
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 5
  );

  if (!valid) {
    throw new Error(
      "INVALID_RATING_VALUES"
    );
  }

  const voteHash = createVoteHash(
    studentId,
    teacherId
  );

  const existing =
    await prisma.rating.findUnique({
      where: {
        voteHash,
      },
    });

  if (existing) {
    throw new Error(
      "ALREADY_RATED"
    );
  }

  try {
    const rating =
      await prisma.rating.create({
        data: {
          teacherId,
          semesterId,
          voteHash,

          teachingAura:
            input.teachingAura,

          humourMeter:
            input.humourMeter,

          classroomVibe:
            input.classroomVibe,

          mentorEnergy:
            input.mentorEnergy,

          classroomPresence:
            input.classroomPresence,
        },

        select: {
          id: true,
          teacherId: true,
          createdAt: true,
        },
      });

    return rating;
  } catch (error: any) {
    // Handles two simultaneous submissions
    // producing the same unique voteHash.
    if (error?.code === "P2002") {
      throw new Error(
        "ALREADY_RATED"
      );
    }

    throw error;
  }
}