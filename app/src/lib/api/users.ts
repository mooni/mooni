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

export async function getUserByReferral(referralId: string): Promise<User | null> {
  const userData = {
    referralId,
  };

  let referredUser = await prisma.user.findUnique({
    where: userData,
  });

  return referredUser;
}
