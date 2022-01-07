/** @format */

import { PrismaClient } from '@prisma/client';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import 'dotenv-safe/config';
import express from 'express';
import supertokens from 'supertokens-node';
import { errorHandler, middleware } from 'supertokens-node/framework/express';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { Mutation, Post, Query, User } from './resolvers/z(exporter)';
import { typeDefs } from './schema';
import { Context } from './types';
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { createUserLoader } from './utils/createUserLoader';
import logger from './utils/logger';

export const prisma = new PrismaClient();
const main = async () => {
  const app = express();

  supertokens.init({
    framework: 'express',
    supertokens: {
      connectionURI: process.env.CONNECTION_URI,
      apiKey: process.env.API_KEY_SUPERTOKEN,
    },
    appInfo: {
      appName: 'ether',
      apiDomain: 'http://localhost:4000',
      websiteDomain: 'http://localhost:3000',
    },
    recipeList: [
      EmailPassword.init({
        signUpFeature: {
          formFields: [
            {
              id: 'username',
            },
          ],
        },
        override: {
          apis: (originalImplementation) => {
            return {
              ...originalImplementation,
              signUpPOST: async function (input) {
                if (originalImplementation.signUpPOST === undefined) {
                  throw Error('Should never come here');
                }
                // First we call the original implementation of signUpPOST.
                const response = await originalImplementation.signUpPOST(input);

                // Post sign up response, we check if it was successful
                if (response.status === 'OK') {
                  const { id, email } = response.user;
                  const formFields = input.formFields;
                  await prisma.user.create({
                    data: {
                      username: formFields[2].value,
                      email: email,
                      superTokenId: id,
                    },
                  });
                }
                return response;
              },
            };
          },
        },
      }), // initializes signin / sign up features
      Session.init(), // initializes session features
    ],
  });

  // app.set('trust proxy', 1);

  app.use(
    cors({
      origin: ['http://localhost:3000'],
      allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
      credentials: true,
    })
  );

  app.use(middleware());

  app.use('/graphql', verifySession({ sessionRequired: false }) as any);

  const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: {
      Query,
      Mutation,
      Post,
      User,
    },
    context: ({ req, res }, verifySession): Context => {
      return {
        req,
        res,
        prisma,
        userLoader: createUserLoader(),
        upvoteLoader: createUpvoteLoader(),
      };
    },
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

  app.use(errorHandler());

  app.listen(process.env.PORT, () => {
    logger.info(`gql path is http://localhost:4000${server.graphqlPath}`);
  });
};

main().catch((e: Error) => {
  logger.error(e.message);
});
