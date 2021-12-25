/** @format */

import { Prisma } from '@prisma/client';
import { Context } from '../../types';
import logger from '../../utils/logger';

interface VoteInput {
  options: {
    postId: string;
    value: -1 | 1;
  };
}

export const VoteResolvers = {
  //MUTATION TO VOTE FOR A POST
  vote: async (
    _: any,
    { options }: VoteInput,
    { prisma, req }: Context
  ): Promise<boolean> => {
    const { postId, value } = options;
    try {
      const { userId } = req.session;
      if (!userId) {
        throw new Error('unauthenticated user');
      }
      console.log(postId, userId, value);

      await prisma.upvote.create({
        data: {
          userId: userId,
          postId: parseInt(postId),
          value: value,
        },
      });
      return true;
    } catch (error: any) {
      logger.error(error.message);
      return false;
    }
  },
  //MUTATION TO UNVOTE FOR A POST
  unVote: async (
    _: any,
    postId: number,
    { prisma, req }: Context
  ): Promise<boolean> => {
    try {
      const { userId } = req.session;
      if (!userId) {
        throw new Error('unauthenticated user');
      }

      await prisma.$queryRaw(
        Prisma.sql`
          DELETE FROM "Upvote"
          WHERE "postId"=${postId} AND "userId"=${userId}
        `
      );

      return true;
    } catch (error: any) {
      logger.error(error.message);
      return false;
    }
  },
};
