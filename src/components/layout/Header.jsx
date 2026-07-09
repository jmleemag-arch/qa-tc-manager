import { useMemo, useState } from "react";

function formatNotificationTime(createdAt) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Header({
  pageTitle,
  notifications = [],
  onNotificationClick,
  onMarkAllNotificationsRead,
  onLogout,
}) {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const handleNotificationClick = (notification) => {
    onNotificationClick?.(notification);
    setIsNoticeOpen(false);
  };

  return (
    <header className="app-header">
      <h1 className="app-page-title">{pageTitle}</h1>

      <div className="app-header-actions">
        <div className="app-notification-wrap">
          <button
            type="button"
            className="app-icon-btn app-notification-btn"
            aria-label="알림"
            onClick={() => setIsNoticeOpen((prev) => !prev)}
          >
            <span aria-hidden="true">!</span>
            {unreadCount > 0 ? (
              <em className="app-notification-count">{unreadCount}</em>
            ) : null}
          </button>

          {isNoticeOpen ? (
            <section className="app-notification-panel">
              <div className="app-notification-header">
                <div>
                  <strong>알림</strong>
                  <span>최근 30일</span>
                </div>
                <button type="button" onClick={onMarkAllNotificationsRead}>
                  모두 읽음
                </button>
              </div>

              {notifications.length > 0 ? (
                <ul className="app-notification-list">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        className={
                          notification.isRead
                            ? "app-notification-item"
                            : "app-notification-item unread"
                        }
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <span className="app-notification-title">
                          {notification.title}
                        </span>
                        <strong>{notification.message}</strong>
                        <span className="app-notification-meta">
                          {notification.recipientName
                            ? `${notification.recipientName}님`
                            : "전체"}{" "}
                          · {formatNotificationTime(notification.createdAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="app-notification-empty">알림이 없습니다.</p>
              )}
            </section>
          ) : null}
        </div>

        <button type="button" className="app-icon-btn" aria-label="사용자">
          <span aria-hidden="true">U</span>
        </button>
        <button type="button" className="app-logout-btn" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;
