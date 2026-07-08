import { useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import TestRunCreateModal from "../components/TestRunCreateModal";
import RecentTestRuns from "../components/RecentTestRuns";
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
  getRecentTestRuns,
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
}) {
  const [testRuns, setTestRuns] = useState(initialTestRuns);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_ALL);
  const [menuFilter, setMenuFilter] = useState(MENU_FILTER_ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");

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
  const recentRuns = useMemo(
    () => getRecentTestRuns(testRuns),
    [testRuns]
  );
  const statusDistribution = useMemo(
    () => getStatusDistribution(testRuns),
    [testRuns]
  );

  const handleCreateTestRun = (newTestRun) => {
    setTestRuns((prev) => [...prev, newTestRun]);
    setIsCreateModalOpen(false);
  };

  const handleViewRun = (runId) => {
    setSelectedRunId(runId);
  };

  const handleDeleteRun = (runId) => {
    setTestRuns((prev) => deleteTestRun(prev, runId));

    if (selectedRunId === runId) {
      setSelectedRunId(null);
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
    >
      {selectedTestRun ? (
        <TestRunDetailPage
          testRun={selectedTestRun}
          onBack={() => setSelectedRunId(null)}
          onResultChange={handleResultChange}
          onExcelDownload={handleDetailExcelDownload}
        />
      ) : (
        <>
          <TestRunSummaryCards summaryStats={summaryStats} />
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

          <div className="tr-bottom-grid">
            <RecentTestRuns recentRuns={recentRuns} />
            <TestRunStatusChart distribution={statusDistribution} />
          </div>
        </>
      )}

      <TestRunCreateModal
        isOpen={isCreateModalOpen}
        allTestCases={allTestCases}
        existingRuns={testRuns}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTestRun}
      />
    </MainLayout>
  );
}

export default TestRunListPage;
