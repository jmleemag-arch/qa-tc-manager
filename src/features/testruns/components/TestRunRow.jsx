import { DELETE_TEST_RUN_CONFIRM } from "../constants/testRunConstants";
import {
  calculateProgress,
  getProgressTone,
  getStatusTone,
} from "../utils/testRunUtils";

function TestRunRow({ testRun, onView, onDelete }) {
  const progress = calculateProgress(
    testRun.completedCount,
    testRun.totalCount
  );
  const progressTone = getProgressTone(progress);
  const statusTone = getStatusTone(testRun.status);

  const handleViewClick = (e) => {
    e.stopPropagation();
    onView(testRun.runId);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    const confirmed = window.confirm(DELETE_TEST_RUN_CONFIRM);

    if (confirmed) {
      onDelete(testRun.dbId);
    }
  };

  return (
    <tr>
      <td className="tr-run-id">{testRun.runId}</td>
      <td className="tr-run-name">{testRun.runName}</td>
      <td>{testRun.targetMenu}</td>
      <td className="tr-num">{testRun.totalCount}</td>
      <td className="tr-num">{testRun.completedCount}</td>
      <td className="tr-num tr-pass">{testRun.passCount}</td>
      <td className="tr-num tr-fail">{testRun.failCount}</td>
      <td className="tr-progress-cell">
        <span className="tr-progress-text">{progress}%</span>
        <div className="tr-progress-track">
          <div
            className={`tr-progress-fill tr-progress-${progressTone}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </td>
      <td>
        <span className={`tr-status-badge tr-status-${statusTone}`}>
          {testRun.status}
        </span>
      </td>
      <td className="tr-created-at">{testRun.createdAt}</td>
      <td className="tr-actions-cell">
        <button type="button" className="tr-action-btn" onClick={handleViewClick}>
          보기
        </button>
        <button
          type="button"
          className="tr-action-btn tr-delete-btn"
          onClick={handleDeleteClick}
        >
          삭제
        </button>
      </td>
    </tr>
  );
}

export default TestRunRow;
