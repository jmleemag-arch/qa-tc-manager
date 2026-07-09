import apiClient from "./apiClient.js";

export const authApi = {
  login: (userId, password) =>
    apiClient.post("/api/v1/auth/login", { userId, password }),
  getUser: (userId) => apiClient.get(`/api/v1/auth/users/${userId}`),
};

export default authApi;
