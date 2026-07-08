import MainLayout from "./MainLayout";

function PlaceholderPage({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  pageTitle,
}) {
  return (
    <MainLayout
      loginUser={loginUser}
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={onMenuChange}
      pageTitle={pageTitle}
    >
      <div className="app-placeholder-card">
        <h2>{pageTitle}</h2>
        <p>준비 중인 페이지입니다.</p>
      </div>
    </MainLayout>
  );
}

export default PlaceholderPage;
