import apiClient from "./apiClient.js";

export const dashboardApi = {
  getStats: () => apiClient.get("/api/v1/dashboard/stats"),
};

export default dashboardApi;
