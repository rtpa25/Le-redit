/** @format */

import { Post } from '@prisma/client';
import { Context } from '../types';

interface PostFetchParamType {
  id: string;
}

interface PaginatedPosts {
  posts: Post[];
  hasMorePosts: boolean;
}

export const Query = {
  //Query to test connection
  hello: () => {
    return 'Hello World';
  },

  //query to fetch all posts
  posts: async (
    _: any,
    { limit, cursor }: { limit: number; cursor: number },
    { prisma }: Context
  ): Promise<PaginatedPosts> => {
    const reallimit = Math.min(50, limit);
    const realLimitPlusOne = reallimit + 1;
    let posts: string | any[];

    if (cursor) {
      posts = await prisma.post.findMany({
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
        take: realLimitPlusOne,
        skip: 1,
        cursor: {
          id: cursor,
        },
      });
    } else {
      posts = await prisma.post.findMany({
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
        take: realLimitPlusOne,
      });
    }
    const obj = {
      posts: posts.slice(0, reallimit),
      hasMorePosts: posts.length === realLimitPlusOne,
    };

    return obj;
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
  //query to fetch the current user or null if not auth
  me: async (_: any, __: any, { prisma, req }: Context) => {
    if (req.session === undefined) {
      return null;
    }
    const superTokenId = req.session.getUserId();
    const user = await prisma.user.findUnique({
      where: {
        superTokenId: superTokenId,
      },
    });
    return user;
  },
};
