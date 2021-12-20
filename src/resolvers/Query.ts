/** @format */

import { Post } from '@prisma/client';
import { Context } from '../types';

interface PostFetchParamType {
  id: string;
}

export const Query = {
  //Query to test connection
  hello: () => {
    return 'Hello World';
  },
  //query to fetch all posts
  posts: async (
    _: any,
    __: any,
    { prisma }: Context
  ): Promise<Post[] | null> => {
    const posts = await prisma.post.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });
    return posts;
  },
  //query to fetch a single post
  post: async (
    _: any,
    { id }: PostFetchParamType,
    { prisma }: Context
  ): Promise<Post | null> => {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    return post;
  },
};
