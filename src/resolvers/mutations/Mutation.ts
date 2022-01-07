/** @format */

import { postResolvers } from './Post';
import { VoteResolvers } from './Upvote';
export const Mutation = {
  ...postResolvers,
  ...VoteResolvers,
};
