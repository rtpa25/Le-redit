/** @format */

import { PrismaClient, User } from '@prisma/client';
import DataLoader from 'dataloader';

const prisma = new PrismaClient();

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds as number[],
        },
      },
    });

    const userIdToUser: Record<number, User> = {};
    users.forEach((user) => {
      userIdToUser[user.id] = user;
    });

    const userArray: User[] = [];
    for (let i = 0; i < userIds.length; i++) {
      const uid = userIds[i];
      const user = userIdToUser[uid];
      userArray.push(user);
    }
    return userArray;
  });
