import MainLayout from "./MainLayout";

function PlaceholderPage({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  pageTitle,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  title = "준비 중",
}) {
  const displayTitle = pageTitle || title;

  return (
    <MainLayout
      loginUser={loginUser}
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={onMenuChange}
      pageTitle={displayTitle}
      notifications={notifications}
      onNotificationClick={onNotificationClick}
      onMarkAllNotificationsRead={onMarkAllNotificationsRead}
    >
      <div className="placeholder-page">
        <div className="placeholder-card">
          <h2>{displayTitle}</h2>
          <p>준비 중인 페이지입니다.</p>
        </div>
      </div>
    </MainLayout>
  );
}

export default PlaceholderPage;
