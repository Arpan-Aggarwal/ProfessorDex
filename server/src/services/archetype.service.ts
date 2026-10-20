import { prisma } from "../config/database.ts";


// =====================================================
// TYPES
// =====================================================

interface ProfessorStats {
  teachingAura: number;
  humourMeter: number;
  classroomVibe: number;
  mentorEnergy: number;
  classroomPresence: number;
}


interface PersonalityInput {
  archetype: string;
  specialMove: string;
  specialMoveDescription: string;
}


// =====================================================
// GET FINALIZED STATS
// =====================================================

async function getFinalStats(
  teacherId: string
): Promise<{
  teacher: {
    id: string;
    name: string;
    department: string;
    photoUrl: string | null;
  };

  stats: ProfessorStats;
}> {

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

        statsFinalized: true,

        finalTeachingAura: true,
        finalHumourMeter: true,
        finalClassroomVibe: true,
        finalMentorEnergy: true,
        finalClassroomPresence: true,
      },
    });


  if (!teacher) {
    throw new Error(
      "TEACHER_NOT_FOUND"
    );
  }


  if (!teacher.statsFinalized) {
    throw new Error(
      "STATS_NOT_FINALIZED"
    );
  }


  if (
    teacher.finalTeachingAura === null ||
    teacher.finalHumourMeter === null ||
    teacher.finalClassroomVibe === null ||
    teacher.finalMentorEnergy === null ||
    teacher.finalClassroomPresence === null
  ) {
    throw new Error(
      "FINAL_STATS_INCOMPLETE"
    );
  }


  return {
    teacher: {
      id: teacher.id,
      name: teacher.name,
      department:
        teacher.department,
      photoUrl:
        teacher.photoUrl,
    },

    stats: {
      teachingAura:
        teacher.finalTeachingAura,

      humourMeter:
        teacher.finalHumourMeter,

      classroomVibe:
        teacher.finalClassroomVibe,

      mentorEnergy:
        teacher.finalMentorEnergy,

      classroomPresence:
        teacher.finalClassroomPresence,
    },
  };
}


// =====================================================
// CALCULATE ARCHETYPE SCORE
// =====================================================

function calculateArchetypeScore(
  stats: ProfessorStats,
  weights: {
    teachingAuraWeight: number;
    humourMeterWeight: number;
    classroomVibeWeight: number;
    mentorEnergyWeight: number;
    classroomPresenceWeight: number;
  }
) {

  const totalWeight =
    weights.teachingAuraWeight +
    weights.humourMeterWeight +
    weights.classroomVibeWeight +
    weights.mentorEnergyWeight +
    weights.classroomPresenceWeight;


  if (totalWeight <= 0) {
    return 0;
  }


  const weightedScore =
    stats.teachingAura *
      weights.teachingAuraWeight +

    stats.humourMeter *
      weights.humourMeterWeight +

    stats.classroomVibe *
      weights.classroomVibeWeight +

    stats.mentorEnergy *
      weights.mentorEnergyWeight +

    stats.classroomPresence *
      weights.classroomPresenceWeight;


  return Number(
    (
      weightedScore /
      totalWeight
    ).toFixed(2)
  );
}


// =====================================================
// GET ARCHETYPE RECOMMENDATIONS
// =====================================================

export async function getArchetypeRecommendations(
  teacherId: string
) {

  const {
    teacher,
    stats,
  } = await getFinalStats(
    teacherId
  );


  const archetypes =
    await prisma.archetype.findMany({
      where: {
        isActive: true,
      },

      include: {
        specialMoves: {
          where: {
            isActive: true,
          },

          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });


  if (archetypes.length === 0) {
    throw new Error(
      "NO_ARCHETYPES"
    );
  }


  const recommendations =
    archetypes.map(
      (archetype) => {

        const score =
          calculateArchetypeScore(
            stats,
            {
              teachingAuraWeight:
                archetype.teachingAuraWeight,

              humourMeterWeight:
                archetype.humourMeterWeight,

              classroomVibeWeight:
                archetype.classroomVibeWeight,

              mentorEnergyWeight:
                archetype.mentorEnergyWeight,

              classroomPresenceWeight:
                archetype.classroomPresenceWeight,
            }
          );


        return {
          id: archetype.id,

          name:
            archetype.name,

          description:
            archetype.description,

          compatibilityScore:
            score,

          specialMoves:
            archetype.specialMoves,
        };
      }
    );


  recommendations.sort(
    (a, b) =>
      b.compatibilityScore -
      a.compatibilityScore
  );


  return {
    teacher,
    stats,

    recommended:
      recommendations[0],

    alternatives:
      recommendations.slice(1),

    allRecommendations:
      recommendations,
  };
}


// =====================================================
// SAVE ADMIN'S FINAL PERSONALITY CHOICE
// =====================================================

export async function saveTeacherPersonality(
  teacherId: string,
  input: PersonalityInput
) {

  const teacher =
    await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },

      select: {
        id: true,
        statsFinalized: true,
      },
    });


  if (!teacher) {
    throw new Error(
      "TEACHER_NOT_FOUND"
    );
  }


  if (!teacher.statsFinalized) {
    throw new Error(
      "STATS_NOT_FINALIZED"
    );
  }


  const archetype =
    input.archetype?.trim();

  const specialMove =
    input.specialMove?.trim();

  const specialMoveDescription =
    input.specialMoveDescription?.trim();


  if (
    !archetype ||
    archetype.length > 100
  ) {
    throw new Error(
      "INVALID_ARCHETYPE"
    );
  }


  if (
    !specialMove ||
    specialMove.length > 150
  ) {
    throw new Error(
      "INVALID_SPECIAL_MOVE"
    );
  }


  if (
    !specialMoveDescription ||
    specialMoveDescription.length > 500
  ) {
    throw new Error(
      "INVALID_MOVE_DESCRIPTION"
    );
  }


  return prisma.teacher.update({
    where: {
      id: teacherId,
    },

    data: {
      archetype,

      specialMove,

      specialMoveDescription,
    },

    select: {
      id: true,
      name: true,

      archetype: true,
      specialMove: true,
      specialMoveDescription: true,

      statsFinalized: true,
    },
  });
}


// =====================================================
// GET SAVED PERSONALITY
// =====================================================

export async function getTeacherPersonality(
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

        statsFinalized: true,

        archetype: true,
        specialMove: true,
        specialMoveDescription: true,
      },
    });


  if (!teacher) {
    throw new Error(
      "TEACHER_NOT_FOUND"
    );
  }


  return teacher;
}