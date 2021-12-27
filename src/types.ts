/** @format */

import { Prisma, PrismaClient, User } from '@prisma/client';
import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export interface Context {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  req: Request;
  res: Response;
  redisClient: Redis;
  userLoader: DataLoader<number, User>;
}

export const __prod__ = process.env.NODE_ENV === 'production';
export const COOKIE_NAME = 'qid';
export const FORGET_PASSWORD_PREFIX = 'forgot-password:';
