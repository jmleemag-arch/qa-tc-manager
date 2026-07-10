import MainLayout from "../../../components/layout/MainLayout";import NewRegisteredIssuesSection from "../components/NewRegisteredIssuesSection";
import WeeklyProgressSection from "../components/WeeklyProgressSection";

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
  routeParams = {},
  onRouteChange,
}) {
  const activeView = defectView === "new-issues" ? "new-issues" : "overview";

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
          <NewRegisteredIssuesSection
            routeParams={routeParams}
            onRouteChange={onRouteChange}
          />
        ) : (
          <WeeklyProgressSection
            loginUser={loginUser}
            routeParams={routeParams}
            onRouteChange={onRouteChange}
          />
        )}
      </section>
    </MainLayout>
  );
}

export default DefectListPage;
