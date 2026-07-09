import {
  AUTH_SESSION_IDLE_TIMEOUT_MS,
  AUTH_SESSION_KEY,
  AUTH_SESSION_ACTIVITY_EVENT,
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

export function createAuthSession(userId) {
  const session = {
    userId,
    expiresAt: Date.now() + AUTH_SESSION_IDLE_TIMEOUT_MS,
    lastActivityAt: Date.now(),
  };

  saveAuthSession(session);

  return session;
}

export function extendAuthSession(session) {
  const nextSession = {
    ...session,
    expiresAt: Date.now() + AUTH_SESSION_IDLE_TIMEOUT_MS,
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
