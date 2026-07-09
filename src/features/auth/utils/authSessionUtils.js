import {
  getSessionIdleTimeoutMs,
} from "../../settings/utils/settingsStorage";
import {
  AUTH_SESSION_ACTIVITY_EVENT,
  AUTH_SESSION_KEY,
} from "../constants/authConstants";

export function getStoredAuthSession() {
  const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession);

    if (!session.expiresAt || session.expiresAt <= Date.now()) {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function saveAuthSession(session) {
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function createAuthSession(user) {
  const session = {
    userId: user.userId,
    userName: user.name ?? user.userId,
    role: user.role ?? "tester",
    expiresAt: Date.now() + getSessionIdleTimeoutMs(),
    lastActivityAt: Date.now(),
  };

  saveAuthSession(session);

  return session;
}

export function extendAuthSession(session) {
  const nextSession = {
    ...session,
    expiresAt: Date.now() + getSessionIdleTimeoutMs(),
    lastActivityAt: Date.now(),
  };

  saveAuthSession(nextSession);

  return nextSession;
}

export function getSessionRemainingMs(session) {
  return Math.max(session.expiresAt - Date.now(), 0);
}

export function notifySessionActivity() {
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_ACTIVITY_EVENT));
}
