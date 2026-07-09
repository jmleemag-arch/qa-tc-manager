import MainLayout from "../../../components/layout/MainLayout";
import { MENU_IDS } from "../../../constants/appConstants";
import { useDashboard } from "../../../hooks/useDashboard";
import DashboardSummaryCards from "../components/DashboardSummaryCards";
import RecentTestRunCard from "../components/RecentTestRunCard";
import TestRunStatusCard from "../components/TestRunStatusCard";

function DashboardPage({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  pageTitle,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
}) {
  const { summaryCards, testRunStatus, recentTestRuns, loading, error } =
    useDashboard();

  const handleMoveToTestRuns = () => {
    onMenuChange(MENU_IDS.TEST_RUNS);
  };

  return (
    <MainLayout
      loginUser={loginUser}
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={onMenuChange}
      pageTitle={pageTitle}
      notifications={notifications}
      onNotificationClick={onNotificationClick}
      onMarkAllNotificationsRead={onMarkAllNotificationsRead}
    >
      {error ? (
        <p className="db-page-description">대시보드 데이터를 불러오지 못했습니다.</p>
      ) : null}

      {loading ? (
        <p className="db-page-description">대시보드 데이터를 불러오는 중입니다...</p>
      ) : (
        <>
          <DashboardSummaryCards summaryCards={summaryCards} />

          <div className="db-middle-grid">
            <TestRunStatusCard testRunStatus={testRunStatus} />
            <RecentTestRunCard
              recentTestRuns={recentTestRuns}
              onMoveToTestRuns={handleMoveToTestRuns}
            />
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default DashboardPage;
