-- CreateEnum
CREATE TYPE "SchoolTeacherStatus" AS ENUM ('OPEN', 'PAUSED', 'FORGING', 'COMPLETED');

-- CreateTable
CREATE TABLE "SchoolTeacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" "SchoolTeacherStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolRating" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teachingAura" INTEGER NOT NULL,
    "humourMeter" INTEGER NOT NULL,
    "classroomVibe" INTEGER NOT NULL,
    "mentorEnergy" INTEGER NOT NULL,
    "classroomPresence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolCard" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teachingAura" INTEGER NOT NULL,
    "humourMeter" INTEGER NOT NULL,
    "classroomVibe" INTEGER NOT NULL,
    "mentorEnergy" INTEGER NOT NULL,
    "classroomPresence" INTEGER NOT NULL,
    "teachingAuraTitle" TEXT NOT NULL,
    "humourMeterTitle" TEXT NOT NULL,
    "classroomVibeTitle" TEXT NOT NULL,
    "mentorEnergyTitle" TEXT NOT NULL,
    "classroomPresenceTitle" TEXT NOT NULL,
    "archetype" TEXT NOT NULL,
    "specialMove" TEXT NOT NULL,
    "specialMoveDescription" TEXT NOT NULL,
    "variantKey" TEXT NOT NULL DEFAULT 'NEON_BLUE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolRating_teacherId_idx" ON "SchoolRating"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolCard_teacherId_key" ON "SchoolCard"("teacherId");

-- AddForeignKey
ALTER TABLE "SchoolRating" ADD CONSTRAINT "SchoolRating_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "SchoolTeacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolCard" ADD CONSTRAINT "SchoolCard_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "SchoolTeacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
