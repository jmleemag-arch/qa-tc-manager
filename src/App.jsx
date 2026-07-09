import { useEffect, useState } from "react";
import LoginPage from "./features/auth/pages/LoginPage";
import PlaceholderPage from "./components/layout/PlaceholderPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import DefectListPage from "./features/defects/pages/DefectListPage";
import SettingsPage from "./features/settings/pages/SettingsPage";
import TestCaseListPage from "./features/testcases/pages/TestCaseListPage";
import TestRunListPage from "./features/testruns/pages/TestRunListPage";
import SessionExpiryModal from "./features/auth/components/SessionExpiryModal";
import { useIdleSession } from "./features/auth/hooks/useIdleSession";
import { useNotifications } from "./hooks/useNotifications";
import { loadAppSettings } from "./features/settings/utils/settingsStorage";
import { APP_SIDEBAR_MENUS, PAGE_TITLES } from "./constants/appConstants";

const ACTIVE_MENU_DASHBOARD = APP_SIDEBAR_MENUS[0];
const ACTIVE_MENU_TEST_CASES = APP_SIDEBAR_MENUS[1];
const ACTIVE_MENU_TEST_RUNS = APP_SIDEBAR_MENUS[2];
const ACTIVE_MENU_DEFECTS = APP_SIDEBAR_MENUS[3];
const ACTIVE_MENU_SETTINGS = APP_SIDEBAR_MENUS[5];

const MENU_SLUGS = [
  "dashboard",
  "testcases",
  "testruns",
  "defects",
  "reports",
  "settings",
];

function getMenuSlug(menu) {
  const menuIndex = APP_SIDEBAR_MENUS.indexOf(menu);
  return MENU_SLUGS[menuIndex] ?? MENU_SLUGS[0];
}

function getMenuFromSlug(slug) {
  const menuIndex = MENU_SLUGS.indexOf(slug);
  return APP_SIDEBAR_MENUS[menuIndex] ?? ACTIVE_MENU_DASHBOARD;
}

function parseHashRoute() {
  const rawHash = window.location.hash.replace(/^#\/?/, "");
  const [rawSlug, rawQuery = ""] = rawHash.split("?");
  const slug = rawSlug || getMenuSlug(ACTIVE_MENU_DASHBOARD);

  return {
    activeMenu: getMenuFromSlug(slug),
    routeParams: Object.fromEntries(new URLSearchParams(rawQuery).entries()),
  };
}

function buildHashRoute(menu, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();

  return `#/${getMenuSlug(menu)}${queryString ? `?${queryString}` : ""}`;
}

function getInitialRoute() {
  if (window.location.hash) {
    return parseHashRoute();
  }

  return {
    activeMenu: ACTIVE_MENU_DASHBOARD,
    routeParams: {},
  };
}

function App() {
  const {
    authSession,
    isLoggedIn,
    showExpiryWarning,
    extendSession,
    logout,
    login,
    recordActivity,
  } = useIdleSession();
  const [routeState, setRouteState] = useState(getInitialRoute);
  const { activeMenu, routeParams } = routeState;
  const {
    notifications,
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
  } = useNotifications(authSession?.userId);

  useEffect(() => {
    loadAppSettings();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRouteState(parseHashRoute());
    };

    window.addEventListener("hashchange", handleHashChange);

    if (!window.location.hash) {
      window.history.replaceState(
        null,
        "",
        buildHashRoute(activeMenu, routeParams)
      );
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [activeMenu, routeParams]);

  const navigateTo = (menu, params = {}, options = {}) => {
    const nextHash = buildHashRoute(menu, params);

    if (options.replace) {
      window.history.replaceState(null, "", nextHash);
      setRouteState({ activeMenu: menu, routeParams: params });
      return;
    }

    if (window.location.hash === nextHash) {
      setRouteState({ activeMenu: menu, routeParams: params });
      return;
    }

    window.location.hash = nextHash;
  };

  const handleLogout = () => {
    logout();
    navigateTo(ACTIVE_MENU_DASHBOARD, {}, { replace: true });
  };

  const handleMenuChange = (menu) => {
    recordActivity();
    navigateTo(menu);
  };

  const handleRouteChange = (params, options = {}) => {
    const nextParams = {
      ...routeParams,
      ...params,
    };

    Object.keys(nextParams).forEach((key) => {
      if (
        nextParams[key] === undefined ||
        nextParams[key] === null ||
        nextParams[key] === ""
      ) {
        delete nextParams[key];
      }
    });

    recordActivity();
    navigateTo(activeMenu, nextParams, options);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={login} />;
  }

  const pageProps = {
    loginUser: authSession?.userName ?? authSession?.userId,
    onLogout: handleLogout,
    activeMenu,
    onMenuChange: handleMenuChange,
    routeParams,
    onRouteChange: handleRouteChange,
    pageTitle: PAGE_TITLES[activeMenu] || activeMenu,
    notifications,
    onNotificationClick: (notification) => {
      markNotificationRead(notification.id);
    },
    onMarkAllNotificationsRead: () => {
      markAllNotificationsRead();
    },
  };

  let pageContent;

  if (activeMenu === ACTIVE_MENU_DASHBOARD) {
    pageContent = <DashboardPage {...pageProps} />;
  } else if (activeMenu === ACTIVE_MENU_TEST_CASES) {
    pageContent = <TestCaseListPage {...pageProps} />;
  } else if (activeMenu === ACTIVE_MENU_TEST_RUNS) {
    pageContent = <TestRunListPage {...pageProps} />;
  } else if (activeMenu === ACTIVE_MENU_DEFECTS) {
    pageContent = <DefectListPage {...pageProps} />;
  } else if (activeMenu === ACTIVE_MENU_SETTINGS) {
    pageContent = <SettingsPage {...pageProps} />;
  } else {
    pageContent = <PlaceholderPage {...pageProps} />;
  }

  return (
    <>
      {pageContent}
      <SessionExpiryModal
        isOpen={showExpiryWarning}
        onExtend={extendSession}
        onLogout={handleLogout}
      />
    </>
  );
}

export default App;
