import { useEffect, useMemo, useState } from "react";
import {
  ASSIGNEE_FILTER_ALL,
  NEW_ISSUE_PAGE_SIZE_OPTIONS,
} from "../constants/defectConstants";
import { useNewIssues } from "../../../hooks/useNewIssues";
import { downloadNewIssuesExcel } from "../utils/newIssueExcelUtils";
import NewIssueCreateModal from "./NewIssueCreateModal";
import NewIssueTable from "./NewIssueTable";
import NewIssueToolbar from "./NewIssueToolbar";
import RoundSelector from "./RoundSelector";

function NewRegisteredIssuesSection() {
  const [selectedRound, setSelectedRound] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState(ASSIGNEE_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(NEW_ISSUE_PAGE_SIZE_OPTIONS[0]);

  const {
    issues,
    rounds,
    assigneeOptions,
    pagination,
    loading,
    error,
    defaultRound,
    createIssue,
    retryRedmine,
    fetchAllIssuesForRound,
  } = useNewIssues({
    selectedRound,
    searchText,
    assigneeFilter,
    page,
    pageSize,
  });

  useEffect(() => {
    if (!selectedRound && defaultRound?.roundKey) {
      setSelectedRound(defaultRound);
    }
  }, [defaultRound, selectedRound]);

  useEffect(() => {
    setPage(1);
  }, [selectedRound, searchText, assigneeFilter, pageSize]);

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

  const handleCreateIssue = async (payload) => {
    return createIssue(payload);
  };

  const handleRetryRedmine = async (issueId) => {
    try {
      await retryRedmine(issueId);
    } catch (retryError) {
      console.error(retryError);
      window.alert("Redmine 재등록에 실패했습니다.");
    }
  };

  const handleExcelDownload = async () => {
    try {
      const allIssues = await fetchAllIssuesForRound();
      downloadNewIssuesExcel(
        allIssues,
        selectedRound
          ? `${selectedRound.year}년_${selectedRound.roundLabel}`
          : "new_issues"
      );
    } catch (downloadError) {
      console.error(downloadError);
      window.alert("엑셀 다운로드에 실패했습니다.");
    }
  };

  return (
    <section className="df-new-issues-section">
      <div className="df-page-header">
        <div>
          <p className="df-breadcrumb">홈 &gt; 결함 관리 &gt; 신규 등록 이슈</p>
          <h2>신규 등록 이슈</h2>
          <p className="df-page-description">
            매주 목요일 기준 주차 회차별 신규 이슈를 확인하고 Redmine에
            등록합니다.
          </p>
        </div>
        <button
          type="button"
          className="df-create-issue-btn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + 신규 이슈 등록
        </button>
      </div>

      {selectedRound ? (
        <RoundSelector
          rounds={rounds}
          selectedRound={selectedRound}
          onRoundChange={setSelectedRound}
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
          onExcelDownload={handleExcelDownload}
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

      <NewIssueCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateIssue}
      />
    </section>
  );
}

export default NewRegisteredIssuesSection;
