import Header from "./Header";
import Sidebar from "./Sidebar";

function MainLayout({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  pageTitle,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  children,
}) {
  return (
    <div className="app-shell">
      <Sidebar
        loginUser={loginUser}
        activeMenu={activeMenu}
        onMenuChange={onMenuChange}
      />

      <div className="app-main">
        <Header
          pageTitle={pageTitle}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onLogout={onLogout}
        />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
