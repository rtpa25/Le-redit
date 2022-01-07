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
    try {
      if (req.session === undefined) {
        throw new Error('unauthenticated user');
      }
      const { text, title } = options;
      if (text.length <= 2 || title.length <= 2) {
        throw new Error('Please write a valid post');
      }

      const supertokenId = req.session.getUserId();

      const user = await prisma.user.findUnique({
        where: {
          superTokenId: supertokenId,
        },
      });

      const createdPost = await prisma.post.create({
        data: {
          title: title,
          text: text,
          creatorId: user.id,
        },
      });
      return createdPost;
    } catch (error: any) {
      logger.error(error.message);
      return null;
    }
  },
  //MUTATION TO UPDATE POST
  postUpdate: async (
    _: any,
    { id, title, text }: PostArgs,
    { prisma, req }: Context
  ): Promise<Post | null> => {
    if (req.session === undefined) {
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

    const user = await prisma.user.findUnique({
      where: {
        superTokenId: req.session.getUserId(),
      },
    });

    if (!post || !user) {
      return null;
    }

    if (post?.creatorId !== user.id) {
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
  ): Promise<boolean | null> => {
    try {
      if (req.session === undefined) {
        throw new Error('unauthenticated user');
      }

      const post = await prisma.post.findUnique({
        where: {
          id: Number(id),
        },
      });

      const user = await prisma.user.findUnique({
        where: {
          superTokenId: req.session.getUserId(),
        },
      });

      if (!post || !user) {
        return null;
      }

      if (post?.creatorId !== user.id) {
        return null;
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
