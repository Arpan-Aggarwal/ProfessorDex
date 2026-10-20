/*
  Warnings:

  - A unique constraint covering the columns `[tag]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "tag" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_tag_key" ON "Teacher"("tag");
