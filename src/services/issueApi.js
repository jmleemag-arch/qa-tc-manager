import apiClient from "./apiClient.js";

export const issueApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get(`/api/v1/issues${suffix}`);
  },
  getWeeks: () => apiClient.get("/api/v1/issues/weeks"),
  getAssignees: () => apiClient.get("/api/v1/issues/assignees"),
  getById: (id) => apiClient.get(`/api/v1/issues/${id}`),
  create: (payload) => apiClient.post("/api/v1/issues", payload),
  update: (id, payload) =>
    apiClient.request(`/api/v1/issues/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  sync: () =>
    apiClient.request("/api/v1/issues/sync", {
      method: "POST",
    }),
};

export default issueApi;
