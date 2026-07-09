import { useState } from "react";
import LoginPage from "./features/auth/pages/LoginPage";
import PlaceholderPage from "./components/layout/PlaceholderPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import TestCaseListPage from "./features/testcases/pages/TestCaseListPage";
import TestRunListPage from "./features/testruns/pages/TestRunListPage";
import SessionExpiryModal from "./features/auth/components/SessionExpiryModal";
import { useIdleSession } from "./features/auth/hooks/useIdleSession";
import { APP_SIDEBAR_MENUS, PAGE_TITLES } from "./constants/appConstants";

const ACTIVE_MENU_DASHBOARD = APP_SIDEBAR_MENUS[0];
const ACTIVE_MENU_TEST_CASES = APP_SIDEBAR_MENUS[1];
const ACTIVE_MENU_TEST_RUNS = APP_SIDEBAR_MENUS[2];

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
  const [activeMenu, setActiveMenu] = useState(ACTIVE_MENU_DASHBOARD);

  const handleLogout = () => {
    logout();
    setActiveMenu(ACTIVE_MENU_DASHBOARD);
  };

  const handleMenuChange = (menu) => {
    recordActivity();
    setActiveMenu(menu);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={login} />;
  }

  const pageProps = {
    loginUser: authSession.userId,
    onLogout: handleLogout,
    activeMenu,
    onMenuChange: handleMenuChange,
    pageTitle: PAGE_TITLES[activeMenu] || activeMenu,
    notifications: [],
    onNotificationClick: () => {},
    onMarkAllNotificationsRead: () => {},
  };

  let pageContent;

  if (activeMenu === ACTIVE_MENU_DASHBOARD) {
    pageContent = <DashboardPage {...pageProps} />;
  } else if (activeMenu === ACTIVE_MENU_TEST_CASES) {
    pageContent = <TestCaseListPage {...pageProps} />;
  } else if (activeMenu === ACTIVE_MENU_TEST_RUNS) {
    pageContent = <TestRunListPage {...pageProps} />;
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
