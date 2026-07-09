import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import IssueProgressDashboard from "../components/IssueProgressDashboard";
import TestRunCreateModal from "../components/TestRunCreateModal";
import TestRunStatusChart from "../components/TestRunStatusChart";
import TestRunSummaryCards from "../components/TestRunSummaryCards";
import TestRunTable from "../components/TestRunTable";
import TestRunDetailPage from "./TestRunDetailPage";
import { testCases as allTestCases } from "../../testcases/data/testCaseMockData";
import { MENU_FILTER_ALL, STATUS_FILTER_ALL } from "../constants/testRunConstants";
import {
  issueMenuDistribution,
  issueProgressVersions,
  issueSeverityDistribution,
  recentIssues,
  testRuns as initialTestRuns,
} from "../data/testRunMockData";
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
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
}) {
  const [testRuns, setTestRuns] = useState(initialTestRuns);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_ALL);
  const [menuFilter, setMenuFilter] = useState(MENU_FILTER_ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("issue-progress");
  const [issueStartDate, setIssueStartDate] = useState("2026-05-21");
  const [issueEndDate, setIssueEndDate] = useState("2026-07-30");
  const [issueVersions, setIssueVersions] = useState(issueProgressVersions);
  const [focusedIssueVersion, setFocusedIssueVersion] = useState("");

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
  const filteredIssueVersions = useMemo(
    () =>
      issueVersions.map((version) => ({
        ...version,
        rows: version.rows.filter((row) => {
          const isAfterStart = !issueStartDate || row.dateValue >= issueStartDate;
          const isBeforeEnd = !issueEndDate || row.dateValue <= issueEndDate;

          return isAfterStart && isBeforeEnd;
        }),
      })),
    [issueVersions, issueStartDate, issueEndDate]
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

  const handleSaveIssueWeek = (versionName, weekData) => {
    setIssueVersions((prev) =>
      prev.map((version) => {
        if (version.version !== versionName) {
          return version;
        }

        const rows = version.rows.some((row) => row.id === weekData.id)
          ? version.rows.map((row) => (row.id === weekData.id ? weekData : row))
          : [...version.rows, weekData];

        return {
          ...version,
          rows: [...rows].sort((a, b) => a.dateValue.localeCompare(b.dateValue)),
        };
      })
    );
  };

  const handleDeleteIssueWeek = (versionName, rowId) => {
    setIssueVersions((prev) =>
      prev.map((version) => {
        if (version.version !== versionName) {
          return version;
        }

        return {
          ...version,
          rows: version.rows.filter((row) => row.id !== rowId),
        };
      })
    );
  };

  const handleCreateIssueVersion = (newVersion) => {
    setIssueVersions((prev) =>
      [...prev, newVersion].sort((a, b) => a.version.localeCompare(b.version))
    );
    setFocusedIssueVersion(newVersion.version);
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
          onBack={() => setSelectedRunId(null)}
          onResultChange={handleResultChange}
          onExcelDownload={handleDetailExcelDownload}
        />
      ) : (
        <>
          <TestRunSummaryCards summaryStats={summaryStats} />
          <section className="tr-tab-shell">
            <div className="tr-tab-bar">
              <div className="tr-tabs">
                <button
                  type="button"
                  className={activeTab === "issue-progress" ? "active" : ""}
                  onClick={() => setActiveTab("issue-progress")}
                >
                  이슈 진행 현황
                </button>
                <button
                  type="button"
                  className={activeTab === "run-list" ? "active" : ""}
                  onClick={() => setActiveTab("run-list")}
                >
                  테스트 런 목록
                </button>
              </div>

              {activeTab === "issue-progress" ? (
                <div className="tr-tab-date-range">
                  <input
                    type="date"
                    value={issueStartDate}
                    onChange={(e) => setIssueStartDate(e.target.value)}
                    aria-label="이슈 진행 시작일"
                  />
                  <span>~</span>
                  <input
                    type="date"
                    value={issueEndDate}
                    onChange={(e) => setIssueEndDate(e.target.value)}
                    aria-label="이슈 진행 종료일"
                  />
                </div>
              ) : null}
            </div>

            {activeTab === "issue-progress" ? (
              <IssueProgressDashboard
                versions={filteredIssueVersions}
                allVersions={issueVersions}
                recentRuns={recentRuns}
                menuDistribution={issueMenuDistribution}
                recentIssues={recentIssues}
                severityDistribution={issueSeverityDistribution}
                onSaveIssueWeek={handleSaveIssueWeek}
                onDeleteIssueWeek={handleDeleteIssueWeek}
                onCreateIssueVersion={handleCreateIssueVersion}
                focusedVersionName={focusedIssueVersion}
                onFocusedVersionHandled={() => setFocusedIssueVersion("")}
              />
            ) : (
              <>
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
              </>
            )}
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
