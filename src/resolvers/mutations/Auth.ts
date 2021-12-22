/** @format */

import { User } from '@prisma/client';
import { Context, COOKIE_NAME } from '../../types';
import argon2 from 'argon2';
import logger from '../../utils/logger';

interface AuthArgs {
  options: {
    username: string;
    password: string;
  };
}

interface AuthOutput {
  errors:
    | {
        field: string;
        message: string;
      }[]
    | null;
  user: User | null;
}

declare module 'express-session' {
  interface Session {
    userId: number;
  }
}

export const authResolvers = {
  //MUTATION TO REGISTER
  register: async (
    _: any,
    { options }: AuthArgs,
    { prisma, req }: Context
  ): Promise<AuthOutput> => {
    const { username, password } = options;
    try {
      if (username.length <= 2) {
        return {
          errors: [
            {
              field: 'username',
              message: 'username must be greated that 2 characters',
            },
          ],
          user: null,
        };
      }
      if (password.length <= 4) {
        return {
          errors: [
            {
              field: 'password',
              message: 'password must be greated that 4 characters',
            },
          ],
          user: null,
        };
      }
      const userExistence = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });

      if (userExistence !== null) {
        return {
          errors: [
            {
              field: 'username',
              message: 'user already exist please login',
            },
          ],
          user: null,
        };
      }
      const hashedPassword = await argon2.hash(password);
      const user = await prisma.user.create({
        data: {
          username: username,
          password: hashedPassword,
        },
      });
      //store user id session
      // this will set a cookie on the user from the server
      // keep them logged in
      req.session.userId = user.id;
      return {
        errors: null,
        user: user,
      };
    } catch (error: any) {
      logger.error(error.message);
      return {
        errors: [
          {
            field: 'password',
            message: 'Either you messed up or we',
          },
        ],
        user: null,
      };
    }
  },
  //MUTATION TO LOGIN
  login: async (
    _: any,
    { options }: AuthArgs,
    { prisma, req }: Context
  ): Promise<AuthOutput> => {
    //check is the user is in db
    const { username, password } = options;
    try {
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
      if (!user) {
        return {
          errors: [
            {
              field: 'username',
              message: 'username does not exist',
            },
          ],
          user: null,
        };
      }
      //check if password is valid
      const valid = await argon2.verify(user.password, password);
      if (!valid) {
        return {
          errors: [
            {
              field: 'password',
              message: 'incorrect credentials',
            },
          ],
          user: null,
        };
      }

      req.session.userId = user.id;

      //return responce

      return {
        errors: null,
        user: user,
      };
    } catch (error: any) {
      console.log(error.message);
      return {
        errors: [
          {
            field: 'password',
            message: 'Either you messed up or we',
          },
        ],
        user: null,
      };
    }
  },
  //MUTATION TO LOGOUT
  logout: async (_: any, __: any, { req, res }: Context): Promise<Boolean> => {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          logger.error(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  },
};
