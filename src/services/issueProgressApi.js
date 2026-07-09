import apiClient from "./apiClient.js";

export const issueProgressApi = {
  listByVersion: () => apiClient.get("/api/v1/issue-progress"),
  update: (dbId, payload) =>
    apiClient.request(`/api/v1/issue-progress/${dbId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export default issueProgressApi;
