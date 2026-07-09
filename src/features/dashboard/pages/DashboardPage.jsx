import MainLayout from "../../../components/layout/MainLayout";
import DashboardSummaryCards from "../components/DashboardSummaryCards";
import RecentTestRunCard from "../components/RecentTestRunCard";
import TestRunStatusCard from "../components/TestRunStatusCard";
import {
  recentTestRuns,
  summaryCards,
  testRunStatus,
} from "../data/dashboardMockData";

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
  const handleMoveToTestRuns = () => {
    onMenuChange("테스트 런");
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
      <DashboardSummaryCards summaryCards={summaryCards} />

      <div className="db-middle-grid">
        <TestRunStatusCard testRunStatus={testRunStatus} />
        <RecentTestRunCard
          recentTestRuns={recentTestRuns}
          onMoveToTestRuns={handleMoveToTestRuns}
        />
      </div>
    </MainLayout>
  );
}

export default DashboardPage;
