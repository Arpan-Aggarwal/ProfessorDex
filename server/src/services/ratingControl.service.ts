import { prisma } from "../config/database.ts";

export async function getSemesterRatingStatus() {
  return prisma.semester.findMany({
    orderBy: {
      id: "asc",
    },

    include: {
      _count: {
        select: {
          students: true,
          teachers: true,
          ratings: true,
        },
      },
    },
  });
}

export async function setSemesterRatingsOpen(
  semesterId: number,
  ratingsOpen: boolean
) {
  const semester = await prisma.semester.findUnique({
    where: {
      id: semesterId,
    },
  });

  if (!semester) {
    throw new Error("SEMESTER_NOT_FOUND");
  }

  return prisma.semester.update({
    where: {
      id: semesterId,
    },

    data: {
      ratingsOpen,
    },
  });
}