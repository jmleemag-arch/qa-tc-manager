import {
  MENU_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "../constants/testRunConstants";

function TestRunToolbar({
  statusFilter,
  menuFilter,
  startDate,
  endDate,
  searchText,
  onCreateClick,
  onExcelDownloadClick,
  onStatusFilterChange,
  onMenuFilterChange,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  onSearchSubmit,
}) {
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <div className="tr-toolbar">
      <div className="tr-toolbar-left">
        <button type="button" className="tr-create-btn" onClick={onCreateClick}>
          + 테스트 런 생성
        </button>
        <button
          type="button"
          className="tr-excel-btn"
          onClick={onExcelDownloadClick}
        >
          엑셀 다운로드
        </button>
      </div>

      <div className="tr-toolbar-filters">
        <select
          className="tr-filter-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className="tr-filter-select"
          value={menuFilter}
          onChange={(e) => onMenuFilterChange(e.target.value)}
        >
          {MENU_FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="tr-filter-date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          aria-label="시작일"
        />

        <input
          type="date"
          className="tr-filter-date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          aria-label="종료일"
        />

        <div className="tr-search-group">
          <input
            type="text"
            className="tr-search-input"
            placeholder="런 이름 검색"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button
            type="button"
            className="tr-search-btn"
            onClick={onSearchSubmit}
            aria-label="검색"
          >
            🔍
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestRunToolbar;
