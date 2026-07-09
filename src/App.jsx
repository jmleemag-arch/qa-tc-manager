import { useEffect, useState } from "react";
import LoginPage from "./features/auth/pages/LoginPage";
import PlaceholderPage from "./components/layout/PlaceholderPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import TestCaseListPage from "./features/testcases/pages/TestCaseListPage";
import TestRunListPage from "./features/testruns/pages/TestRunListPage";
import {
  AUTH_SESSION_DURATION_MS,
  AUTH_SESSION_KEY,
} from "./features/auth/constants/authConstants";
import { APP_SIDEBAR_MENUS, PAGE_TITLES } from "./constants/appConstants";

const ACTIVE_MENU_DASHBOARD = APP_SIDEBAR_MENUS[0];
const ACTIVE_MENU_TEST_CASES = APP_SIDEBAR_MENUS[1];
const ACTIVE_MENU_TEST_RUNS = APP_SIDEBAR_MENUS[2];

function getStoredAuthSession() {
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

function createAuthSession(userId) {
  const session = {
    userId,
    expiresAt: Date.now() + AUTH_SESSION_DURATION_MS,
  };

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));

  return session;
}

function App() {
  const [authSession, setAuthSession] = useState(() => getStoredAuthSession());
  const [activeMenu, setActiveMenu] = useState(ACTIVE_MENU_DASHBOARD);

  const isLoggedIn = Boolean(authSession);

  useEffect(() => {
    if (!authSession) {
      return undefined;
    }

    const remainingMs = authSession.expiresAt - Date.now();

    const timeoutId = window.setTimeout(() => {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
      setAuthSession(null);
      setActiveMenu(ACTIVE_MENU_DASHBOARD);
    }, Math.max(remainingMs, 0));

    return () => window.clearTimeout(timeoutId);
  }, [authSession]);

  const handleLogin = (userId) => {
    setAuthSession(createAuthSession(userId));
  };

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    setAuthSession(null);
    setActiveMenu(ACTIVE_MENU_DASHBOARD);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const pageProps = {
    loginUser: authSession.userId,
    onLogout: handleLogout,
    activeMenu,
    onMenuChange: setActiveMenu,
    pageTitle: PAGE_TITLES[activeMenu] || activeMenu,
    notifications: [],
    onNotificationClick: () => {},
    onMarkAllNotificationsRead: () => {},
  };

  if (activeMenu === ACTIVE_MENU_DASHBOARD) {
    return <DashboardPage {...pageProps} />;
  }

  if (activeMenu === ACTIVE_MENU_TEST_CASES) {
    return <TestCaseListPage {...pageProps} />;
  }

  if (activeMenu === ACTIVE_MENU_TEST_RUNS) {
    return <TestRunListPage {...pageProps} />;
  }

  return <PlaceholderPage {...pageProps} />;
}

export default App;
