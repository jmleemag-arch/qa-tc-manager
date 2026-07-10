import apiClient from "./apiClient.js";

export const testCaseApi = {
  list: (params = {}) => {
    if (params.versionId) {
      return apiClient.get(`/api/v1/versions/${params.versionId}/test-cases`);
    }

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
  remove: (id, params = {}) => {
    const query = new URLSearchParams();

    if (params.versionId) {
      query.set("versionId", params.versionId);
    } else if (params.versionName) {
      query.set("versionName", params.versionName);
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";

    return apiClient.request(`/api/v1/test-cases/${id}${suffix}`, {
      method: "DELETE",
    });
  },
  bulkDelete: (ids, params = {}) =>
    apiClient.request("/api/v1/test-cases/bulk-delete", {
      method: "POST",
      body: JSON.stringify({
        ids,
        versionId: params.versionId,
        versionName: params.versionName,
      }),
    }),
  reorder: (payload) =>
    apiClient.request("/api/v1/test-cases/reorder", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export default testCaseApi;
