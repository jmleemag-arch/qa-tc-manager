import apiClient from "./apiClient.js";
import { DEMO_USERS } from "../features/auth/constants/authConstants.js";

const FALLBACK_ROLES = {
  tester1: "admin",
  "lee-jumi": "lead",
  "qa-manager": "tester",
};

function loginWithDemoAccount(userId, password) {
  const normalizedUserId = String(userId ?? "").trim();
  const demoUser = DEMO_USERS.find(
    (user) => user.id === normalizedUserId && user.password === password
  );

  if (!demoUser) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return {
    data: {
      userId: demoUser.id,
      name: demoUser.name,
      role: FALLBACK_ROLES[demoUser.id] ?? "tester",
      status: "active",
    },
  };
}

async function login(userId, password) {
  try {
    return await apiClient.post("/api/v1/auth/login", { userId, password });
  } catch {
    return loginWithDemoAccount(userId, password);
  }
}

export const authApi = {
  login,
  getUser: (userId) => apiClient.get(`/api/v1/auth/users/${userId}`),
};

export default authApi;
