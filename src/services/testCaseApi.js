import apiClient from "./apiClient.js";

export const testCaseApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();

    if (params.versionName) {
      query.set("versionName", params.versionName);
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get(`/api/v1/test-cases${suffix}`);
  },
  getById: (id) => apiClient.get(`/api/v1/test-cases/${id}`),
  create: (payload) => apiClient.post("/api/v1/test-cases", payload),
  update: (id, payload) =>
    apiClient.request(`/api/v1/test-cases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (id) =>
    apiClient.request(`/api/v1/test-cases/${id}`, {
      method: "DELETE",
    }),
  bulkDelete: (ids) =>
    apiClient.request("/api/v1/test-cases/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  reorder: (payload) =>
    apiClient.request("/api/v1/test-cases/reorder", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export default testCaseApi;
