/** @format */

import { Post } from '@prisma/client';
import { Context } from '../../types';

interface PostArgs {
  title: string;
  id: string;
}

export const postResolvers = {
  //MUTATION TO CREATE POST
  postCreate: async (
    _: any,
    { title }: PostArgs,
    { prisma }: Context
  ): Promise<Post | null> => {
    const createdPost = await prisma.post.create({
      data: { title: title },
    });
    return createdPost;
  },
  //MUTATION TO UPDATE POST
  postUpdate: async (
    _: any,
    { id, title }: PostArgs,
    { prisma }: Context
  ): Promise<Post | null> => {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!post) {
      return null;
    }
    if (title !== undefined) {
      const updatedPost = await prisma.post.update({
        where: {
          id: Number(id),
        },
        data: { title: title },
      });
      return updatedPost;
    }
    return null;
  },
  //MUTATION TO DELETE POST
  postDelete: async (
    _: any,
    { id }: PostArgs,
    { prisma }: Context
  ): Promise<boolean> => {
    await prisma.post.delete({
      where: { id: Number(id) },
    });
    return true;
  },
};
