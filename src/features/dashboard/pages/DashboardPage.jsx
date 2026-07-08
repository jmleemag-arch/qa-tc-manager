import MainLayout from "../../../components/layout/MainLayout";
import DashboardSummaryCards from "../components/DashboardSummaryCards";
import DefectStatusCard from "../components/DefectStatusCard";
import DefectTrendCard from "../components/DefectTrendCard";
import MenuTestCaseChart from "../components/MenuTestCaseChart";
import RecentTestCaseCard from "../components/RecentTestCaseCard";
import RecentTestRunCard from "../components/RecentTestRunCard";
import TestRunStatusCard from "../components/TestRunStatusCard";
import {
  defectStatus,
  defectTrend,
  menuTestCaseCounts,
  recentTestCases,
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
    >
      <DashboardSummaryCards summaryCards={summaryCards} />

      <div className="db-middle-grid">
        <TestRunStatusCard testRunStatus={testRunStatus} />
        <RecentTestRunCard
          recentTestRuns={recentTestRuns}
          onMoveToTestRuns={handleMoveToTestRuns}
        />
      </div>

      <div className="db-bottom-grid">
        <MenuTestCaseChart menuTestCaseCounts={menuTestCaseCounts} />
        <RecentTestCaseCard recentTestCases={recentTestCases} />
        <DefectStatusCard defectStatus={defectStatus} />
      </div>

      <DefectTrendCard defectTrend={defectTrend} />
    </MainLayout>
  );
}

export default DashboardPage;
