/** @format */

import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    hello: String!
    posts(limit: Int!, cursor: Int): PaginatedPosts
    post(id: ID!): Post
    me: User
  }
  type Mutation {
    postCreate(options: PostInput!): Post
    postUpdate(id: ID!, title: String!): Post
    postDelete(id: ID!): Boolean!
    register(options: SignupAuthInput!): AuthOutput
    login(options: SigninAuthInput!): AuthOutput
    logout: Boolean
    forgotPassword(email: String!): Boolean!
    changePassword(options: ChangePasswordInput!): AuthOutput
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
    text: String!
    textSnippet: String!
    createdAt: String!
    updatedAt: String!
    creatorId: ID!
    creator: User!
    points: Int!
  }
  type PaginatedPosts {
    posts: [Post]
    hasMorePosts: Boolean!
  }
  type User {
    id: ID!
    createdAt: String!
    updatedAt: String!
    username: String!
    email: String!
    posts: [Post!]
  }
  input SignupAuthInput {
    email: String!
    username: String!
    password: String!
  }
  input SigninAuthInput {
    username: String!
    password: String!
  }
  input ChangePasswordInput {
    token: String!
    newPassword: String!
  }
  input PostInput {
    title: String!
    text: String!
  }
`;
