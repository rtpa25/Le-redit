/** @format */

import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { createUserLoader } from './utils/createUserLoader';

import { SessionRequest } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/lib/build/recipe/session/framework/express';

export interface Context {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  req: SessionRequest;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
}

export const __prod__ = process.env.NODE_ENV === 'production';
export const COOKIE_NAME = 'qid';
export const FORGET_PASSWORD_PREFIX = 'forgot-password:';
