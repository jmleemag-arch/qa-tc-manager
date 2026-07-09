import { useEffect, useMemo, useState } from "react";
import {
  ASSIGNEE_FILTER_ALL,
  NEW_ISSUE_PAGE_SIZE_OPTIONS,
} from "../constants/defectConstants";
import { useNewIssues } from "../../../hooks/useNewIssues";
import NewIssueTable from "./NewIssueTable";
import NewIssueToolbar from "./NewIssueToolbar";
import WeekSelector from "./WeekSelector";

function NewRegisteredIssuesSection() {
  const [weekAnchorDate, setWeekAnchorDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState(ASSIGNEE_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(NEW_ISSUE_PAGE_SIZE_OPTIONS[0]);

  const {
    issues,
    weeksWithData,
    assigneeOptions,
    pagination,
    loading,
    error,
    defaultWeekAnchor,
  } = useNewIssues({
    weekAnchorDate,
    searchText,
    assigneeFilter,
    page,
    pageSize,
  });

  useEffect(() => {
    if (!weekAnchorDate && defaultWeekAnchor) {
      setWeekAnchorDate(defaultWeekAnchor);
    }
  }, [defaultWeekAnchor, weekAnchorDate]);

  useEffect(() => {
    setPage(1);
  }, [weekAnchorDate, searchText, assigneeFilter, pageSize]);

  const weekIssues = useMemo(
    () => weeksWithData.map((weekStart) => ({ registeredAt: weekStart })),
    [weeksWithData]
  );

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

  return (
    <section className="df-new-issues-section">
      <div className="df-page-header">
        <div>
          <p className="df-breadcrumb">홈 &gt; 결함 관리 &gt; 신규 등록 이슈</p>
          <h2>신규 등록 이슈</h2>
          <p className="df-page-description">
            주차별로 등록된 신규 이슈 목록을 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {weekAnchorDate ? (
        <WeekSelector
          weekAnchorDate={weekAnchorDate}
          weeksWithData={weeksWithData}
          issues={weekIssues}
          onWeekChange={setWeekAnchorDate}
        />
      ) : null}

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
  );
}

export default NewRegisteredIssuesSection;
