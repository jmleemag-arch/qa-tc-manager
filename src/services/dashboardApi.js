import apiClient from "./apiClient.js";

export const dashboardApi = {
  getOverview: (params = {}) => {
    const query = new URLSearchParams();

    if (params.versionId) {
      query.set("versionId", params.versionId);
    }

    if (params.userId) {
      query.set("userId", params.userId);
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get(`/api/v1/dashboard${suffix}`);
  },
  getStats: () => apiClient.get("/api/v1/dashboard/stats"),
};

export default dashboardApi;
