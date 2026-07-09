import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import IssueProgressDashboard from "../components/IssueProgressDashboard";
import NewRegisteredIssuesSection from "../components/NewRegisteredIssuesSection";
import {
  issueMenuDistribution,
  issueProgressVersions,
  issueSeverityDistribution,
  recentIssues,
} from "../data/defectMockData";
import {
  readIssueVersions,
  writeIssueVersions,
} from "../utils/issueVersionStorage";

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
  const [issueStartDate, setIssueStartDate] = useState("2026-05-21");
  const [issueEndDate, setIssueEndDate] = useState("2026-07-30");
  const [issueVersions, setIssueVersions] = useState(() =>
    readIssueVersions(issueProgressVersions)
  );
  const [focusedIssueVersion, setFocusedIssueVersion] = useState("");
  const activeView =
    routeParams.view === "new-issues" ? "new-issues" : "overview";

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

  useEffect(() => {
    writeIssueVersions(issueVersions);
  }, [issueVersions]);

  const handleViewChange = (view) => {
    onRouteChange?.({ view: view === "overview" ? null : view });
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

  const handleDeleteIssueVersion = (versionName) => {
    setIssueVersions((prev) =>
      prev.filter((version) => version.version !== versionName)
    );
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
