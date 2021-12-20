/** @format */

import { ApolloServer } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import logger from './utils/logger';
import { typeDefs } from './schema';
import { Mutation, Query } from './resolvers/z(exporter)';

const prisma = new PrismaClient();

const main = async () => {
  const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: {
      Query,
      Mutation,
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
