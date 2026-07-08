import { VIEW_ALL_TEST_CASES_ALERT } from "../constants/dashboardConstants";

function RecentTestCaseCard({ recentTestCases }) {
  const handleViewAllClick = () => {
    alert(VIEW_ALL_TEST_CASES_ALERT);
  };

  return (
    <section className="db-card">
      <div className="db-card-header">
        <h3>최근 등록된 테스트 케이스</h3>
        <button type="button" className="db-view-all-btn" onClick={handleViewAllClick}>
          전체 보기
        </button>
      </div>

      <ul className="db-recent-tc-list">
        {recentTestCases.map((testCase) => (
          <li key={testCase.id} className="db-recent-tc-item">
            <div className="db-recent-tc-main">
              <span className="db-tc-id">{testCase.id}</span>
              <span className="db-tc-item">{testCase.checkItem}</span>
            </div>
            <div className="db-recent-tc-meta">
              <span
                className={`db-working-badge db-working-${testCase.isWorking === "O" ? "pass" : "fail"}`}
              >
                {testCase.isWorking}
              </span>
              <span className="db-date">{testCase.createdAt}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecentTestCaseCard;
