/** @format */

import { authResolvers } from './Auth';
import { postResolvers } from './Post';
import { VoteResolvers } from './Upvote';
export const Mutation = {
  ...postResolvers,
  ...authResolvers,
  ...VoteResolvers,
};
