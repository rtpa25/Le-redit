/*
  Warnings:

  - Added the required column `value` to the `Upvote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Upvote" ADD COLUMN     "value" INTEGER NOT NULL;
