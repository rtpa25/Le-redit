/** @format */

import { User as _User } from '@prisma/client';
import { Context } from '../types';

export const User = {
  email: async (_parent: _User, _: any, { req, prisma }: Context) => {
    if (!req.session) {
      return '';
    } else {
      const superTokenId = req.session.getUserId();
      const user = await prisma.user.findUnique({
        where: {
          superTokenId: superTokenId,
        },
      });
      if (user.id === _parent.id) {
        return _parent.email;
      } else {
        return '';
      }
    }
  },
};
