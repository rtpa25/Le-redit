/** @format */

import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    hello: String!
    posts: [Post]
    post(id: ID!): Post
  }
  type Mutation {
    postCreate(title: String!): Post
    postUpdate(id: ID!, title: String!): Post
    postDelete(id: ID!): Boolean!
  }
  type Post {
    id: ID!
    title: String!
    createdAt: String!
    updatedAt: String!
  }
`;
