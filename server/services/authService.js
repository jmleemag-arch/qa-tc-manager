import { prisma } from "../db.js";

export async function login(userId, password) {
  const normalizedUserId = String(userId ?? "").trim();
  const normalizedPassword = String(password ?? "");

  if (!normalizedUserId || !normalizedPassword) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      userId: normalizedUserId,
      password: normalizedPassword,
      status: "active",
    },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.userId,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

export async function getUserByUserId(userId) {
  const user = await prisma.user.findUnique({
    where: { userId: String(userId ?? "").trim() },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.userId,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}
