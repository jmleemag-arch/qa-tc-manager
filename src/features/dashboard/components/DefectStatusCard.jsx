import { VIEW_ALL_DEFECTS_ALERT } from "../constants/dashboardConstants";
import { buildDonutGradient } from "../utils/dashboardUtils";

function DefectStatusCard({ defectStatus }) {
  const donutStyle = buildDonutGradient(defectStatus.segments);

  const handleViewAllClick = () => {
    alert(VIEW_ALL_DEFECTS_ALERT);
  };

  return (
    <section className="db-card">
      <div className="db-card-header">
        <h3>결함 현황</h3>
        <button type="button" className="db-view-all-btn" onClick={handleViewAllClick}>
          전체 보기
        </button>
      </div>

      <div className="db-donut-layout">
        <div className="db-donut-wrap">
          <div className="db-donut" style={donutStyle}>
            <div className="db-donut-hole">
              <strong>{defectStatus.total}</strong>
              <span>전체 결함</span>
            </div>
          </div>
        </div>

        <ul className="db-legend-list">
          {defectStatus.segments.map((segment) => (
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

export default DefectStatusCard;
