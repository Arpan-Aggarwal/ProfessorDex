import { prisma } from "../config/database.ts";
import { getArchetypeRecommendations } from "./archetype.service.ts";

// =====================================================
// CARD VARIANTS
// =====================================================

const CARD_VARIANTS = [
  "NEON_BLUE",
  "NEON_PURPLE",
  "CRIMSON",
  "EMERALD",
  "GOLDEN",
  "MIDNIGHT",
];


// =====================================================
// GET NEXT VERSION
// =====================================================

async function getNextCardVersion(
  teacherId: string
) {
  const latest =
    await prisma.generatedCard.findFirst({
      where: {
        teacherId,
      },

      orderBy: {
        version: "desc",
      },

      select: {
        version: true,
      },
    });

  return latest
    ? latest.version + 1
    : 1;
}


// =====================================================
// SELECT VARIANT
// =====================================================

function getVariantForVersion(
  version: number
) {
  const index =
    (version - 1) %
    CARD_VARIANTS.length;

  return CARD_VARIANTS[index];
}


// =====================================================
// GET CARD BUILDER DATA
// =====================================================

export async function getCardBuilderData(
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
        description: true,
        photoUrl: true,

        statsFinalized: true,

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

        officialCardId: true,
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


  if (
    !teacher.teachingAuraTitle ||
    !teacher.humourMeterTitle ||
    !teacher.classroomVibeTitle ||
    !teacher.mentorEnergyTitle ||
    !teacher.classroomPresenceTitle
  ) {
    throw new Error(
      "FINAL_TITLES_INCOMPLETE"
    );
  }


  


  return teacher;

}


// =====================================================
// GENERATE CARD VARIANT
// =====================================================


export async function generateCardVariant(teacherId: string) {
  const teacher = await getCardBuilderData(teacherId);

  // Preserve a complete, previously saved personality.
  let archetype = teacher.archetype;
  let specialMove = teacher.specialMove;
  let specialMoveDescription = teacher.specialMoveDescription;

  // If no complete personality is saved, use the stats-based recommendation.
  if (!archetype || !specialMove || !specialMoveDescription) {
    const recommendations =
      await getArchetypeRecommendations(teacherId);

    const recommended = recommendations.recommended;
    const move = recommended?.specialMoves?.[0];

    if (!recommended) {
      throw new Error("NO_ARCHETYPES");
    }

    if (!move) {
      throw new Error("NO_SPECIAL_MOVES");
    }

    archetype = recommended.name;
    specialMove = move.name;
    specialMoveDescription = move.description;

    // Save the automatic selection so the builder can reuse it.
    await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        archetype,
        specialMove,
        specialMoveDescription,
      },
    });
  }

  const version = await getNextCardVersion(teacherId);
  const variantKey = getVariantForVersion(version);

  return prisma.generatedCard.create({
    data: {
      teacherId,
      version,
      variantKey,

      teachingAura: teacher.finalTeachingAura!,
      humourMeter: teacher.finalHumourMeter!,
      classroomVibe: teacher.finalClassroomVibe!,
      mentorEnergy: teacher.finalMentorEnergy!,
      classroomPresence: teacher.finalClassroomPresence!,

      teachingAuraTitle: teacher.teachingAuraTitle!,
      humourMeterTitle: teacher.humourMeterTitle!,
      classroomVibeTitle: teacher.classroomVibeTitle!,
      mentorEnergyTitle: teacher.mentorEnergyTitle!,
      classroomPresenceTitle: teacher.classroomPresenceTitle!,

      archetype,
      specialMove,
      specialMoveDescription,

      status: "DRAFT",
    },
  });
}


// =====================================================
// GET CARD HISTORY
// =====================================================

export async function getTeacherCardHistory(
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
        officialCardId: true,
      },
    });


  if (!teacher) {
    throw new Error(
      "TEACHER_NOT_FOUND"
    );
  }


  const cards =
    await prisma.generatedCard.findMany({
      where: {
        teacherId,
      },

      orderBy: {
        version: "desc",
      },
    });


  return {
    teacher,
    cards,
  };
}


// =====================================================
// GET SINGLE CARD
// =====================================================

export async function getCardById(
  cardId: string
) {
  const card =
    await prisma.generatedCard.findUnique({
      where: {
        id: cardId,
      },

      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            department: true,
            description: true,
            photoUrl: true,
            officialCardId: true,
          },
        },
      },
    });


  if (!card) {
    throw new Error(
      "CARD_NOT_FOUND"
    );
  }


  return card;
}


// =====================================================
// APPROVE CARD
// =====================================================

export async function approveCard(
  cardId: string
) {
  const card =
    await prisma.generatedCard.findUnique({
      where: {
        id: cardId,
      },
    });


  if (!card) {
    throw new Error(
      "CARD_NOT_FOUND"
    );
  }


  if (
    card.status === "APPROVED"
  ) {
    throw new Error(
      "CARD_ALREADY_APPROVED"
    );
  }


  return prisma.$transaction(
    async (tx) => {

      // Any older approved card becomes rejected.
      await tx.generatedCard.updateMany({
        where: {
          teacherId:
            card.teacherId,

          status:
            "APPROVED",

          id: {
            not: card.id,
          },
        },

        data: {
          status:
            "REJECTED",

          rejectedAt:
            new Date(),

          approvedAt:
            null,
        },
      });


      const approvedCard =
        await tx.generatedCard.update({
          where: {
            id: card.id,
          },

          data: {
            status:
              "APPROVED",

            approvedAt:
              new Date(),

            rejectedAt:
              null,
          },
        });


      await tx.teacher.update({
        where: {
          id:
            card.teacherId,
        },

        data: {
          officialCardId:
            card.id,
        },
      });


      return approvedCard;
    }
  );
}


// =====================================================
// REJECT CARD
// =====================================================

export async function rejectCard(
  cardId: string
) {
  const card =
    await prisma.generatedCard.findUnique({
      where: {
        id: cardId,
      },

      select: {
        id: true,
        teacherId: true,
        status: true,
      },
    });


  if (!card) {
    throw new Error(
      "CARD_NOT_FOUND"
    );
  }


  if (
    card.status === "APPROVED"
  ) {
    throw new Error(
      "CANNOT_REJECT_OFFICIAL_CARD"
    );
  }


  if (
    card.status === "REJECTED"
  ) {
    throw new Error(
      "CARD_ALREADY_REJECTED"
    );
  }


  return prisma.generatedCard.update({
    where: {
      id: cardId,
    },

    data: {
      status:
        "REJECTED",

      rejectedAt:
        new Date(),
    },
  });
}