import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { issueProgressVersions } from "../../defects/data/defectMockData";
import { readIssueVersions } from "../../defects/utils/issueVersionStorage";
import TestRunCreateModal from "../components/TestRunCreateModal";
import TestRunStatusChart from "../components/TestRunStatusChart";
import TestRunSummaryCards from "../components/TestRunSummaryCards";
import TestRunTable from "../components/TestRunTable";
import TestRunDetailPage from "./TestRunDetailPage";
import { testCases as allTestCases } from "../../testcases/data/testCaseMockData";
import { MENU_FILTER_ALL, STATUS_FILTER_ALL } from "../constants/testRunConstants";
import { testRuns as initialTestRuns } from "../data/testRunMockData";
import {
  downloadTestRunDetailExcel,
  downloadTestRunListExcel,
} from "../utils/testRunExcelUtils";
import {
  deleteTestRun,
  filterTestRuns,
  findTestRunById,
  getStatusDistribution,
  getSummaryStats,
  updateTestRunCaseResult,
} from "../utils/testRunUtils";

function TestRunListPage({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  pageTitle,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  routeParams = {},
  onRouteChange,
}) {
  const [testRuns, setTestRuns] = useState(initialTestRuns);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_ALL);
  const [menuFilter, setMenuFilter] = useState(MENU_FILTER_ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [issueVersions, setIssueVersions] = useState(() =>
    readIssueVersions(issueProgressVersions)
  );
  const selectedRunId = routeParams.runId ?? null;

  const selectedTestRun = useMemo(
    () => findTestRunById(testRuns, selectedRunId),
    [testRuns, selectedRunId]
  );

  const summaryStats = useMemo(() => getSummaryStats(testRuns), [testRuns]);
  const filteredTestRuns = useMemo(
    () =>
      filterTestRuns(testRuns, {
        statusFilter,
        menuFilter,
        searchText,
        startDate,
        endDate,
      }),
    [testRuns, statusFilter, menuFilter, searchText, startDate, endDate]
  );
  const statusDistribution = useMemo(
    () => getStatusDistribution(testRuns),
    [testRuns]
  );

  useEffect(() => {
    if (isCreateModalOpen) {
      setIssueVersions(readIssueVersions(issueProgressVersions));
    }
  }, [isCreateModalOpen]);

  const handleCreateTestRun = (newTestRun) => {
    setTestRuns((prev) => [...prev, newTestRun]);
    setIsCreateModalOpen(false);
  };

  const handleViewRun = (runId) => {
    onRouteChange?.({ runId });
  };

  const handleBackToRunList = () => {
    onRouteChange?.({ runId: null });
  };

  const handleDeleteRun = (runId) => {
    setTestRuns((prev) => deleteTestRun(prev, runId));

    if (selectedRunId === runId) {
      onRouteChange?.({ runId: null }, { replace: true });
    }
  };

  const handleResultChange = (uid, result) => {
    if (!selectedRunId) {
      return;
    }

    setTestRuns((prev) =>
      updateTestRunCaseResult(prev, selectedRunId, uid, result)
    );
  };

  const handleListExcelDownload = () => {
    downloadTestRunListExcel(filteredTestRuns);
  };

  const handleDetailExcelDownload = () => {
    if (!selectedTestRun) {
      return;
    }

    downloadTestRunDetailExcel(selectedTestRun);
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
      {selectedTestRun ? (
        <TestRunDetailPage
          testRun={selectedTestRun}
          onBack={handleBackToRunList}
          onResultChange={handleResultChange}
          onExcelDownload={handleDetailExcelDownload}
        />
      ) : (
        <>
          <TestRunSummaryCards summaryStats={summaryStats} />
          <section className="tr-tab-shell">
            <TestRunTable
              testRuns={filteredTestRuns}
              hasRegisteredRuns={testRuns.length > 0}
              statusFilter={statusFilter}
              menuFilter={menuFilter}
              startDate={startDate}
              endDate={endDate}
              searchText={searchText}
              onCreateClick={() => setIsCreateModalOpen(true)}
              onExcelDownloadClick={handleListExcelDownload}
              onViewRun={handleViewRun}
              onDeleteRun={handleDeleteRun}
              onStatusFilterChange={setStatusFilter}
              onMenuFilterChange={setMenuFilter}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onSearchChange={setSearchText}
              onSearchSubmit={() => {}}
            />

            <div className="tr-bottom-grid tr-bottom-grid-single">
              <TestRunStatusChart distribution={statusDistribution} />
            </div>
          </section>
        </>
      )}

      <TestRunCreateModal
        isOpen={isCreateModalOpen}
        allTestCases={allTestCases}
        existingRuns={testRuns}
        issueVersions={issueVersions}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTestRun}
      />
    </MainLayout>
  );
}

export default TestRunListPage;
