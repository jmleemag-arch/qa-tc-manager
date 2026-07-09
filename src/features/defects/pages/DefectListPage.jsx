import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import IssueProgressDashboard from "../components/IssueProgressDashboard";
import NewRegisteredIssuesSection from "../components/NewRegisteredIssuesSection";
import {
  issueMenuDistribution,
  issueSeverityDistribution,
  recentIssues,
} from "../data/defectMockData";
import { useVersions } from "../../../hooks/useVersions";

function DefectListPage({
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
  const {
    issueVersions: apiIssueVersions,
    loading: versionsLoading,
    createVersion,
    deleteVersionByName,
  } = useVersions();
  const [issueStartDate, setIssueStartDate] = useState("2026-05-21");
  const [issueEndDate, setIssueEndDate] = useState("2026-07-30");
  const [localRowsByVersion, setLocalRowsByVersion] = useState({});
  const [focusedIssueVersion, setFocusedIssueVersion] = useState("");
  const activeView =
    routeParams.view === "new-issues" ? "new-issues" : "overview";

  const issueVersions = useMemo(
    () =>
      apiIssueVersions.map((version) => ({
        ...version,
        rows: localRowsByVersion[version.version] ?? version.rows ?? [],
      })),
    [apiIssueVersions, localRowsByVersion]
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

  const handleViewChange = (view) => {
    onRouteChange?.({ view: view === "overview" ? null : view });
  };

  const handleSaveIssueWeek = (versionName, weekData) => {
    setLocalRowsByVersion((prev) => {
      const currentRows = prev[versionName] ?? [];
      const rows = currentRows.some((row) => row.id === weekData.id)
        ? currentRows.map((row) => (row.id === weekData.id ? weekData : row))
        : [...currentRows, weekData];

      return {
        ...prev,
        [versionName]: [...rows].sort((a, b) =>
          a.dateValue.localeCompare(b.dateValue)
        ),
      };
    });
  };

  const handleDeleteIssueWeek = (versionName, rowId) => {
    setLocalRowsByVersion((prev) => ({
      ...prev,
      [versionName]: (prev[versionName] ?? []).filter((row) => row.id !== rowId),
    }));
  };

  const handleCreateIssueVersion = async (newVersion) => {
    try {
      await createVersion(newVersion);
      setFocusedIssueVersion(newVersion.version);
    } catch {
      window.alert("버전을 저장하지 못했습니다.");
    }
  };

  const handleDeleteIssueVersion = async (versionName) => {
    try {
      await deleteVersionByName(versionName);
      setLocalRowsByVersion((prev) => {
        const next = { ...prev };
        delete next[versionName];
        return next;
      });
    } catch {
      window.alert("버전을 삭제하지 못했습니다.");
    }
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
      <section className="tr-tab-shell df-page-shell">
        <div className="tr-tab-bar">
          <div className="tr-tabs">
            <button
              type="button"
              className={activeView === "overview" ? "active" : ""}
              onClick={() => handleViewChange("overview")}
            >
              결함 현황
            </button>
            <button
              type="button"
              className={activeView === "new-issues" ? "active" : ""}
              onClick={() => handleViewChange("new-issues")}
            >
              신규 등록 이슈
            </button>
          </div>

          {activeView === "overview" ? (
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

        {activeView === "new-issues" ? (
          <NewRegisteredIssuesSection />
        ) : versionsLoading ? (
          <p className="df-page-description">버전 정보를 불러오는 중입니다...</p>
        ) : (
          <IssueProgressDashboard
            versions={filteredIssueVersions}
            allVersions={issueVersions}
            menuDistribution={issueMenuDistribution}
            recentIssues={recentIssues}
            severityDistribution={issueSeverityDistribution}
            onSaveIssueWeek={handleSaveIssueWeek}
            onDeleteIssueWeek={handleDeleteIssueWeek}
            onCreateIssueVersion={handleCreateIssueVersion}
            onDeleteIssueVersion={handleDeleteIssueVersion}
            focusedVersionName={focusedIssueVersion}
            onFocusedVersionHandled={() => setFocusedIssueVersion("")}
          />
        )}
      </section>
    </MainLayout>
  );
}

export default DefectListPage;
