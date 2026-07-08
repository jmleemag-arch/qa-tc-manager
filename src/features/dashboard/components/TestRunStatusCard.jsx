import { buildDonutGradient } from "../utils/dashboardUtils";

function TestRunStatusCard({ testRunStatus }) {
  const donutStyle = buildDonutGradient(testRunStatus.segments);

  return (
    <section className="db-card db-test-run-status-card">
      <div className="db-card-header">
        <h3>테스트 런 현황</h3>
      </div>

      <div className="test-run-status-content">
        <div className="test-run-donut-wrap">
          <div className="test-run-donut" style={donutStyle}>
            <div className="test-run-donut-hole">
              <strong>{testRunStatus.total}</strong>
              <span>전체 런</span>
            </div>
          </div>
        </div>

        <ul className="test-run-status-legend">
          {testRunStatus.segments.map((segment) => (
            <li key={segment.key} className="db-legend-item">
              <span
                className="db-legend-dot"
                style={{ backgroundColor: segment.color }}
              />
              <span className="db-legend-label">{segment.label}</span>
              <strong className="db-legend-value">
                {segment.count}건, {segment.percent}%
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TestRunStatusCard;
