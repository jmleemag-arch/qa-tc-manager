function TestCaseToolbar({
  searchText,
  onSearchChange,
  onSearchSubmit,
  resultCount,
  onAddClick,
  onDeleteClick,
  selectedCount,
  onExcelDownloadClick,
  onVersionManageClick,
  onSubMenuManageClick,
  selectedVersionLabel,
  isSubMenuOpen,
  onToggleSubMenu,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <>
      <div className="content-header">
        <div className="content-header-left">
          {!isSubMenuOpen && (
            <button
              type="button"
              className="tc-submenu-toggle-btn tc-submenu-toggle-btn-inline"
              onClick={onToggleSubMenu}
              aria-label="TC 서브메뉴 펼치기"
            >
              ≡
            </button>
          )}
          <div>
            <h1>테스트 케이스</h1>
            <p>업무별 TC 시트 기준으로 작성한 테스트 케이스 목록입니다.</p>
          </div>
        </div>

        <div className="content-actions">
          <button
            type="button"
            className="tc-manage-btn"
            onClick={onVersionManageClick}
          >
            버전 관리
          </button>

          <button
            type="button"
            className="tc-manage-btn"
            onClick={onSubMenuManageClick}
          >
            서브메뉴 관리
          </button>

          <button type="button" className="add-btn" onClick={onAddClick}>
            + TC 추가
          </button>

          <button
            type="button"
            className="delete-btn"
            onClick={onDeleteClick}
            disabled={selectedCount === 0}
          >
            삭제{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>

          <button
            type="button"
            className="excel-btn"
            onClick={onExcelDownloadClick}
          >
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="toolbar">
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ID, 서브메뉴, 점검 항목, 확인 방법, 확인 결과, 비고 검색"
          />
          <button
            type="submit"
            className="search-btn"
            aria-label="검색"
            title="검색"
          >
            검색
          </button>
        </form>

        <div className="result-count">
          {selectedVersionLabel && (
            <span className="tc-version-filter">{selectedVersionLabel}</span>
          )}
          총 <strong>{resultCount}</strong>건
        </div>
      </div>
    </>
  );
}

export default TestCaseToolbar;
