/*
  Warnings:

  - A unique constraint covering the columns `[postId,userId]` on the table `Upvote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Upvote_postId_userId_key" ON "Upvote"("postId", "userId");
