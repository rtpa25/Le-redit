-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_postId_fkey";

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
