import {
  getProgressTone,
  getTestRunStatusTone,
} from "../utils/dashboardUtils";

function RecentTestRunCard({ recentTestRuns, onMoveToTestRuns }) {
  return (
    <section className="db-card">
      <div className="db-card-header">
        <h3>최근 테스트 런</h3>
        <button
          type="button"
          className="db-view-all-btn"
          onClick={onMoveToTestRuns}
        >
          전체 보기
        </button>
      </div>

      <div className="db-table-scroll">
        <table className="db-table">
          <thead>
            <tr>
              <th>런 ID</th>
              <th>런 이름</th>
              <th>대상 메뉴</th>
              <th>상태</th>
              <th>진행률</th>
              <th>생성일</th>
            </tr>
          </thead>
          <tbody>
            {recentTestRuns.map((run) => (
              <tr key={run.runId}>
                <td className="db-run-id">{run.runId}</td>
                <td className="db-run-name">{run.runName}</td>
                <td>{run.targetMenu}</td>
                <td>
                  <span
                    className={`db-status-badge db-status-${getTestRunStatusTone(run.status)}`}
                  >
                    {run.status}
                  </span>
                </td>
                <td className="db-progress-cell">
                  <span className="db-progress-text">{run.progress}%</span>
                  <div className="db-progress-track">
                    <div
                      className={`db-progress-fill db-progress-${getProgressTone(run.progress)}`}
                      style={{ width: `${run.progress}%` }}
                    />
                  </div>
                </td>
                <td className="db-date">{run.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RecentTestRunCard;
