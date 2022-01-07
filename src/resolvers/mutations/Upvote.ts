/** @format */

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
      if (!req.session) {
        throw new Error('unauthenticated user');
      }

      const superTokenId = req.session.getUserId();
      const user = await prisma.user.findUnique({
        where: {
          superTokenId: superTokenId,
        },
      });
      const userId = user.id;

      const upvotes = await prisma.upvote.findMany({
        where: {
          postId: parseInt(postId),
          userId: userId,
        },
      });
      //user has never voted on this post
      if (upvotes.length === 0) {
        const vote = await prisma.upvote.create({
          data: {
            userId: userId,
            postId: parseInt(postId),
            value: value,
          },
        });
        console.log(vote);
      } //user has voted before on this post
      else {
        const voteValue = upvotes[0].value;
        if (voteValue !== value) {
          await prisma.upvote.updateMany({
            where: {
              postId: parseInt(postId),
              userId: userId,
            },
            data: {
              value: value,
            },
          });
        } else if (voteValue === value) {
          return false;
        }
      }

      return true;
    } catch (error: any) {
      logger.error(error.message);
      return false;
    }
  },
  //MUTATION TO UNVOTE FOR A POST
  unVote: async (
    _: any,
    { postId }: any,
    { prisma, req }: Context
  ): Promise<boolean> => {
    try {
      if (!req.session) {
        throw new Error('unauthenticated user');
      }

      const superTokenId = req.session.getUserId();
      const user = await prisma.user.findUnique({
        where: {
          superTokenId: superTokenId,
        },
      });
      const userId = user.id;

      await prisma.upvote.delete({
        where: {
          postId_userId: {
            postId: postId,
            userId: userId,
          },
        },
      });

      return true;
    } catch (error: any) {
      logger.error(error.message);
      return false;
    }
  },
};
