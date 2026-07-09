import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  ASSIGNEE_FILTER_ALL,
  NEW_ISSUE_PAGE_SIZE_OPTIONS,
} from "../constants/defectConstants";
import issueApi from "../../../services/issueApi";
import NewIssueTable from "../components/NewIssueTable";
import NewIssueToolbar from "../components/NewIssueToolbar";

function DefectSearchPage({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  pageTitle,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
}) {
  const [issues, setIssues] = useState([]);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState(ASSIGNEE_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(NEW_ISSUE_PAGE_SIZE_OPTIONS[0]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    issueApi
      .getAssignees()
      .then((response) => {
        setAssigneeOptions(response.data ?? []);
      })
      .catch(() => {
        setAssigneeOptions([]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);

    issueApi
      .list({
        search: searchText,
        assignee: assigneeFilter,
        page,
        pageSize,
      })
      .then((response) => {
        const data = response.data ?? {};
        setIssues(data.items ?? []);
        setPagination({
          total: data.total ?? 0,
          page: data.page ?? page,
          pageSize: data.pageSize ?? pageSize,
          totalPages: data.totalPages ?? 1,
        });
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError);
        setIssues([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [assigneeFilter, page, pageSize, searchText]);

  useEffect(() => {
    setPage(1);
  }, [searchText, assigneeFilter, pageSize]);

  const toolbarAssigneeOptions = useMemo(
    () => [ASSIGNEE_FILTER_ALL, ...assigneeOptions],
    [assigneeOptions]
  );

  const pageNumbers = useMemo(() => {
    const numbers = [];

    for (let index = 1; index <= pagination.totalPages; index += 1) {
      numbers.push(index);
    }

    return numbers;
  }, [pagination.totalPages]);

  const handleRetryRedmine = async (issueId) => {
    try {
      await issueApi.retryRedmine(issueId);
      const response = await issueApi.list({
        search: searchText,
        assignee: assigneeFilter,
        page,
        pageSize,
      });
      setIssues(response.data?.items ?? []);
    } catch {
      window.alert("Redmine 재등록에 실패했습니다.");
    }
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
      <section className="df-new-issues-section">
        <div className="df-page-header">
          <div>
            <p className="df-breadcrumb">홈 &gt; 결함 관리 &gt; 검색/필터</p>
            <h2>검색/필터</h2>
            <p className="df-page-description">
              등록된 이슈를 제목, 담당자 기준으로 검색합니다.
            </p>
          </div>
        </div>

        <div className="df-issue-list-card">
          {error ? (
            <p className="df-page-description">이슈 목록을 불러오지 못했습니다.</p>
          ) : null}

          <NewIssueToolbar
            searchText={searchText}
            assigneeFilter={assigneeFilter}
            assigneeOptions={toolbarAssigneeOptions}
            onSearchChange={setSearchText}
            onAssigneeFilterChange={setAssigneeFilter}
          />

          {loading ? (
            <p className="df-page-description">이슈 목록을 불러오는 중입니다...</p>
          ) : (
            <NewIssueTable
              issues={issues}
              pageOffset={(pagination.page - 1) * pageSize}
              onRetryRedmine={handleRetryRedmine}
            />
          )}

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
                  setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                }
                aria-label="다음 페이지"
              >
                ›
              </button>
            </div>

            <label className="df-page-size-select">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {NEW_ISSUE_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} / 페이지
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default DefectSearchPage;
