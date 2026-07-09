import { prisma } from "../db.js";

const NOTIFICATION_TYPE_LABELS = {
  issue_registered: "신규 이슈 등록",
  test_run_complete: "테스트 런 완료",
  version_release: "버전 릴리스",
  mention: "멘션",
  assignee: "담당자 지정",
};

function toNotificationResponse(notification) {
  return {
    id: notification.id,
    title:
      NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type,
    message: notification.message,
    type: notification.type,
    targetType: notification.targetType,
    targetId: notification.targetId,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
    recipientName: notification.user?.name ?? "",
  };
}

async function resolveUserDbId(userId) {
  const user = await prisma.user.findUnique({
    where: { userId: String(userId ?? "").trim() },
  });

  return user?.id ?? null;
}

export async function listNotifications({ userId, limit = 30 } = {}) {
  const dbUserId = await resolveUserDbId(userId);

  if (!dbUserId) {
    return [];
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: dbUserId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: Number(limit) || 30,
  });

  return notifications.map(toNotificationResponse);
}

export async function markNotificationRead(id, userId) {
  const dbUserId = await resolveUserDbId(userId);

  if (!dbUserId) {
    return null;
  }

  const existing = await prisma.notification.findFirst({
    where: {
      id: Number(id),
      userId: dbUserId,
    },
    include: { user: true },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.notification.update({
    where: { id: existing.id },
    data: { isRead: true },
    include: { user: true },
  });

  return toNotificationResponse(updated);
}

export async function markAllNotificationsRead(userId) {
  const dbUserId = await resolveUserDbId(userId);

  if (!dbUserId) {
    return { count: 0 };
  }

  const result = await prisma.notification.updateMany({
    where: {
      userId: dbUserId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return { count: result.count };
}

export async function createNotification({
  userId,
  type,
  message,
  targetType,
  targetId,
}) {
  const dbUserId = await resolveUserDbId(userId);

  if (!dbUserId || !message) {
    return null;
  }

  const notification = await prisma.notification.create({
    data: {
      userId: dbUserId,
      type: type ?? "mention",
      message,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
    },
    include: { user: true },
  });

  return toNotificationResponse(notification);
}

export async function notifyAllActiveUsers({
  type,
  message,
  targetType,
  targetId,
}) {
  const users = await prisma.user.findMany({
    where: { status: "active" },
  });

  const created = [];

  for (const user of users) {
    const notification = await createNotification({
      userId: user.userId,
      type,
      message,
      targetType,
      targetId,
    });

    if (notification) {
      created.push(notification);
    }
  }

  return created;
}
