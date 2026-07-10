import {
  EXECUTION_RESULT_EMPTY_VALUE,
  EXECUTION_RESULT_OPTIONS,
} from "../constants/testRunConstants";

function TestRunDetailRow({ testCase, onResultChange }) {
  return (
    <tr>
      <td className="tr-detail-id">{testCase.displayId || testCase.originalId}</td>
      <td>{testCase.menu}</td>
      <td>{testCase.subMenu || "-"}</td>
      <td className="tr-detail-wrap">{testCase.checkItem || "-"}</td>
      <td className="tr-detail-wrap">{testCase.checkMethod || "-"}</td>
      <td className="tr-detail-wrap">{testCase.checkResult || "-"}</td>
      <td>
        <select
          className="tr-result-select"
          value={testCase.isWorking ?? EXECUTION_RESULT_EMPTY_VALUE}
          onChange={(e) =>
            onResultChange(
              testCase.uid,
              e.target.value || null
            )
          }
          aria-label={`${testCase.displayId || testCase.originalId} 실행 결과`}
        >
          <option value={EXECUTION_RESULT_EMPTY_VALUE}>-</option>
          {EXECUTION_RESULT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </td>
      <td className="tr-detail-wrap">{testCase.note || "-"}</td>
    </tr>
  );
}

export default TestRunDetailRow;
