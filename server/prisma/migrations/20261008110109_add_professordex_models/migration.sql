-- CreateEnum
CREATE TYPE "RatingCategory" AS ENUM ('TEACHING_AURA', 'HUMOUR_METER', 'CLASSROOM_VIBE', 'MENTOR_ENERGY', 'CLASSROOM_PRESENCE');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Semester" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ratingsOpen" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "privateCodeId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "finalTeachingAura" INTEGER,
    "finalHumourMeter" INTEGER,
    "finalClassroomVibe" INTEGER,
    "finalMentorEnergy" INTEGER,
    "finalClassroomPresence" INTEGER,
    "teachingAuraTitle" TEXT,
    "humourMeterTitle" TEXT,
    "classroomVibeTitle" TEXT,
    "mentorEnergyTitle" TEXT,
    "classroomPresenceTitle" TEXT,
    "archetype" TEXT,
    "specialMove" TEXT,
    "specialMoveDescription" TEXT,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "statsFinalized" BOOLEAN NOT NULL DEFAULT false,
    "finalizedAt" TIMESTAMP(3),
    "officialCardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSemester" (
    "teacherId" TEXT NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherSemester_pkey" PRIMARY KEY ("teacherId","semesterId")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "voteHash" TEXT NOT NULL,
    "teachingAura" INTEGER NOT NULL,
    "humourMeter" INTEGER NOT NULL,
    "classroomVibe" INTEGER NOT NULL,
    "mentorEnergy" INTEGER NOT NULL,
    "classroomPresence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingTitle" (
    "id" SERIAL NOT NULL,
    "category" "RatingCategory" NOT NULL,
    "value" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatingTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Archetype" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "teachingAuraWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "humourMeterWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "classroomVibeWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mentorEnergyWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "classroomPresenceWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Archetype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialMove" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "archetypeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialMove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedCard" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
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
    "imageUrl" TEXT,
    "status" "CardStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "GeneratedCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Semester_slug_key" ON "Semester"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_privateCodeId_key" ON "Student"("privateCodeId");

-- CreateIndex
CREATE INDEX "Student_semesterId_idx" ON "Student"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateCode_codeHash_key" ON "PrivateCode"("codeHash");

-- CreateIndex
CREATE INDEX "PrivateCode_semesterId_idx" ON "PrivateCode"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_officialCardId_key" ON "Teacher"("officialCardId");

-- CreateIndex
CREATE INDEX "Teacher_name_idx" ON "Teacher"("name");

-- CreateIndex
CREATE INDEX "TeacherSemester_semesterId_idx" ON "TeacherSemester"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_voteHash_key" ON "Rating"("voteHash");

-- CreateIndex
CREATE INDEX "Rating_teacherId_idx" ON "Rating"("teacherId");

-- CreateIndex
CREATE INDEX "Rating_semesterId_idx" ON "Rating"("semesterId");

-- CreateIndex
CREATE INDEX "Rating_teacherId_semesterId_idx" ON "Rating"("teacherId", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "RatingTitle_category_value_key" ON "RatingTitle"("category", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Archetype_name_key" ON "Archetype"("name");

-- CreateIndex
CREATE INDEX "SpecialMove_archetypeId_idx" ON "SpecialMove"("archetypeId");

-- CreateIndex
CREATE INDEX "GeneratedCard_teacherId_idx" ON "GeneratedCard"("teacherId");

-- CreateIndex
CREATE INDEX "GeneratedCard_status_idx" ON "GeneratedCard"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedCard_teacherId_version_key" ON "GeneratedCard"("teacherId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_privateCodeId_fkey" FOREIGN KEY ("privateCodeId") REFERENCES "PrivateCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateCode" ADD CONSTRAINT "PrivateCode_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_officialCardId_fkey" FOREIGN KEY ("officialCardId") REFERENCES "GeneratedCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSemester" ADD CONSTRAINT "TeacherSemester_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSemester" ADD CONSTRAINT "TeacherSemester_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialMove" ADD CONSTRAINT "SpecialMove_archetypeId_fkey" FOREIGN KEY ("archetypeId") REFERENCES "Archetype"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedCard" ADD CONSTRAINT "GeneratedCard_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
