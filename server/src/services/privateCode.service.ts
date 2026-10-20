import { prisma } from "../config/database.ts";

import {
  generatePrivateCode,
  hashPrivateCode,
} from "../utils/privateCode.ts";

export async function generateCodes(
  semesterId: number,
  count: number
) {
  const semester = await prisma.semester.findUnique({
    where: {
      id: semesterId,
    },
  });

  if (!semester || !semester.isActive) {
    throw new Error("SEMESTER_NOT_FOUND");
  }

  if (count < 1 || count > 500) {
    throw new Error("INVALID_COUNT");
  }

  const semesterLabel =
    semester.slug.replace("sem-", "");

  const generatedCodes = new Set<string>();

  while (generatedCodes.size < count) {
    generatedCodes.add(
      generatePrivateCode(semesterLabel)
    );
  }

  const codes = [...generatedCodes];

  const databaseRows = codes.map((code) => ({
    codeHash: hashPrivateCode(code),
    semesterId,
  }));

  await prisma.privateCode.createMany({
    data: databaseRows,
  });

  return {
    semester: {
      id: semester.id,
      name: semester.name,
      slug: semester.slug,
    },

    count: codes.length,

    codes,
  };
}

export async function getPrivateCodes(
  semesterId?: number
) {
  return prisma.privateCode.findMany({
    where:
      semesterId !== undefined
        ? {
            semesterId,
          }
        : undefined,

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      semesterId: true,
      isUsed: true,
      usedAt: true,
      createdAt: true,

      semester: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function deletePrivateCode(
  codeId: string
) {
  const code = await prisma.privateCode.findUnique({
    where: {
      id: codeId,
    },
  });

  if (!code) {
    throw new Error("CODE_NOT_FOUND");
  }

  if (code.isUsed) {
    throw new Error("CODE_ALREADY_USED");
  }

  await prisma.privateCode.delete({
    where: {
      id: codeId,
    },
  });
}