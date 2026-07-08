import { useState } from "react";
import LoginPage from "./features/auth/pages/LoginPage";
import PlaceholderPage from "./components/layout/PlaceholderPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import TestCaseListPage from "./features/testcases/pages/TestCaseListPage";
import TestRunListPage from "./features/testruns/pages/TestRunListPage";
import { DEMO_USER_ID } from "./features/auth/constants/authConstants";
import { PAGE_TITLES } from "./constants/appConstants";

const ACTIVE_MENU_DASHBOARD = "대시보드";
const ACTIVE_MENU_TEST_CASES = "테스트 케이스";
const ACTIVE_MENU_TEST_RUNS = "테스트 런";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState(ACTIVE_MENU_DASHBOARD);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveMenu(ACTIVE_MENU_DASHBOARD);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const pageProps = {
    loginUser: DEMO_USER_ID,
    onLogout: handleLogout,
    activeMenu,
    onMenuChange: setActiveMenu,
    pageTitle: PAGE_TITLES[activeMenu] || activeMenu,
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
