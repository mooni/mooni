import prisma from "./prisma";
import {User} from "../../types/api";

export async function getUser(ethAddress: string): Promise<User> {
  const userData = {
    ethAddress: ethAddress.toLowerCase(),
  };

  let user = await prisma.user.findUnique({
    where: userData,
  });

  if(!user) {
    user = await prisma.user.create({
      data: userData,
    });
  }

  return user;
}

export async function getUserByReferal(referalId: string): Promise<User | null> {
  const userData = {
    referalId,
  };

  let referedUser = await prisma.user.findUnique({
    where: userData,
  });

  return referedUser;
}
