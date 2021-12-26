/** @format */

import { Post } from '@prisma/client';
import { Context } from '../../types';
import logger from '../../utils/logger';

interface PostArgs {
  title: string;
  id: string;
  text: string;
}

interface PostCreateInputArgs {
  options: {
    title: string;
    text: string;
  };
}

export const postResolvers = {
  //MUTATION TO CREATE POST
  postCreate: async (
    _: any,
    { options }: PostCreateInputArgs,
    { prisma, req }: Context
  ): Promise<Post | null> => {
    if (!req.session.userId) {
      throw new Error('unauthenticated user');
    }
    const { text, title } = options;
    if (text.length <= 2 || title.length <= 2) {
      throw new Error('Please write a valid post');
    }
    const createdPost = await prisma.post.create({
      data: {
        title: title,
        text: text,
        creatorId: req.session.userId,
      },
    });
    return createdPost;
  },
  //MUTATION TO UPDATE POST
  postUpdate: async (
    _: any,
    { id, title, text }: PostArgs,
    { prisma, req }: Context
  ): Promise<Post | null> => {
    const { userId } = req.session;
    if (!userId) {
      throw new Error('unauthenticated user');
    }
    if (title === undefined && text === undefined) {
      return null;
    }
    const post = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (post?.creatorId !== userId) {
      return null;
    }

    if (!post) {
      return null;
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: Number(id),
      },
      data: { title: title, text: text },
    });
    return updatedPost;
  },
  //MUTATION TO DELETE POST
  postDelete: async (
    _: any,
    { id }: PostArgs,
    { prisma, req }: Context
  ): Promise<boolean> => {
    try {
      const { userId } = req.session;
      if (!userId) {
        throw new Error('unauthenticated user');
      }
      const post = await prisma.post.findUnique({
        where: { id: Number(id) },
      });
      if (post?.creatorId !== userId) {
        return false;
      }

      await prisma.post.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error: any) {
      logger.error(error.message);
      return false;
    }
  },
};
