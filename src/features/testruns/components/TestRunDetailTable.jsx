import TestRunDetailRow from "./TestRunDetailRow";

function TestRunDetailTable({ testCases, onResultChange }) {
  return (
    <div className="tr-detail-table-scroll">
      <table className="tr-detail-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>메뉴</th>
            <th>서브메뉴</th>
            <th>점검항목</th>
            <th>확인 방법</th>
            <th>확인 결과</th>
            <th>실행 결과</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {testCases.length > 0 ? (
            testCases.map((testCase) => (
              <TestRunDetailRow
                key={testCase.uid}
                testCase={testCase}
                onResultChange={onResultChange}
              />
            ))
          ) : (
            <tr>
              <td colSpan="8" className="tr-empty-message">
                포함된 테스트 케이스가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TestRunDetailTable;
