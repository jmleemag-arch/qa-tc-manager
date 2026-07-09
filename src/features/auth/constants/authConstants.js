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
export const AUTH_SESSION_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
export const AUTH_SESSION_WARNING_BEFORE_MS = 60 * 1000;
export const AUTH_SESSION_ACTIVITY_EVENT = "qa-session-activity";

/** @deprecated Use AUTH_SESSION_IDLE_TIMEOUT_MS */
export const AUTH_SESSION_DURATION_MS = AUTH_SESSION_IDLE_TIMEOUT_MS;

export function getUserDisplayName(userId, session = null) {
  if (session?.userName) {
    return session.userName;
  }

  return userId;
}
