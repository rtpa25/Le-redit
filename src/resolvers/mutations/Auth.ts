/** @format */

import { User } from '@prisma/client';
import { Context, COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../../types';
import argon2 from 'argon2';
import logger from '../../utils/logger';
import { sendEmail } from '../../utils/sendEmail';
import { v4 } from 'uuid';

interface RegisterAuthArgs {
  options: {
    email: string;
    username: string;
    password: string;
  };
}

interface LoginAuthArgs {
  options: {
    username: string;
    password: string;
  };
}

interface UserResponse {
  errors:
    | {
        field: string;
        message: string;
      }[]
    | null;
  user: User | null;
}

interface ChangePasswordInput {
  options: {
    newPassword: string;
    token: string;
  };
}

interface forgotPasswordInput {
  email: string;
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
    { options }: RegisterAuthArgs,
    { prisma, req }: Context
  ): Promise<UserResponse> => {
    const { username, password, email } = options;
    try {
      if (!email.includes('@')) {
        return {
          errors: [
            {
              field: 'email',
              message: 'invalid email',
            },
          ],
          user: null,
        };
      }
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
              field: 'email',
              message: 'user already exist please login',
            },
          ],
          user: null,
        };
      }
      const hashedPassword = await argon2.hash(password);
      const user = await prisma.user.create({
        data: {
          email: email,
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
    { options }: LoginAuthArgs,
    { prisma, req }: Context
  ): Promise<UserResponse> => {
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
  // MUTATION TO SEND EMAIL TO GO TO FORGET PASSWORD PAGE ON FRONTEND
  forgotPassword: async (
    _: any,
    { email }: forgotPasswordInput,
    { prisma, redisClient }: Context
  ): Promise<Boolean> => {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      //the email is not in the db
      return false;
    }
    const token = v4();

    await redisClient.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3 //3days to foget password reset
    );

    sendEmail(
      email,
      `<a href='http://localhost:3000/change-password/${token}'>reset password</a>`
    );
    return true;
  },
  // MUTATION TO CHANGE PASSWORD
  changePassword: async (
    _: any,
    { options }: ChangePasswordInput,
    { redisClient, prisma, req }: Context
  ): Promise<UserResponse> => {
    const { newPassword, token } = options;

    if (newPassword.length <= 4) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length of password must be atleast 4 chars',
          },
        ],
        user: null,
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redisClient.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired',
          },
        ],
        user: null,
      };
    }

    const user = prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exist',
          },
        ],
        user: null,
      };
    }

    const hashedPassword = await argon2.hash(newPassword);
    const newUser = await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        password: hashedPassword,
      },
    });

    await redisClient.del(key);

    //login user after change password
    req.session.userId = newUser.id;

    return {
      errors: null,
      user: newUser,
    };
  },
};
