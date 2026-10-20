/*
  Warnings:

  - Added the required column `variantKey` to the `GeneratedCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeneratedCard" ADD COLUMN     "variantKey" TEXT NOT NULL;
