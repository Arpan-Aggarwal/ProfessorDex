import { prisma } from "../config/database.ts";

export interface FinalStatsInput {
  teachingAura: number;
  humourMeter: number;
  classroomVibe: number;
  mentorEnergy: number;
  classroomPresence: number;

  teachingAuraTitle: string;
  humourMeterTitle: string;
  classroomVibeTitle: string;
  mentorEnergyTitle: string;
  classroomPresenceTitle: string;
}


// =====================================================
// VALIDATE SCORE
// =====================================================

function validateScore(value: number) {
  return (
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 100
  );
}


// =====================================================
// VALIDATE TITLE
// =====================================================

function validateTitle(value: string) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 100
  );
}


// =====================================================
// FINALIZE PROFESSOR STATS
// =====================================================

export async function finalizeTeacherStats(
  teacherId: string,
  input: FinalStatsInput
) {
  const teacher =
    await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },

      include: {
        semesters: {
          include: {
            semester: true,
          },
        },

        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });


  // ---------------------------------------------------
  // Professor must exist
  // ---------------------------------------------------

  if (!teacher) {
    throw new Error(
      "TEACHER_NOT_FOUND"
    );
  }


  // ---------------------------------------------------
  // Professor must have ratings
  // ---------------------------------------------------

  if (teacher._count.ratings === 0) {
    throw new Error(
      "NO_RATINGS"
    );
  }


  // ---------------------------------------------------
  // Ratings must be closed for EVERY semester
  // assigned to this professor
  // ---------------------------------------------------

  const openSemesters =
    teacher.semesters.filter(
      (item) =>
        item.semester.ratingsOpen
    );

  if (openSemesters.length > 0) {
    throw new Error(
      "RATINGS_STILL_OPEN"
    );
  }


  // ---------------------------------------------------
  // Validate all five scores
  // ---------------------------------------------------

  const scores = [
    input.teachingAura,
    input.humourMeter,
    input.classroomVibe,
    input.mentorEnergy,
    input.classroomPresence,
  ];

  if (
    !scores.every(
      (score) =>
        validateScore(score)
    )
  ) {
    throw new Error(
      "INVALID_SCORES"
    );
  }


  // ---------------------------------------------------
  // Validate all five titles
  // ---------------------------------------------------

  const titles = [
    input.teachingAuraTitle,
    input.humourMeterTitle,
    input.classroomVibeTitle,
    input.mentorEnergyTitle,
    input.classroomPresenceTitle,
  ];

  if (
    !titles.every(
      (title) =>
        validateTitle(title)
    )
  ) {
    throw new Error(
      "INVALID_TITLES"
    );
  }


  // ---------------------------------------------------
  // Save finalized values
  // ---------------------------------------------------

  return prisma.teacher.update({
    where: {
      id: teacherId,
    },

    data: {
      finalTeachingAura:
        input.teachingAura,

      finalHumourMeter:
        input.humourMeter,

      finalClassroomVibe:
        input.classroomVibe,

      finalMentorEnergy:
        input.mentorEnergy,

      finalClassroomPresence:
        input.classroomPresence,


      teachingAuraTitle:
        input.teachingAuraTitle.trim(),

      humourMeterTitle:
        input.humourMeterTitle.trim(),

      classroomVibeTitle:
        input.classroomVibeTitle.trim(),

      mentorEnergyTitle:
        input.mentorEnergyTitle.trim(),

      classroomPresenceTitle:
        input.classroomPresenceTitle.trim(),


      ratingCount:
        teacher._count.ratings,

      statsFinalized: true,

      finalizedAt:
        new Date(),
    },

    select: {
      id: true,
      name: true,
      department: true,
      photoUrl: true,

      finalTeachingAura: true,
      finalHumourMeter: true,
      finalClassroomVibe: true,
      finalMentorEnergy: true,
      finalClassroomPresence: true,

      teachingAuraTitle: true,
      humourMeterTitle: true,
      classroomVibeTitle: true,
      mentorEnergyTitle: true,
      classroomPresenceTitle: true,

      ratingCount: true,

      statsFinalized: true,
      finalizedAt: true,
    },
  });
}


// =====================================================
// GET FINALIZED PROFESSOR STATS
// =====================================================

export async function getFinalizedTeacherStats(
  teacherId: string
) {
  const teacher =
    await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },

      select: {
        id: true,
        name: true,
        department: true,
        photoUrl: true,

        finalTeachingAura: true,
        finalHumourMeter: true,
        finalClassroomVibe: true,
        finalMentorEnergy: true,
        finalClassroomPresence: true,

        teachingAuraTitle: true,
        humourMeterTitle: true,
        classroomVibeTitle: true,
        mentorEnergyTitle: true,
        classroomPresenceTitle: true,

        archetype: true,
        specialMove: true,
        specialMoveDescription: true,

        ratingCount: true,

        statsFinalized: true,
        finalizedAt: true,
      },
    });

  if (!teacher) {
    throw new Error(
      "TEACHER_NOT_FOUND"
    );
  }

  return teacher;
}