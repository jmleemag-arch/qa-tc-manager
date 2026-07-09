export const NOTIFICATION_STORAGE_KEY = "qa-manager-notifications";
export const NOTIFICATION_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export const APP_USERS = [
  { id: "tester1", name: "김철수" },
  { id: "lee-jumi", name: "이주미" },
  { id: "qa-manager", name: "QA Manager" },
];

export function getUserDisplayName(userId) {
  return APP_USERS.find((user) => user.id === userId)?.name ?? userId;
}

export function findUserByName(name) {
  const normalizedName = name.trim();

  return APP_USERS.find((user) => user.name === normalizedName) ?? null;
}

export function resolveMentionedUsers(text) {
  const mentionedUsers = [];

  for (const user of APP_USERS) {
    const escapedName = user.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`@${escapedName}(?![\\w가-힣])`);

    if (pattern.test(text)) {
      mentionedUsers.push(user);
    }
  }

  return mentionedUsers;
}

export function filterNotificationsForUser(notifications, userId) {
  if (!userId) {
    return notifications;
  }

  return notifications.filter(
    (notification) =>
      !notification.recipientId || notification.recipientId === userId
  );
}

export function pruneNotifications(notifications) {
  const cutoff = Date.now() - NOTIFICATION_RETENTION_MS;

  return notifications.filter((notification) => {
    const createdAt = new Date(notification.createdAt).getTime();
    return Number.isFinite(createdAt) && createdAt >= cutoff;
  });
}

export function readStoredNotifications() {
  try {
    const rawValue = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue) ? pruneNotifications(parsedValue) : [];
  } catch {
    return [];
  }
}

export function saveStoredNotifications(notifications) {
  window.localStorage.setItem(
    NOTIFICATION_STORAGE_KEY,
    JSON.stringify(pruneNotifications(notifications))
  );
}

export function createNotification({
  type,
  title,
  message,
  recipientId,
  recipientName,
  target,
}) {
  return {
    id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    message,
    recipientId: recipientId ?? null,
    recipientName,
    target,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
}

/** @deprecated Use resolveMentionedUsers instead */
export function extractMentionNames(text) {
  return resolveMentionedUsers(text).map((user) => user.name);
}
