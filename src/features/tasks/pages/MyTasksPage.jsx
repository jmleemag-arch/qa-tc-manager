import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { MENU_IDS } from "../../../constants/appConstants";
import myTasksApi from "../../../services/myTasksApi";
import { navigateToMenu } from "../../../utils/appNavigation";
import {
  MY_TASK_PAGE_SIZE_OPTIONS,
  MY_TASK_PRIORITY_TONE,
  MY_TASK_STATUS_OPTIONS,
  MY_TASK_STATUS_TONE,
  MY_TASK_TABS,
  MY_TASK_TYPE_OPTIONS,
  MY_TASK_TYPE_TONE,
} from "../constants/myTaskConstants";

function TypeBadge({ label }) {
  return (
    <span className={`mt-type-badge ${MY_TASK_TYPE_TONE[label] ?? "gray"}`}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`mt-priority-badge ${MY_TASK_PRIORITY_TONE[priority] ?? "normal"}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ statusLabel }) {
  return (
    <span className={`mt-status-badge ${MY_TASK_STATUS_TONE[statusLabel] ?? "pending"}`}>
      {statusLabel}
    </span>
  );
}

function isOverdue(dueDate, statusLabel) {
  if (!dueDate || statusLabel === "완료") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);

  return due < today;
}

function MyTasksPage({
  loginUser,
  authUserId,
  onLogout,
  activeMenu,
  onMenuChange,
  navigateToMenu: navigateMenu,
  pageTitle,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  routeParams = {},
}) {
  const [tasks, setTasks] = useState([]);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("전체 유형");
  const [statusFilter, setStatusFilter] = useState("전체 상태");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [selectedIds, setSelectedIds] = useState(new Set());

  const go = (menuId, params = {}, options = {}) => {
    navigateToMenu(navigateMenu ?? onMenuChange, menuId, params, options);
  };

  const fetchTasks = useCallback(async () => {
    if (!authUserId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await myTasksApi.list({
        userId: authUserId,
        tab: activeTab,
        type: typeFilter === "전체 유형" ? "" : typeFilter,
        status: statusFilter === "전체 상태" ? "" : statusFilter,
        startDate,
        endDate,
        search: searchText,
        page,
        pageSize,
      });
      const data = response.data ?? {};

      setTasks(data.items ?? []);
      setTabCounts(data.tabCounts ?? tabCounts);
      setPagination({
        total: data.total ?? 0,
        page: data.page ?? page,
        pageSize: data.pageSize ?? pageSize,
        totalPages: data.totalPages ?? 1,
      });
      setError(null);
    } catch (nextError) {
      setError(nextError);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    authUserId,
    endDate,
    page,
    pageSize,
    searchText,
    startDate,
    statusFilter,
    typeFilter,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, typeFilter, statusFilter, startDate, endDate, searchText, pageSize]);

  const pageNumbers = useMemo(() => {
    const numbers = [];

    for (let index = 1; index <= pagination.totalPages; index += 1) {
      numbers.push(index);
    }

    return numbers;
  }, [pagination.totalPages]);

  const allSelected =
    tasks.length > 0 && tasks.every((task) => selectedIds.has(task.id));

  const handleResetFilters = () => {
    setTypeFilter("전체 유형");
    setStatusFilter("전체 상태");
    setStartDate("");
    setEndDate("");
    setSearchText("");
    setPage(1);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(tasks.map((task) => task.id)));
  };

  const toggleSelect = (taskId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }

      return next;
    });
  };

  const handleRowClick = (task) => {
    if (task.targetType === "issue") {
      go(MENU_IDS.DEFECTS_NEW_ISSUES, {
        versionId: task.versionId,
        issueId: task.targetId,
      });
      return;
    }

    if (task.targetType === "testCase") {
      go(MENU_IDS.TEST_CASES, {
        versionId: task.versionId,
        caseId: task.targetId,
      });
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
      <section className="mt-page">
        <div className="mt-page-header">
          <div>
            <p className="df-breadcrumb">대시보드 &gt; 내 할 일</p>
            <h2>내 할 일</h2>
          </div>
          <button
            type="button"
            className="mt-settings-btn"
            onClick={() =>
              go(MENU_IDS.SETTINGS, { section: "notifications" })
            }
          >
            ⚙ 내 할 일 설정
          </button>
        </div>

        <div className="mt-tabs">
          {MY_TASK_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === "pending" && tabCounts.pending > 0 ? (
                <span className="mt-tab-badge">{tabCounts.pending}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-filter-bar">
          <label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              {MY_TASK_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {MY_TASK_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-period-field">
            <div className="mt-period-inputs">
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <span>~</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </label>

          <label className="mt-search-field">
            <div className="mt-search-input">
              <input
                type="search"
                value={searchText}
                placeholder="제목 또는 내용 검색"
                onChange={(event) => setSearchText(event.target.value)}
              />
              <span aria-hidden="true">⌕</span>
            </div>
          </label>

          <button type="button" className="mt-reset-btn" onClick={handleResetFilters}>
            ↺ 초기화
          </button>
        </div>

        <div className="mt-table-card">
          {loading ? (
            <p className="df-page-description">내 할 일을 불러오는 중입니다...</p>
          ) : error ? (
            <p className="df-page-description">내 할 일을 불러오지 못했습니다.</p>
          ) : (
            <>
              <div className="mt-table-scroll">
                <table className="mt-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          aria-label="전체 선택"
                        />
                      </th>
                      <th>유형</th>
                      <th>제목 / 내용</th>
                      <th>관련 항목</th>
                      <th>우선순위</th>
                      <th>상태</th>
                      <th>담당자</th>
                      <th>요청자</th>
                      <th>등록일</th>
                      <th>처리 기한</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="mt-empty-cell">
                          표시할 할 일이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="mt-row-clickable"
                          onClick={() => handleRowClick(task)}
                        >
                          <td onClick={(event) => event.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(task.id)}
                              onChange={() => toggleSelect(task.id)}
                              aria-label={`${task.title} 선택`}
                            />
                          </td>
                          <td>
                            <TypeBadge label={task.typeLabel} />
                          </td>
                          <td className="mt-title-cell">
                            <strong>{task.title}</strong>
                            {task.content ? <span>{task.content}</span> : null}
                          </td>
                          <td>
                            {task.relatedItem ? (
                              <button
                                type="button"
                                className="mt-related-link"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRowClick(task);
                                }}
                              >
                                {task.relatedItem}
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td>
                            <StatusBadge statusLabel={task.statusLabel} />
                          </td>
                          <td>{task.assignee || "-"}</td>
                          <td>{task.requester || "-"}</td>
                          <td>{task.createdAt}</td>
                          <td
                            className={
                              isOverdue(task.dueDate, task.statusLabel)
                                ? "mt-overdue"
                                : ""
                            }
                          >
                            {task.dueDate || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-table-footer">
                <span>총 {pagination.total}건</span>

                <div className="df-pagination">
                  <button
                    type="button"
                    className="df-page-btn"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(1)}
                    aria-label="첫 페이지"
                  >
                    «
                  </button>
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
                  <button
                    type="button"
                    className="df-page-btn"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage(pagination.totalPages)}
                    aria-label="마지막 페이지"
                  >
                    »
                  </button>
                </div>

                <label className="df-page-size-select">
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                  >
                    {MY_TASK_PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}개씩 보기
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

export default MyTasksPage;
