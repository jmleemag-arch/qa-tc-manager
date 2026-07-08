import TestRunRow from "./TestRunRow";
import TestRunToolbar from "./TestRunToolbar";

function TestRunTable({
  testRuns,
  hasRegisteredRuns,
  statusFilter,
  menuFilter,
  startDate,
  endDate,
  searchText,
  onCreateClick,
  onExcelDownloadClick,
  onViewRun,
  onDeleteRun,
  onStatusFilterChange,
  onMenuFilterChange,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  onSearchSubmit,
}) {
  return (
    <section className="tr-table-card">
      <TestRunToolbar
        statusFilter={statusFilter}
        menuFilter={menuFilter}
        startDate={startDate}
        endDate={endDate}
        searchText={searchText}
        onCreateClick={onCreateClick}
        onExcelDownloadClick={onExcelDownloadClick}
        onStatusFilterChange={onStatusFilterChange}
        onMenuFilterChange={onMenuFilterChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
      />

      <div className="tr-table-scroll">
        <table className="tr-table">
          <thead>
            <tr>
              <th>런 ID</th>
              <th>런 이름</th>
              <th>대상 메뉴</th>
              <th>전체 TC 수</th>
              <th>완료 수</th>
              <th>O</th>
              <th>X</th>
              <th>진행률</th>
              <th>상태</th>
              <th>생성일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {testRuns.length > 0 ? (
              testRuns.map((testRun) => (
                <TestRunRow
                  key={testRun.runId}
                  testRun={testRun}
                  onView={onViewRun}
                  onDelete={onDeleteRun}
                />
              ))
            ) : (
              <tr>
                <td colSpan="11" className="tr-empty-message">
                  {hasRegisteredRuns
                    ? "검색 결과가 없습니다."
                    : "등록된 테스트 런이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TestRunTable;
