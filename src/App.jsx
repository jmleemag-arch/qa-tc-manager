import { useEffect, useState } from "react";
import LoginPage from "./features/auth/pages/LoginPage";
import PlaceholderPage from "./components/layout/PlaceholderPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import DefectListPage from "./features/defects/pages/DefectListPage";
import DefectSearchPage from "./features/defects/pages/DefectSearchPage";
import SettingsPage from "./features/settings/pages/SettingsPage";
import TestCaseListPage from "./features/testcases/pages/TestCaseListPage";
import TestRunListPage from "./features/testruns/pages/TestRunListPage";
import VersionManagementPage from "./features/testcases/pages/VersionManagementPage";
import SessionExpiryModal from "./features/auth/components/SessionExpiryModal";
import { useIdleSession } from "./features/auth/hooks/useIdleSession";
import { useNotifications } from "./hooks/useNotifications";
import { loadAppSettings } from "./features/settings/utils/settingsStorage";
import {
  getMenuIdFromSlug,
  getMenuSlug,
  MENU_IDS,
  PAGE_TITLES,
} from "./constants/appConstants";

function parseHashRoute() {
  const rawHash = window.location.hash.replace(/^#\/?/, "");
  const [rawSlug, rawQuery = ""] = rawHash.split("?");
  const slug = rawSlug || getMenuSlug(MENU_IDS.DASHBOARD);

  return {
    activeMenu: getMenuIdFromSlug(slug),
    routeParams: Object.fromEntries(new URLSearchParams(rawQuery).entries()),
  };
}

function buildHashRoute(menuId, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return `#/${getMenuSlug(menuId)}${queryString ? `?${queryString}` : ""}`;
}

function getInitialRoute() {
  if (window.location.hash) {
    return parseHashRoute();
  }

  return {
    activeMenu: MENU_IDS.DASHBOARD,
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

  const navigateTo = (menuId, params = {}, options = {}) => {
    const nextHash = buildHashRoute(menuId, params);

    if (options.replace) {
      window.history.replaceState(null, "", nextHash);
      setRouteState({ activeMenu: menuId, routeParams: params });
      return;
    }

    if (window.location.hash === nextHash) {
      setRouteState({ activeMenu: menuId, routeParams: params });
      return;
    }

    window.location.hash = nextHash;
  };

  const handleLogout = () => {
    logout();
    navigateTo(MENU_IDS.DASHBOARD, {}, { replace: true });
  };

  const handleMenuChange = (menuId) => {
    recordActivity();

    if (menuId === MENU_IDS.NOTIFICATIONS) {
      navigateTo(MENU_IDS.SETTINGS, { section: "notifications" });
      return;
    }

    if (menuId === MENU_IDS.SETTINGS) {
      navigateTo(MENU_IDS.SETTINGS, {});
      return;
    }

    navigateTo(menuId);
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

  const resolvedActiveMenu =
    activeMenu === MENU_IDS.SETTINGS &&
    routeParams.section === "notifications"
      ? MENU_IDS.NOTIFICATIONS
      : activeMenu;

  const pageProps = {
    loginUser: authSession?.userName ?? authSession?.userId,
    onLogout: handleLogout,
    activeMenu: resolvedActiveMenu,
    onMenuChange: handleMenuChange,
    routeParams,
    onRouteChange: handleRouteChange,
    pageTitle: PAGE_TITLES[resolvedActiveMenu] || resolvedActiveMenu,
    notifications,
    onNotificationClick: (notification) => {
      markNotificationRead(notification.id);
    },
    onMarkAllNotificationsRead: () => {
      markAllNotificationsRead();
    },
  };

  let pageContent;

  switch (activeMenu) {
    case MENU_IDS.DASHBOARD:
      pageContent = <DashboardPage {...pageProps} />;
      break;
    case MENU_IDS.VERSIONS:
      pageContent = <VersionManagementPage {...pageProps} />;
      break;
    case MENU_IDS.TEST_CASES:
      pageContent = <TestCaseListPage {...pageProps} />;
      break;
    case MENU_IDS.TEST_RUNS:
      pageContent = <TestRunListPage {...pageProps} />;
      break;
    case MENU_IDS.DEFECTS_NEW_ISSUES:
      pageContent = <DefectListPage {...pageProps} defectView="new-issues" />;
      break;
    case MENU_IDS.DEFECTS_PROGRESS:
      pageContent = <DefectListPage {...pageProps} defectView="overview" />;
      break;
    case MENU_IDS.DEFECTS_SEARCH:
      pageContent = <DefectSearchPage {...pageProps} />;
      break;
    case MENU_IDS.SETTINGS:
      pageContent = <SettingsPage {...pageProps} />;
      break;
    default:
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
