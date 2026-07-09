import {
  ASSIGNEE_FILTER_ALL,
  NEW_ISSUE_EXCEL_ALERT,
} from "../constants/defectConstants";

function NewIssueToolbar({
  searchText,
  assigneeFilter,
  assigneeOptions,
  onSearchChange,
  onAssigneeFilterChange,
  onExcelDownload,
}) {
  return (
    <div className="df-issue-toolbar">
      <div className="df-issue-toolbar-filters">
        <div className="df-search-group">
          <input
            type="text"
            className="df-search-input"
            placeholder="이슈 번호 또는 제목 검색"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="df-search-icon" aria-hidden="true">
            ⌕
          </span>
        </div>

        <select
          className="df-filter-select"
          value={assigneeFilter}
          onChange={(e) => onAssigneeFilterChange(e.target.value)}
        >
          <option value={ASSIGNEE_FILTER_ALL}>{ASSIGNEE_FILTER_ALL}</option>
          {assigneeOptions.map((assignee) => (
            <option key={assignee} value={assignee}>
              {assignee}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="df-excel-btn"
        onClick={() => onExcelDownload?.() ?? alert(NEW_ISSUE_EXCEL_ALERT)}
      >
        엑셀 다운로드
      </button>
    </div>
  );
}

export default NewIssueToolbar;
