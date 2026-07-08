import { VIEW_ALL_RUNS_ALERT } from "../constants/testRunConstants";
import { getStatusTone } from "../utils/testRunUtils";

function RecentTestRuns({ recentRuns }) {
  const handleViewAllClick = () => {
    alert(VIEW_ALL_RUNS_ALERT);
  };

  return (
    <section className="tr-bottom-card">
      <div className="tr-bottom-card-header">
        <h3>최근 테스트 런</h3>
      </div>

      {recentRuns.length > 0 ? (
        <ul className="tr-recent-list">
          {recentRuns.map((run) => (
            <li key={run.runId} className="tr-recent-item">
              <div className="tr-recent-main">
                <span className="tr-recent-id">{run.runId}</span>
                <span className="tr-recent-name">{run.runName}</span>
              </div>
              <div className="tr-recent-meta">
                <span
                  className={`tr-status-badge tr-status-${getStatusTone(run.status)}`}
                >
                  {run.status}
                </span>
                <span className="tr-recent-date">{run.createdAt}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="tr-empty-message tr-recent-empty">
          최근 테스트 런이 없습니다.
        </p>
      )}

      <button
        type="button"
        className="tr-view-all-btn"
        onClick={handleViewAllClick}
      >
        전체 보기
      </button>
    </section>
  );
}

export default RecentTestRuns;
