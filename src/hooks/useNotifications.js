import { useCallback, useEffect, useState } from "react";
import notificationApi from "../services/notificationApi.js";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    setLoading(true);

    try {
      const response = await notificationApi.list(userId);
      setNotifications(response.data ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = useCallback(
    async (notificationId) => {
      if (!userId) {
        return;
      }

      await notificationApi.markRead(notificationId, userId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    },
    [userId]
  );

  const markAllRead = useCallback(async () => {
    if (!userId) {
      return;
    }

    await notificationApi.markAllRead(userId);
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, [userId]);

  return {
    notifications,
    loading,
    refresh,
    markRead,
    markAllRead,
  };
}

export default useNotifications;
