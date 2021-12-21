/** @format */

import { authResolvers } from './Auth';
import { postResolvers } from './Post';
export const Mutation = {
  ...postResolvers,
  ...authResolvers,
};
