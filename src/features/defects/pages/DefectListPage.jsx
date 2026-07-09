import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import IssueProgressDashboard from "../components/IssueProgressDashboard";
import NewRegisteredIssuesSection from "../components/NewRegisteredIssuesSection";
import { useIssueProgress } from "../../../hooks/useIssueProgress";
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
  defectView = "overview",
}) {
  const {
    issueVersions: apiIssueVersions,
    loading: versionsLoading,
    error: versionsError,
    createVersion,
    deleteVersionByName,
  } = useVersions();
  const {
    rowsByVersion,
    overviewStats,
    loading: progressLoading,
    error: progressError,
    saveIssueRound,
    refresh: refreshIssueProgress,
  } = useIssueProgress();
  const [focusedIssueVersion, setFocusedIssueVersion] = useState("");
  const activeView = defectView === "new-issues" ? "new-issues" : "overview";

  const issueVersions = useMemo(
    () =>
      apiIssueVersions.map((version) => ({
        ...version,
        rows: rowsByVersion[version.version] ?? [],
      })),
    [apiIssueVersions, rowsByVersion]
  );

  const handleSaveIssueRound = async (roundData, options) => {
    try {
      await saveIssueRound(roundData, options);
    } catch (error) {
      console.error(error);
      window.alert("주차 회차를 저장하지 못했습니다.");
    }
  };

  const handleCreateIssueVersion = async (newVersion) => {
    await createVersion(newVersion);
    await refreshIssueProgress();
    setFocusedIssueVersion(newVersion.version);
  };

  const handleDeleteIssueVersion = async (versionName) => {
    try {
      await deleteVersionByName(versionName);
      await refreshIssueProgress();
    } catch {
      window.alert("버전을 삭제하지 못했습니다.");
    }
  };

  const isOverviewLoading = versionsLoading || progressLoading;
  const overviewError = versionsError || progressError;

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
      <section className="df-page-shell">
        {activeView === "new-issues" ? (
          <NewRegisteredIssuesSection />
        ) : isOverviewLoading ? (
          <p className="df-page-description">결함 현황 데이터를 불러오는 중입니다...</p>
        ) : overviewError ? (
          <p className="df-page-description">
            결함 현황 데이터를 불러오지 못했습니다. 터미널에서 `npm run dev`를 재시작해
            주세요.
          </p>
        ) : (
          <IssueProgressDashboard
            versions={issueVersions}
            menuDistribution={overviewStats.menuDistribution}
            recentIssues={overviewStats.recentIssues}
            severityDistribution={overviewStats.severityDistribution}
            onSaveIssueRound={handleSaveIssueRound}
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
