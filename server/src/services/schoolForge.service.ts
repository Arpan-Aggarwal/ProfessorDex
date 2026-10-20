import { Prisma } from "../generated/prisma/client.ts";
import { prisma } from "../config/database.ts";

const categories = [
  ["teachingAura", "TEACHING_AURA", "teachingAuraTitle", "teachingAuraWeight"],
  ["humourMeter", "HUMOUR_METER", "humourMeterTitle", "humourMeterWeight"],
  ["classroomVibe", "CLASSROOM_VIBE", "classroomVibeTitle", "classroomVibeWeight"],
  ["mentorEnergy", "MENTOR_ENERGY", "mentorEnergyTitle", "mentorEnergyWeight"],
  ["classroomPresence", "CLASSROOM_PRESENCE", "classroomPresenceTitle", "classroomPresenceWeight"],
] as const;

type StatKey = (typeof categories)[number][0];

const variants = [
  "NEON_BLUE",
  "NEON_PURPLE",
  "CRIMSON",
  "EMERALD",
  "GOLDEN",
  "MIDNIGHT",
];

export class SchoolForgeError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "SchoolForgeError";
  }
}

export async function forgeSchoolCard(teacherId: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // Lock the teacher against further rating submissions.
          // This is rolled back automatically if forging fails.
          const locked = await tx.schoolTeacher.updateMany({
            where: {
              id: teacherId,
              status: { in: ["OPEN", "PAUSED"] },
            },
            data: { status: "FORGING" },
          });

          if (locked.count !== 1) {
            const teacher = await tx.schoolTeacher.findUnique({
              where: { id: teacherId },
              select: { status: true },
            });

            if (!teacher) {
              throw new SchoolForgeError(404, "School teacher not found.");
            }

            throw new SchoolForgeError(
              409,
              "This teacher is already being forged or has a completed card."
            );
          }

          const aggregate = await tx.schoolRating.aggregate({
            where: { teacherId },
            _count: { _all: true },
            _avg: {
              teachingAura: true,
              humourMeter: true,
              classroomVibe: true,
              mentorEnergy: true,
              classroomPresence: true,
            },
          });

          const ratingCount = aggregate._count._all;

          if (ratingCount < 5) {
            throw new SchoolForgeError(
              400,
              `At least 5 ratings are required. Currently: ${ratingCount}.`
            );
          }

          const titles = await tx.ratingTitle.findMany({
            where: { isActive: true },
          });

          const stats = {} as Record<StatKey, number>;
          const chosenTitles: Record<string, string> = {};

          for (const [key, category, titleField] of categories) {
            const average = aggregate._avg[key];

            if (average === null) {
              throw new SchoolForgeError(
                400,
                `Missing ratings for ${key}.`
              );
            }

            stats[key] = Math.round(average * 20);

            const nearest = Math.max(
              1,
              Math.min(5, Math.round(average))
            );

            const title = titles.find(
              (item) =>
                item.category === category &&
                item.value === nearest
            );

            if (!title) {
              throw new SchoolForgeError(
                422,
                `No active rating title configured for ${category}, level ${nearest}.`
              );
            }

            chosenTitles[titleField] = title.title;
          }

          const archetypes = await tx.archetype.findMany({
            where: { isActive: true },
            include: {
              specialMoves: {
                where: { isActive: true },
                orderBy: { id: "asc" },
              },
            },
          });

          const candidates = archetypes
            .filter((item) => item.specialMoves.length > 0)
            .map((item) => {
              let weighted = 0;
              let totalWeight = 0;

              for (const [key, , , weightKey] of categories) {
                const weight = item[weightKey];
                weighted += stats[key] * weight;
                totalWeight += weight;
              }

              return {
                archetype: item,
                score:
                  totalWeight > 0
                    ? weighted / totalWeight
                    : 0,
              };
            })
            .sort(
              (a, b) =>
                b.score - a.score ||
                a.archetype.name.localeCompare(b.archetype.name)
            );

          if (!candidates.length) {
            throw new SchoolForgeError(
              422,
              "No active archetype with an active special move is configured."
            );
          }

          const selected = candidates[0].archetype;

          // Deterministic selection from the winning archetype's moves.
          const seed = Array.from(teacherId).reduce(
            (sum, char) => sum + char.charCodeAt(0),
            0
          );

          const move =
            selected.specialMoves[
              seed % selected.specialMoves.length
            ];

          const card = await tx.schoolCard.create({
            data: {
              teacherId,
              ...stats,
              teachingAuraTitle: chosenTitles.teachingAuraTitle,
              humourMeterTitle: chosenTitles.humourMeterTitle,
              classroomVibeTitle: chosenTitles.classroomVibeTitle,
              mentorEnergyTitle: chosenTitles.mentorEnergyTitle,
              classroomPresenceTitle:
                chosenTitles.classroomPresenceTitle,
              archetype: selected.name,
              specialMove: move.name,
              specialMoveDescription: move.description,
              variantKey: variants[seed % variants.length],
            },
          });

          await tx.schoolTeacher.update({
            where: { id: teacherId },
            data: { status: "COMPLETED" },
          });

          return {
            card,
            ratingCount,
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
          timeout: 15000,
        }
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        if (attempt < 2) continue;

        throw new SchoolForgeError(
          409,
          "Concurrent rating or status change. Please retry forging."
        );
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new SchoolForgeError(
          409,
          "A card already exists for this school teacher."
        );
      }

      throw error;
    }
  }

  throw new SchoolForgeError(409, "Could not complete forging.");
}