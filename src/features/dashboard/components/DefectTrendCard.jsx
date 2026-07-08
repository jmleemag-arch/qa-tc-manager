import { DEFECT_TREND_LEGEND } from "../constants/dashboardConstants";
import { getTrendMaxValue } from "../utils/dashboardUtils";

function DefectTrendCard({ defectTrend }) {
  const maxValue = getTrendMaxValue(defectTrend);

  return (
    <section className="db-card db-card-wide">
      <div className="db-card-header">
        <h3>결함 추이 (최근 6주)</h3>
        <ul className="db-trend-legend">
          {DEFECT_TREND_LEGEND.map((item) => (
            <li key={item.key}>
              <span
                className="db-legend-dot"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="db-trend-chart">
        {defectTrend.map((week) => (
          <div key={week.label} className="db-trend-group">
            <span className="db-trend-label">{week.label}</span>
            <div className="db-trend-bars">
              <div className="db-trend-bar-wrap">
                <div
                  className="db-trend-bar db-trend-registered"
                  style={{ height: `${(week.registered / maxValue) * 100}%` }}
                  title={`등록 ${week.registered}`}
                />
                <span>{week.registered}</span>
              </div>
              <div className="db-trend-bar-wrap">
                <div
                  className="db-trend-bar db-trend-resolved"
                  style={{ height: `${(week.resolved / maxValue) * 100}%` }}
                  title={`해결 ${week.resolved}`}
                />
                <span>{week.resolved}</span>
              </div>
              <div className="db-trend-bar-wrap">
                <div
                  className="db-trend-bar db-trend-remaining"
                  style={{ height: `${(week.remaining / maxValue) * 100}%` }}
                  title={`잔여 ${week.remaining}`}
                />
                <span>{week.remaining}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DefectTrendCard;
