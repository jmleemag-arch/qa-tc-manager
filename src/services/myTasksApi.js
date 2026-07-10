import apiClient from "./apiClient.js";

export const myTasksApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get(`/api/v1/my-tasks${suffix}`);
  },
  update: (id, userId, payload) => {
    const query = new URLSearchParams({ userId });
    return apiClient.request(`/api/v1/my-tasks/${id}?${query.toString()}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

export default myTasksApi;
