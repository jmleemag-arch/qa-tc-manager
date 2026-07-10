import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useAllTestCases } from "../../../hooks/useTestCases";
import { useTestRuns } from "../../../hooks/useTestRuns";
import { useVersions } from "../../../hooks/useVersions";
import TestRunCreateModal from "../components/TestRunCreateModal";
import TestRunStatusChart from "../components/TestRunStatusChart";
import TestRunSummaryCards from "../components/TestRunSummaryCards";
import TestRunTable from "../components/TestRunTable";
import TestRunDetailPage from "./TestRunDetailPage";
import { MENU_FILTER_ALL, STATUS_FILTER_ALL } from "../constants/testRunConstants";
import {
  downloadTestRunDetailExcel,
  downloadTestRunListExcel,
} from "../utils/testRunExcelUtils";
import {
  filterTestRuns,
  findTestRunById,
  getStatusDistribution,
  getSummaryStats,
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_ALL);
  const [menuFilter, setMenuFilter] = useState(MENU_FILTER_ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const { issueVersions } = useVersions();
  const { testCases: allTestCases } = useAllTestCases();
  const {
    testRuns,
    loading: testRunsLoading,
    createTestRun,
    deleteTestRun,
    updateTestRunItemResult,
  } = useTestRuns();
  const selectedRunId = routeParams.runId ?? null;
  const versionFilterName = useMemo(() => {
    if (!routeParams.versionId) {
      return "";
    }

    return (
      issueVersions.find(
        (version) => String(version.id) === String(routeParams.versionId)
      )?.version ?? ""
    );
  }, [issueVersions, routeParams.versionId]);

  useEffect(() => {
    if (routeParams.create === "1") {
      setIsCreateModalOpen(true);
      onRouteChange?.({ create: null }, { replace: true });
    }
  }, [routeParams.create, onRouteChange]);

  const selectedTestRun = useMemo(
    () => findTestRunById(testRuns, selectedRunId),
    [testRuns, selectedRunId]
  );

  const summaryStats = useMemo(() => getSummaryStats(testRuns), [testRuns]);
  const filteredTestRuns = useMemo(() => {
    const base = filterTestRuns(testRuns, {
      statusFilter,
      menuFilter,
      searchText,
      startDate,
      endDate,
    });

    if (!versionFilterName) {
      return base;
    }

    return base.filter((run) => run.targetVersion === versionFilterName);
  }, [
    testRuns,
    statusFilter,
    menuFilter,
    searchText,
    startDate,
    endDate,
    versionFilterName,
  ]);
  const statusDistribution = useMemo(
    () => getStatusDistribution(testRuns),
    [testRuns]
  );

  const handleCreateTestRun = async (payload) => {
    setIsCreating(true);

    try {
      await createTestRun(payload);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("테스트 런 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewRun = (runId) => {
    onRouteChange?.({ runId });
  };

  const handleBackToRunList = () => {
    onRouteChange?.({ runId: null });
  };

  const handleDeleteRun = async (dbId) => {
    try {
      await deleteTestRun(dbId);

      if (selectedTestRun?.dbId === dbId) {
        onRouteChange?.({ runId: null }, { replace: true });
      }
    } catch (error) {
      console.error(error);
      alert("테스트 런 삭제에 실패했습니다.");
    }
  };

  const handleResultChange = async (uid, result) => {
    if (!selectedTestRun?.dbId) {
      return;
    }

    try {
      await updateTestRunItemResult(selectedTestRun.dbId, uid, result);
    } catch (error) {
      console.error(error);
      alert("실행 결과 저장에 실패했습니다.");
    }
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
      {testRunsLoading ? (
        <p className="tr-loading-message">테스트 런 목록을 불러오는 중입니다.</p>
      ) : selectedTestRun ? (
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
        issueVersions={issueVersions}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTestRun}
        isSubmitting={isCreating}
      />
    </MainLayout>
  );
}

export default TestRunListPage;
