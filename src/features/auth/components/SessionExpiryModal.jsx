function SessionExpiryModal({ isOpen, onExtend, onLogout }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="session-expiry-overlay" role="presentation">
      <section
        className="session-expiry-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-expiry-title"
        aria-describedby="session-expiry-desc"
      >
        <h2 id="session-expiry-title">세션이 1분 후 만료됩니다.</h2>
        <p id="session-expiry-desc">
          계속 사용하시려면 세션을 연장해주세요.
        </p>
        <div className="session-expiry-actions">
          <button type="button" className="session-expiry-extend-btn" onClick={onExtend}>
            세션 연장
          </button>
          <button type="button" className="session-expiry-logout-btn" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </section>
    </div>
  );
}

export default SessionExpiryModal;
