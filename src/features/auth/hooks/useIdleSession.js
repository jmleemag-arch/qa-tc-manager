import { useCallback, useEffect, useRef, useState } from "react";
import { AUTH_SESSION_ACTIVITY_EVENT } from "../constants/authConstants";
import {
  getSessionWarningBeforeMs,
  isSessionWarningEnabled,
  loadSessionSettings,
} from "../../settings/utils/settingsStorage";
import { SETTINGS_SAVED_EVENT } from "../../settings/constants/settingsConstants";
import {
  clearAuthSession,
  createAuthSession,
  extendAuthSession,
  getSessionRemainingMs,
  getStoredAuthSession,
} from "../utils/authSessionUtils";

const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "click",
  "touchstart",
  "scroll",
];
const EXTEND_THROTTLE_MS = 1000;
const MOUSE_MOVE_THROTTLE_MS = 1000;
const SESSION_CHECK_INTERVAL_MS = 1000;

export function useIdleSession() {
  const [authSession, setAuthSession] = useState(() => getStoredAuthSession());
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const lastExtendAtRef = useRef(0);
  const lastMouseMoveAtRef = useRef(0);

  const logout = useCallback(() => {
    clearAuthSession();
    setAuthSession(null);
    setShowExpiryWarning(false);
  }, []);

  const extendSession = useCallback(() => {
    setAuthSession((prev) => {
      if (!prev) {
        return null;
      }

      return extendAuthSession(prev);
    });
    setShowExpiryWarning(false);
    lastExtendAtRef.current = Date.now();
  }, []);

  const recordActivity = useCallback(() => {
    const now = Date.now();

    if (now - lastExtendAtRef.current < EXTEND_THROTTLE_MS) {
      return;
    }

    lastExtendAtRef.current = now;
    setAuthSession((prev) => {
      if (!prev) {
        return null;
      }

      return extendAuthSession(prev);
    });
    setShowExpiryWarning(false);
  }, []);

  const login = useCallback((userId) => {
    loadSessionSettings().finally(() => {
      const session = createAuthSession(userId);
      setAuthSession(session);
      setShowExpiryWarning(false);
      lastExtendAtRef.current = Date.now();
    });
  }, []);

  useEffect(() => {
    loadSessionSettings();
  }, []);

  useEffect(() => {
    if (!authSession) {
      setShowExpiryWarning(false);
      return undefined;
    }

    const handleActivity = () => {
      recordActivity();
    };

    const handleMouseMove = () => {
      const now = Date.now();

      if (now - lastMouseMoveAtRef.current < MOUSE_MOVE_THROTTLE_MS) {
        return;
      }

      lastMouseMoveAtRef.current = now;
      recordActivity();
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener(AUTH_SESSION_ACTIVITY_EVENT, handleActivity);
    window.addEventListener(SETTINGS_SAVED_EVENT, handleActivity);

    const intervalId = window.setInterval(() => {
      const currentSession = getStoredAuthSession();

      if (!currentSession) {
        logout();
        return;
      }

      const remainingMs = getSessionRemainingMs(currentSession);

      if (remainingMs <= 0) {
        logout();
        return;
      }

      setShowExpiryWarning(
        isSessionWarningEnabled() &&
          remainingMs <= getSessionWarningBeforeMs()
      );
      setAuthSession((prev) => {
        if (
          !prev ||
          prev.expiresAt !== currentSession.expiresAt ||
          prev.userId !== currentSession.userId
        ) {
          return currentSession;
        }

        return prev;
      });
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener(AUTH_SESSION_ACTIVITY_EVENT, handleActivity);
      window.removeEventListener(SETTINGS_SAVED_EVENT, handleActivity);
      window.clearInterval(intervalId);
    };
  }, [authSession, logout, recordActivity]);

  return {
    authSession,
    isLoggedIn: Boolean(authSession),
    showExpiryWarning,
    extendSession,
    logout,
    login,
    recordActivity,
  };
}
