/** @format */

import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    hello: String!
    posts: [Post!]!
  }
  type Post {
    id: ID!
    title: String!
    createdAt: String!
    updatedAt: String!
  }
`;
