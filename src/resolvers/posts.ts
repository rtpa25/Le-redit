/** @format */

import { Context } from '../types';

interface PostParentType {
  text: string;
  creatorId: number;
  id: number;
}
//the name in the export const should match with the parent declaration in the schema
export const Post = {
  textSnippet(parent: PostParentType) {
    return parent.text.slice(0, 50);
  },
  creator: async (parent: PostParentType, _: any, { userLoader }: Context) => {
    const { creatorId } = parent;
    const creator = await userLoader.load(creatorId); //batches all into a single call so really fast
    console.log(creator);

    return creator;
  },
  upvote: async (parent: PostParentType, _: any, { prisma }: Context) => {
    const { id: postID } = parent;
    const upvotes = await prisma.upvote.findMany({
      where: {
        postId: postID,
      },
    });
    return upvotes;
  },
  points: async (parent: PostParentType, _: any, { prisma }: Context) => {
    const { id: postID } = parent;
    const upvotes = await prisma.upvote.findMany({
      where: {
        postId: postID,
      },
    });
    let points = 0;
    upvotes.forEach((upvote: { value: number }) => {
      if (upvote.value === 1) {
        points++;
      } else {
        points--;
      }
    });
    return points;
  },
  voteStatus: async (
    parent: PostParentType,
    _: any,
    { req, upvoteLoader }: Context
  ): Promise<-1 | 1 | null> => {
    const { id: postID } = parent;
    const { userId } = req.session;
    if (!userId) {
      return null;
    }
    const upvote = await upvoteLoader.load({
      userId: userId,
      postId: postID,
    });

    if (upvote) {
      if (upvote.value === 1) {
        return 1;
      } else {
        return -1;
      }
    } else {
      return null;
    }
  },
};
