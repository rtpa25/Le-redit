/** @format */

import { User as _User } from '@prisma/client';
import { Context } from '../types';

export const User = {
  email: (_parent: _User, _: any, { prisma, req }: Context) => {
    if (req.session.userId === _parent.id) {
      return _parent.email;
    } else {
      return '';
    }
  },
};
