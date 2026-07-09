import apiClient from "./apiClient.js";

export const settingsApi = {
  getAll: () => apiClient.get("/api/v1/settings"),
  getSession: () => apiClient.get("/api/v1/settings/session"),
  getSection: (key) => apiClient.get(`/api/v1/settings/${key}`),
  updateAll: (payload) =>
    apiClient.request("/api/v1/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  updateSection: (key, payload) =>
    apiClient.request(`/api/v1/settings/${key}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export default settingsApi;
