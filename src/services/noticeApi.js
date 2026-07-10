import apiClient from "./apiClient.js";

export const noticeApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get(`/api/v1/notices${suffix}`);
  },
  getById: (id) => apiClient.get(`/api/v1/notices/${id}`),
};

export default noticeApi;
