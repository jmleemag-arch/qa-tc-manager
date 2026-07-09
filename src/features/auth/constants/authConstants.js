export const DEMO_USER_ID = "tester1";
export const DEMO_USER_PASSWORD = "test1234";

export const DEMO_USERS = [
  { id: "tester1", password: "test1234", name: "김철수" },
  { id: "lee-jumi", password: "test1234", name: "이주미" },
  { id: "qa-manager", password: "test1234", name: "QA Manager" },
];

export const LOGIN_ERROR_MESSAGE =
  "아이디 또는 비밀번호가 올바르지 않습니다.";

export const AUTH_SESSION_KEY = "qa-tc-manager-auth-session";
export const AUTH_SESSION_DURATION_MS = 10 * 60 * 1000;

export function getUserDisplayName(userId) {
  return DEMO_USERS.find((user) => user.id === userId)?.name ?? userId;
}
