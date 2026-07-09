import apiClient from "./apiClient.js";

export const testRunApi = {
  list: () => apiClient.get("/api/v1/test-runs"),
  getById: (id) => apiClient.get(`/api/v1/test-runs/${encodeURIComponent(id)}`),
  create: (payload) => apiClient.post("/api/v1/test-runs", payload),
  remove: (id) =>
    apiClient.request(`/api/v1/test-runs/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  updateItemResult: (runId, testCaseId, result) =>
    apiClient.request(
      `/api/v1/test-runs/${encodeURIComponent(runId)}/items/${encodeURIComponent(testCaseId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ result }),
      }
    ),
};

export default testRunApi;
