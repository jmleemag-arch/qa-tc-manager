import Header from "./Header";
import Sidebar from "./Sidebar";

function MainLayout({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  pageTitle,
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
        <Header pageTitle={pageTitle} onLogout={onLogout} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
