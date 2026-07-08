import WorkingFilterButton from "./WorkingFilterButton";
import TestCaseRow from "./TestCaseRow";

function TestCaseTable({
  testCases,
  selectedUids,
  dragUid,
  isAllSelected,
  isIndeterminate,
  workingFilter,
  onWorkingFilterChange,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="tc-table">
          <thead>
            <tr>
              <th className="tc-select-header">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isIndeterminate;
                    }
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="현재 목록 전체 선택"
                />
              </th>
              <th>ID</th>
              <th>메뉴</th>
              <th>서브메뉴</th>
              <th>점검항목</th>
              <th>확인 방법</th>
              <th>확인 결과</th>
              <th className="tc-working-header">
                <div className="tc-working-header-inner">
                  <span className="tc-working-header-label">작동 여부</span>
                  <WorkingFilterButton
                    workingFilter={workingFilter}
                    onWorkingFilterChange={onWorkingFilterChange}
                  />
                </div>
              </th>
              <th>비고</th>
            </tr>
          </thead>

          <tbody>
            {testCases.length > 0 ? (
              testCases.map((testCase) => (
                <TestCaseRow
                  key={testCase.uid}
                  testCase={testCase}
                  isSelected={selectedUids.has(testCase.uid)}
                  isDragging={dragUid === testCase.uid}
                  onToggleSelect={onToggleSelect}
                  onRowClick={onRowClick}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                />
              ))
            ) : (
              <tr>
                <td colSpan="9" className="empty-message">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TestCaseTable;
