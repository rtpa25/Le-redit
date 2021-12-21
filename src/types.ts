/** @format */

import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

export interface Context {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  req: Request;
  res: Response;
}

export const __prod__ = process.env.NODE_ENV === 'production';
export const COOKIE_NAME = 'qid';
