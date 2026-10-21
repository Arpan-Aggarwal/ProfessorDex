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

  const codeToHashMap = new Map<string, string>();

  while (codeToHashMap.size < count) {
    const code = generatePrivateCode(5);
    if (!codeToHashMap.has(code)) {
      codeToHashMap.set(code, hashPrivateCode(code));
    }
  }

  // Check if any candidate hashes already exist in the database
  const candidateHashes = Array.from(codeToHashMap.values());
  const existingRecords = await prisma.privateCode.findMany({
    where: {
      codeHash: { in: candidateHashes },
    },
    select: {
      codeHash: true,
    },
  });

  if (existingRecords.length > 0) {
    const existingHashes = new Set(existingRecords.map((r) => r.codeHash));
    for (const [code, hash] of codeToHashMap.entries()) {
      if (existingHashes.has(hash)) {
        codeToHashMap.delete(code);
      }
    }

    // Refill any that collided with existing database entries
    while (codeToHashMap.size < count) {
      const code = generatePrivateCode(5);
      const hash = hashPrivateCode(code);
      if (!codeToHashMap.has(code)) {
        const inDb = await prisma.privateCode.findUnique({
          where: { codeHash: hash },
        });
        if (!inDb) {
          codeToHashMap.set(code, hash);
        }
      }
    }
  }

  const codes = Array.from(codeToHashMap.keys());

  const databaseRows = codes.map((code) => ({
    codeHash: codeToHashMap.get(code)!,
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