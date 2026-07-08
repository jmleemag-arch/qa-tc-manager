import { useMemo, useState } from "react";
import { MENU_FILTER_ALL, MENU_FILTER_OPTIONS } from "../constants/dashboardConstants";
import { filterMenuTestCaseCounts, getMaxMenuCount } from "../utils/dashboardUtils";

function MenuTestCaseChart({ menuTestCaseCounts }) {
  const [menuFilter, setMenuFilter] = useState(MENU_FILTER_ALL);

  const filteredCounts = useMemo(
    () => filterMenuTestCaseCounts(menuTestCaseCounts, menuFilter),
    [menuTestCaseCounts, menuFilter]
  );
  const maxCount = useMemo(
    () => getMaxMenuCount(filteredCounts),
    [filteredCounts]
  );

  return (
    <section className="db-card">
      <div className="db-card-header">
        <h3>메뉴별 테스트 케이스 분포</h3>
        <select
          className="db-filter-select"
          value={menuFilter}
          onChange={(e) => setMenuFilter(e.target.value)}
        >
          {MENU_FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="db-bar-chart">
        {filteredCounts.length > 0 ? (
          filteredCounts.map((item) => (
            <div key={item.menu} className="db-bar-row">
              <span className="db-bar-label">{item.menu}</span>
              <div className="db-bar-track">
                <div
                  className="db-bar-fill"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <strong className="db-bar-value">{item.count}</strong>
            </div>
          ))
        ) : (
          <p className="db-empty-message">표시할 데이터가 없습니다.</p>
        )}
      </div>
    </section>
  );
}

export default MenuTestCaseChart;
