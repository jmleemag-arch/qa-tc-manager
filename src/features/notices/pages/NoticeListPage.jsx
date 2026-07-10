import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import noticeApi from "../../../services/noticeApi";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

function NoticeListPage({
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
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
  });
  const [selectedNoticeId, setSelectedNoticeId] = useState(
    routeParams.noticeId ?? ""
  );

  useEffect(() => {
    setLoading(true);

    noticeApi
      .list({ page, pageSize })
      .then((response) => {
        const data = response.data ?? {};
        const items = Array.isArray(data) ? data : (data.items ?? []);

        setNotices(items);
        setPagination({
          total: data.total ?? items.length,
          page: data.page ?? page,
          pageSize: data.pageSize ?? pageSize,
          totalPages: data.totalPages ?? 1,
        });
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError);
        setNotices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, pageSize]);

  useEffect(() => {
    if (routeParams.noticeId) {
      setSelectedNoticeId(routeParams.noticeId);
    }
  }, [routeParams.noticeId]);

  const selectedNotice = useMemo(() => {
    if (!selectedNoticeId) {
      return notices[0] ?? null;
    }

    return (
      notices.find(
        (notice) => String(notice.id) === String(selectedNoticeId)
      ) ?? notices[0] ?? null
    );
  }, [notices, selectedNoticeId]);

  const pageNumbers = useMemo(() => {
    const numbers = [];

    for (let index = 1; index <= pagination.totalPages; index += 1) {
      numbers.push(index);
    }

    return numbers;
  }, [pagination.totalPages]);

  const handleSelectNotice = (noticeId) => {
    setSelectedNoticeId(String(noticeId));
    onRouteChange?.({ noticeId: String(noticeId) }, { replace: true });
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
      <section className="db-workspace">
        <div className="db-dashboard-topbar">
          <div>
            <h2>공지사항</h2>
            <p>
              최신 공지와 릴리즈 안내를 확인합니다. (총 {pagination.total}건)
            </p>
          </div>
        </div>

        <div className="db-main-grid">
          <section className="db-card db-notice-list-card">
            {loading ? (
              <p className="db-empty-state">데이터를 불러오는 중입니다.</p>
            ) : error ? (
              <p className="db-empty-state">공지사항을 불러오지 못했습니다.</p>
            ) : notices.length === 0 ? (
              <p className="db-empty-state">등록된 공지사항이 없습니다.</p>
            ) : (
              <>
                <ul className="db-notice-list db-notice-list-scroll">
                  {notices.map((notice) => (
                    <li key={notice.id}>
                      <button
                        type="button"
                        className={
                          String(selectedNotice?.id) === String(notice.id)
                            ? "is-selected"
                            : ""
                        }
                        onClick={() => handleSelectNotice(notice.id)}
                      >
                        <span className="db-work-badge db-work-badge-blue">
                          {notice.category}
                        </span>
                        <span>{notice.title}</span>
                        <time>{notice.createdAt}</time>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="df-pagination-bar">
                  <div className="df-pagination">
                    <button
                      type="button"
                      className="df-page-btn"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      aria-label="이전 페이지"
                    >
                      ‹
                    </button>
                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={
                          pageNumber === pagination.page
                            ? "df-page-btn active"
                            : "df-page-btn"
                        }
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="df-page-btn"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(prev + 1, pagination.totalPages)
                        )
                      }
                      aria-label="다음 페이지"
                    >
                      ›
                    </button>
                  </div>

                  <label className="df-page-size-select">
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                    >
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option} / 페이지
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            )}
          </section>

          <section className="db-card db-notice-detail-card">
            {selectedNotice ? (
              <>
                <div className="db-card-header">
                  <h3>{selectedNotice.title}</h3>
                </div>
                <p className="df-page-description">
                  {selectedNotice.category} · {selectedNotice.createdAt}
                  {selectedNotice.createdBy
                    ? ` · ${selectedNotice.createdBy}`
                    : ""}
                </p>
                <p>{selectedNotice.content || "내용이 없습니다."}</p>
              </>
            ) : (
              <p className="db-empty-state">선택된 공지가 없습니다.</p>
            )}
          </section>
        </div>
      </section>
    </MainLayout>
  );
}

export default NoticeListPage;
