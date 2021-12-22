/** @format */

import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    hello: String!
    posts: [Post]
    post(id: ID!): Post
    me: User
  }
  type Mutation {
    postCreate(title: String!): Post
    postUpdate(id: ID!, title: String!): Post
    postDelete(id: ID!): Boolean!
    register(options: AuthInput!): AuthOutput
    login(options: AuthInput!): AuthOutput
    logout: Boolean
  }
  type AuthOutput {
    errors: [FieldError]
    user: User
  }
  type FieldError {
    field: String
    message: String
  }
  type Post {
    id: ID!
    title: String!
    createdAt: String!
    updatedAt: String!
  }
  type User {
    id: ID!
    createdAt: String!
    updatedAt: String!
    username: String!
  }
  input AuthInput {
    username: String!
    password: String!
  }
`;
