import { prisma } from "../config/database.ts";
import type { RatingCategory } from "../generated/prisma/client.ts";


// =====================================================
// HELPER: CONVERT 1–5 AVERAGE TO 0–100 SCORE
// =====================================================

function toScore(
  average: number | null
) {
  if (average === null) {
    return null;
  }

  return Math.round(average * 20);
}


// =====================================================
// HELPER: GET NEAREST RATING TITLE VALUE
// =====================================================

function nearestRatingValue(
  average: number
) {
  return Math.max(
    1,
    Math.min(
      5,
      Math.round(average)
    )
  );
}


// =====================================================
// GET ALL PROFESSORS FOR ADMIN STATS REVIEW
// =====================================================

export async function getTeachersForStatsReview() {
  return prisma.teacher.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      department: true,
      photoUrl: true,

      statsFinalized: true,
      finalizedAt: true,

      _count: {
        select: {
          ratings: true,
        },
      },

      semesters: {
        select: {
          semester: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}


// =====================================================
// GET PROFESSOR STATS PREVIEW
// =====================================================

export async function getTeacherStatsPreview(
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
        finalizedAt: true,
      },
    });

  if (!teacher) {
    throw new Error(
      "TEACHER_NOT_FOUND"
    );
  }


  // ---------------------------------------------------
  // Calculate averages from ALL semesters
  // ---------------------------------------------------

  const aggregate =
    await prisma.rating.aggregate({
      where: {
        teacherId,
      },

      _count: {
        _all: true,
      },

      _avg: {
        teachingAura: true,
        humourMeter: true,
        classroomVibe: true,
        mentorEnergy: true,
        classroomPresence: true,
      },
    });


  const totalRatings =
    aggregate._count._all;


  // ---------------------------------------------------
  // No ratings yet
  // ---------------------------------------------------

  if (totalRatings === 0) {
    return {
      teacher,
      totalRatings: 0,
      stats: null,
    };
  }


  // ---------------------------------------------------
  // Load all possible category titles
  // ---------------------------------------------------

  const titles =
    await prisma.ratingTitle.findMany({
      where: {
        isActive: true,
      },
    });


  // ---------------------------------------------------
  // Find suggested title based on average
  // ---------------------------------------------------

  function findTitle(
    category: RatingCategory,
    average: number
  ) {
    const value =
      nearestRatingValue(
        average
      );

    return (
      titles.find(
        (title) =>
          title.category === category &&
          title.value === value
      ) ?? null
    );
  }


  // ---------------------------------------------------
  // Extract averages
  // ---------------------------------------------------

  const teachingAverage =
    aggregate._avg.teachingAura!;

  const humourAverage =
    aggregate._avg.humourMeter!;

  const vibeAverage =
    aggregate._avg.classroomVibe!;

  const mentorAverage =
    aggregate._avg.mentorEnergy!;

  const presenceAverage =
    aggregate._avg.classroomPresence!;


  // ---------------------------------------------------
  // Return preview
  // ---------------------------------------------------

  return {
    teacher,

    totalRatings,

    stats: {
      teachingAura: {
        average: Number(
          teachingAverage.toFixed(2)
        ),

        score:
          toScore(
            teachingAverage
          ),

        suggestedTitle:
          findTitle(
            "TEACHING_AURA",
            teachingAverage
          ),
      },


      humourMeter: {
        average: Number(
          humourAverage.toFixed(2)
        ),

        score:
          toScore(
            humourAverage
          ),

        suggestedTitle:
          findTitle(
            "HUMOUR_METER",
            humourAverage
          ),
      },


      classroomVibe: {
        average: Number(
          vibeAverage.toFixed(2)
        ),

        score:
          toScore(
            vibeAverage
          ),

        suggestedTitle:
          findTitle(
            "CLASSROOM_VIBE",
            vibeAverage
          ),
      },


      mentorEnergy: {
        average: Number(
          mentorAverage.toFixed(2)
        ),

        score:
          toScore(
            mentorAverage
          ),

        suggestedTitle:
          findTitle(
            "MENTOR_ENERGY",
            mentorAverage
          ),
      },


      classroomPresence: {
        average: Number(
          presenceAverage.toFixed(2)
        ),

        score:
          toScore(
            presenceAverage
          ),

        suggestedTitle:
          findTitle(
            "CLASSROOM_PRESENCE",
            presenceAverage
          ),
      },
    },
  };
}