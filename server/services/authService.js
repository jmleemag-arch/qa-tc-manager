import { prisma } from "../db.js";

export async function login(userId, password) {
  const normalizedUserId = String(userId ?? "").trim();

  if (!normalizedUserId || !password) {
    return null;
  }

  const rows = await prisma.$queryRaw`
    SELECT id, user_id as userId, name, role, status
    FROM users
    WHERE user_id = ${normalizedUserId}
      AND password = ${password}
      AND status = 'active'
    LIMIT 1
  `;

  const user = rows[0];

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
