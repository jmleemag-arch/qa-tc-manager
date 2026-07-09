import apiClient from "./apiClient.js";

export const versionApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();

    if (params.year) {
      query.set("year", String(params.year));
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get(`/api/v1/versions${suffix}`);
  },
  getById: (id) => apiClient.get(`/api/v1/versions/${id}`),
  create: (payload) => apiClient.post("/api/v1/versions", payload),
  update: (id, payload) =>
    apiClient.request(`/api/v1/versions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  updateSubmenus: (id, menus) =>
    apiClient.request(`/api/v1/versions/${id}/submenus`, {
      method: "PUT",
      body: JSON.stringify({ menus }),
    }),
  remove: (id) =>
    apiClient.request(`/api/v1/versions/${id}`, {
      method: "DELETE",
    }),
};

export default versionApi;
