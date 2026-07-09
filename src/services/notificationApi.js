import apiClient from "./apiClient.js";

export const notificationApi = {
  list: (userId, limit = 30) => {
    const query = new URLSearchParams({
      userId,
      limit: String(limit),
    });

    return apiClient.get(`/api/v1/notifications?${query.toString()}`);
  },
  markRead: (id, userId) => {
    const query = new URLSearchParams({ userId });
    return apiClient.request(
      `/api/v1/notifications/${id}/read?${query.toString()}`,
      { method: "PATCH" }
    );
  },
  markAllRead: (userId) =>
    apiClient.post("/api/v1/notifications/mark-all-read", { userId }),
};

export default notificationApi;
