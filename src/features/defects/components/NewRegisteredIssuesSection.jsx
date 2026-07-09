import { useEffect, useMemo, useState } from "react";
import {
  ASSIGNEE_FILTER_ALL,
  NEW_ISSUE_PAGE_SIZE_OPTIONS,
  REDMINE_SETTINGS_ALERT,
} from "../constants/defectConstants";
import { newRegisteredIssues } from "../data/newIssueMockData";
import {
  filterNewIssues,
  getAssigneeOptions,
  getDefaultWeekAnchor,
  getWeekRange,
  getWeeksWithData,
  paginateItems,
} from "../utils/newIssueUtils";
import NewIssueTable from "./NewIssueTable";
import NewIssueToolbar from "./NewIssueToolbar";
import WeekSelector from "./WeekSelector";

function NewRegisteredIssuesSection() {
  const weeksWithData = useMemo(
    () => getWeeksWithData(newRegisteredIssues),
    []
  );
  const [weekAnchorDate, setWeekAnchorDate] = useState(() =>
    getDefaultWeekAnchor(newRegisteredIssues)
  );
  const [searchText, setSearchText] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState(ASSIGNEE_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(NEW_ISSUE_PAGE_SIZE_OPTIONS[0]);

  const weekRange = useMemo(
    () => getWeekRange(weekAnchorDate),
    [weekAnchorDate]
  );
  const assigneeOptions = useMemo(
    () => getAssigneeOptions(newRegisteredIssues),
    []
  );
  const filteredIssues = useMemo(
    () =>
      filterNewIssues(newRegisteredIssues, {
        startDate: weekRange.startDate,
        endDate: weekRange.endDate,
        searchText,
        assigneeFilter,
      }),
    [weekRange, searchText, assigneeFilter]
  );
  const pagination = useMemo(
    () => paginateItems(filteredIssues, page, pageSize),
    [filteredIssues, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [weekAnchorDate, searchText, assigneeFilter, pageSize]);

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
        <button
          type="button"
          className="df-redmine-btn"
          onClick={() => alert(REDMINE_SETTINGS_ALERT)}
        >
          ⚙ Redmine 연동 설정
        </button>
      </div>

      <WeekSelector
        weekAnchorDate={weekAnchorDate}
        weeksWithData={weeksWithData}
        issues={newRegisteredIssues}
        onWeekChange={setWeekAnchorDate}
      />

      <div className="df-issue-list-card">
        <NewIssueToolbar
          searchText={searchText}
          assigneeFilter={assigneeFilter}
          assigneeOptions={assigneeOptions}
          onSearchChange={setSearchText}
          onAssigneeFilterChange={setAssigneeFilter}
        />

        <NewIssueTable
          issues={pagination.items}
          pageOffset={(pagination.currentPage - 1) * pageSize}
        />

        <div className="df-pagination-bar">
          <div className="df-pagination">
            <button
              type="button"
              className="df-page-btn"
              disabled={pagination.currentPage <= 1}
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
                  pageNumber === pagination.currentPage
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
              disabled={pagination.currentPage >= pagination.totalPages}
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
