/** @format */

import { PrismaClient, Upvote } from '@prisma/client';
import DataLoader from 'dataloader';

const prisma = new PrismaClient();

//[{postId: 5, userId: 10}, {postId: 6, userId: 10}]

export const createUpvoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Upvote | null>(
    async (keys) => {
      const userIds: number[] = [];
      const postIds: number[] = [];

      for (let i = 0; i < keys.length; i++) {
        const element = keys[i];
        postIds.push(element.postId);
        userIds.push(element.userId);
      }
      const upvotes = await prisma.upvote.findMany({
        where: {
          postId: {
            in: postIds,
          },
          userId: {
            in: userIds,
          },
        },
      });

      const upvoteIdsToUpvote: Record<string, Upvote> = {};
      upvotes.forEach((upvote) => {
        upvoteIdsToUpvote[`${upvote.userId} | ${upvote.postId}`] = upvote;
      });

      return keys.map(
        (key) => upvoteIdsToUpvote[`${key.userId} | ${key.postId}`]
      );
    }
  );
