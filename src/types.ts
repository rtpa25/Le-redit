/** @format */

import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { createUserLoader } from './utils/createUserLoader';

export interface Context {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  req: Request;
  res: Response;
  redisClient: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
}

export const __prod__ = process.env.NODE_ENV === 'production';
export const COOKIE_NAME = 'qid';
export const FORGET_PASSWORD_PREFIX = 'forgot-password:';
