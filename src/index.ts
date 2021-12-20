/** @format */

import { ApolloServer } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import logger from './utils/logger';
import { typeDefs } from './schema';
import { Query } from './resolvers/query';

const prisma = new PrismaClient();

const main = async () => {
  const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: {
      Query,
    },
    context: {
      prisma,
    },
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
};

main().catch((e) => {
  logger.error(e);
});
