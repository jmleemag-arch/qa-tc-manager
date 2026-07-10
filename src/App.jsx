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
import MyTasksPage from "./features/tasks/pages/MyTasksPage";
import NoticeListPage from "./features/notices/pages/NoticeListPage";
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
  return parseRouteSlug(rawHash);
}

function parsePathRoute() {
  const rawPath = window.location.pathname.replace(/^\/?/, "");
  const rawSearch = window.location.search.replace(/^\?/, "");
  return parseRouteSlug(`${rawPath}${rawSearch ? `?${rawSearch}` : ""}`);
}

function parseCurrentRoute() {
  if (window.location.hash) {
    return parseHashRoute();
  }

  if (window.location.pathname !== "/") {
    return parsePathRoute();
  }

  return {
    activeMenu: MENU_IDS.DASHBOARD,
    routeParams: {},
  };
}

function parseRouteSlug(rawRoute) {
  const [rawSlug, rawQuery = ""] = rawRoute.split("?");
  const slug = rawSlug || getMenuSlug(MENU_IDS.DASHBOARD);
  const versionTestCasesMatch = slug.match(/^versions\/([^/]+)\/test-cases$/);

  if (versionTestCasesMatch) {
    return {
      activeMenu: MENU_IDS.TEST_CASES,
      routeParams: {
        ...Object.fromEntries(new URLSearchParams(rawQuery).entries()),
        versionId: versionTestCasesMatch[1],
      },
    };
  }

  return {
    activeMenu: getMenuIdFromSlug(slug),
    routeParams: Object.fromEntries(new URLSearchParams(rawQuery).entries()),
  };
}

function buildRoute(menuId, params = {}) {
  const searchParams = new URLSearchParams();
  const routeParams = { ...params };

  let slug = getMenuSlug(menuId);
  let routePrefix = "#/";

  if (menuId === MENU_IDS.TEST_CASES && routeParams.versionId) {
    slug = `versions/${routeParams.versionId}/test-cases`;
    routePrefix = "/";
    delete routeParams.versionId;
  }

  Object.entries(routeParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return `${routePrefix}${slug}${queryString ? `?${queryString}` : ""}`;
}

function getInitialRoute() {
  return parseCurrentRoute();
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
    const handleRouteChange = () => {
      setRouteState(parseCurrentRoute());
    };

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);

    if (!window.location.hash && window.location.pathname === "/") {
      window.history.replaceState(
        null,
        "",
        buildRoute(activeMenu, routeParams)
      );
    }

    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [activeMenu, routeParams]);

  const navigateTo = (menuId, params = {}, options = {}) => {
    const nextRoute = buildRoute(menuId, params);

    if (options.replace) {
      window.history.replaceState(null, "", nextRoute);
      setRouteState({ activeMenu: menuId, routeParams: params });
      return;
    }

    if (
      nextRoute.startsWith("#") &&
      window.location.hash === nextRoute
    ) {
      setRouteState({ activeMenu: menuId, routeParams: params });
      return;
    }

    if (!nextRoute.startsWith("#")) {
      const currentPath = `${window.location.pathname}${window.location.search}`;

      if (currentPath !== nextRoute || window.location.hash) {
        window.history.pushState(null, "", nextRoute);
      }

      setRouteState({ activeMenu: menuId, routeParams: params });
      return;
    }

    window.location.hash = nextRoute;
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
    authUserId: authSession?.userId,
    onLogout: handleLogout,
    activeMenu: resolvedActiveMenu,
    onMenuChange: handleMenuChange,
    navigateToMenu: navigateTo,
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
    case MENU_IDS.NOTICES:
      pageContent = <NoticeListPage {...pageProps} />;
      break;
    case MENU_IDS.MY_TASKS:
      pageContent = <MyTasksPage {...pageProps} />;
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
