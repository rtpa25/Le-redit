/** @format */

import { ApolloServer } from 'apollo-server-express';
import 'dotenv-safe/config';
import { PrismaClient } from '@prisma/client';
import logger from './utils/logger';
import { typeDefs } from './schema';
import { Mutation, Post, Query, User } from './resolvers/z(exporter)';
import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { Context, COOKIE_NAME, __prod__ } from './types';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { createUserLoader } from './utils/createUserLoader';
import { createUpvoteLoader } from './utils/createUpvoteLoader';

export const prisma = new PrismaClient();
const main = async () => {
  const RedisStore = connectRedis(session);

  const redisClient = new Redis({
    port: parseInt(process.env.REDIS_PORT as string),
    host: process.env.REDIS_HOST as string,
    password: process.env.PASSWORD as string,
  });

  const app = express();
  app.set('trust proxy', 1);
  app.use(
    cors({
      credentials: true,
      origin: ['http://localhost:3000', 'https://www.etherapp.social'],
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        secure: __prod__,
        sameSite: 'lax',
        domain: __prod__ && 'etherapp.social',
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET as string,
      resave: false, //to avoid continuous ping to redis
    })
  );

  const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: {
      Query,
      Mutation,
      Post,
      User,
    },
    context: ({ req, res }): Context => ({
      req,
      res,
      prisma,
      redisClient,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        // options
      }),
    ],
  });

  await server.start();

  server.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(process.env.PORT, () => {
    logger.info(`gql path is http://localhost:4000${server.graphqlPath}`);
  });
};

main().catch((e: any) => {
  logger.error(e.message);
});
