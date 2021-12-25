/** @format */

import { Context } from '../types';

interface PostParentType {
  text: string;
  creatorId: number;
}
//the name in the export const should match with the parent declaration in the schema
export const Post = {
  textSnippet(parent: PostParentType) {
    return parent.text.slice(0, 50);
  },
  creator: async (parent: PostParentType, _: any, { prisma }: Context) => {
    const { creatorId } = parent;
    const creator = await prisma.user.findUnique({
      where: {
        id: creatorId,
      },
    });

    return creator;
  },
};
