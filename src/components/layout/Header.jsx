function Header({ pageTitle, onLogout }) {
  return (
    <header className="app-header">
      <h1 className="app-page-title">{pageTitle}</h1>

      <div className="app-header-actions">
        <button type="button" className="app-icon-btn" aria-label="알림">
          🔔
        </button>
        <button type="button" className="app-icon-btn" aria-label="사용자">
          👤
        </button>
        <button type="button" className="app-logout-btn" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;
