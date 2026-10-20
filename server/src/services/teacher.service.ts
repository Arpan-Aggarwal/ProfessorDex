import { prisma } from "../config/database.ts";

interface CreateTeacherData {
  name: string;
  department: string;
  description?: string;
  photoUrl?: string;
  semesterIds: number[];
}

interface UpdateTeacherData {
  name?: string;
  department?: string;
  description?: string;
  photoUrl?: string;
  semesterIds?: number[];
}

async function validateSemesters(
  semesterIds: number[]
) {
  const uniqueIds = [...new Set(semesterIds)];

  const semesters = await prisma.semester.findMany({
    where: {
      id: {
        in: uniqueIds,
      },
      isActive: true,
    },
  });

  if (semesters.length !== uniqueIds.length) {
    throw new Error("INVALID_SEMESTER");
  }

  return uniqueIds;
}
function generateTeacherTag() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let tag = "PD-";

  for (let i = 0; i < 4; i++) {
    tag +=
      characters[
        Math.floor(
          Math.random() *
          characters.length
        )
      ];
  }

  return tag;
}


async function createUniqueTeacherTag() {
  let tag: string;
  let exists = true;

  do {
    tag = generateTeacherTag();

    const teacher =
      await prisma.teacher.findUnique({
        where: {
          tag,
        },
      });

    exists = Boolean(teacher);
  } while (exists);

  return tag;
}

export async function createTeacher(
  data: CreateTeacherData
) {
  const semesterIds =
    await validateSemesters(
      data.semesterIds
    );

  const tag =
    await createUniqueTeacherTag();

  return prisma.teacher.create({
    data: {
      name: data.name.trim(),
      tag,
      department: data.department.trim(),

      description:
        data.description?.trim() || null,

      photoUrl: data.photoUrl || null,

      semesters: {
        create: semesterIds.map((semesterId) => ({
          semesterId,
        })),
      },
    },

    include: {
      semesters: {
        include: {
          semester: true,
        },
      },
    },
  });
}

export async function getTeachers() {
  return prisma.teacher.findMany({
    orderBy: {
      name: "asc",
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
          cards: true,
        },
      },
    },
  });
}

export async function getTeacherById(
  teacherId: string
) {
  return prisma.teacher.findUnique({
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
          cards: true,
        },
      },
    },
  });
}

export async function updateTeacher(
  teacherId: string,
  data: UpdateTeacherData
) {
  const existingTeacher =
    await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
    });

  if (!existingTeacher) {
    throw new Error("TEACHER_NOT_FOUND");
  }

  let semesterIds: number[] | undefined;

  if (data.semesterIds) {
    semesterIds = await validateSemesters(
      data.semesterIds
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.teacher.update({
      where: {
        id: teacherId,
      },

      data: {
        name:
          data.name !== undefined
            ? data.name.trim()
            : undefined,

        department:
          data.department !== undefined
            ? data.department.trim()
            : undefined,

        description:
          data.description !== undefined
            ? data.description.trim() || null
            : undefined,

        photoUrl:
          data.photoUrl !== undefined
            ? data.photoUrl
            : undefined,
      },
    });

    if (semesterIds !== undefined) {
      await tx.teacherSemester.deleteMany({
        where: {
          teacherId,
        },
      });

      if (semesterIds.length > 0) {
        await tx.teacherSemester.createMany({
          data: semesterIds.map(
            (semesterId) => ({
              teacherId,
              semesterId,
            })
          ),
        });
      }
    }

    return tx.teacher.findUnique({
      where: {
        id: teacherId,
      },

      include: {
        semesters: {
          include: {
            semester: true,
          },
        },
      },
    });
  });
}

export async function deleteTeacher(
  teacherId: string
) {
  const teacher =
    await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
    });

  if (!teacher) {
    throw new Error(
      "TEACHER_NOT_FOUND"
    );
  }

  return prisma.$transaction(
    async (tx) => {

      /*
       * Break the official-card reference first.
       * Generated cards themselves are deleted
       * automatically by onDelete: Cascade.
       */
      if (teacher.officialCardId) {
        await tx.teacher.update({
          where: {
            id: teacherId,
          },

          data: {
            officialCardId: null,
          },
        });
      }

      return tx.teacher.delete({
        where: {
          id: teacherId,
        },
      });
    }
  );
}