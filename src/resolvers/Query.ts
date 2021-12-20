/** @format */

import { Context } from '../types';

export const Query = {
  //Query to test connection
  hello: () => {
    return 'Hello World';
  },
  //query to fetch posts
  posts: async (_: any, __: any, { prisma }: Context) => {
    const posts = await prisma.post.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });
    return posts;
  },
};
