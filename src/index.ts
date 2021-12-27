/** @format */

import { ApolloServer } from 'apollo-server-express';
import 'dotenv/config';
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

const main = async () => {
  // sendEmail('bob@email.com', 'hello');
  const RedisStore = connectRedis(session);

  const redisClient = new Redis({
    port: parseInt(process.env.REDIS_PORT as string),
    host: process.env.REDIS_HOST as string,
    password: process.env.PASSWORD as string,
  });

  const prisma = new PrismaClient();

  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: 'http://localhost:3000',
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
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, //disable access of cookie in frontend
        secure: __prod__, //prod is true in production https server
        sameSite: 'lax', // csrf //TODO: PLEASE GOOGLE THIS
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
