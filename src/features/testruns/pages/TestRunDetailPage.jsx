import TestRunDetailTable from "../components/TestRunDetailTable";
import {
  calculateProgress,
  getProgressTone,
  getStatusTone,
} from "../utils/testRunUtils";

function TestRunDetailPage({
  testRun,
  onBack,
  onResultChange,
  onExcelDownload,
}) {
  const progress = calculateProgress(
    testRun.completedCount,
    testRun.totalCount
  );
  const progressTone = getProgressTone(progress);
  const statusTone = getStatusTone(testRun.status);

  return (
    <div className="tr-detail-page">
      <div className="tr-detail-topbar">
        <button type="button" className="tr-back-btn" onClick={onBack}>
          ← 목록으로 돌아가기
        </button>
        <button
          type="button"
          className="tr-detail-excel-btn"
          onClick={onExcelDownload}
        >
          엑셀 다운로드
        </button>
      </div>

      <section className="tr-detail-summary-card">
        <div className="tr-detail-summary-header">
          <div>
            <span className="tr-detail-run-id">{testRun.runId}</span>
            <h2>{testRun.runName}</h2>
          </div>
          <span className={`tr-status-badge tr-status-${statusTone}`}>
            {testRun.status}
          </span>
        </div>

        <div className="tr-detail-summary-grid">
          <div className="tr-detail-summary-item">
            <span>대상 메뉴</span>
            <strong>{testRun.targetMenu}</strong>
          </div>
          <div className="tr-detail-summary-item">
            <span>전체 TC 수</span>
            <strong>{testRun.totalCount}</strong>
          </div>
          <div className="tr-detail-summary-item">
            <span>완료 수</span>
            <strong>{testRun.completedCount}</strong>
          </div>
          <div className="tr-detail-summary-item">
            <span>O</span>
            <strong className="tr-pass">{testRun.passCount}</strong>
          </div>
          <div className="tr-detail-summary-item">
            <span>X</span>
            <strong className="tr-fail">{testRun.failCount}</strong>
          </div>
          <div className="tr-detail-summary-item">
            <span>N/A</span>
            <strong>{testRun.naCount}</strong>
          </div>
          <div className="tr-detail-summary-item">
            <span>N/T</span>
            <strong>{testRun.ntCount}</strong>
          </div>
          <div className="tr-detail-summary-item">
            <span>미입력</span>
            <strong>{testRun.unsetCount}</strong>
          </div>
          <div className="tr-detail-summary-item tr-detail-progress-item">
            <span>진행률</span>
            <div>
              <strong>{progress}%</strong>
              <div className="tr-progress-track">
                <div
                  className={`tr-progress-fill tr-progress-${progressTone}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="tr-detail-summary-item">
            <span>생성일</span>
            <strong>{testRun.createdAt}</strong>
          </div>
        </div>
      </section>

      <section className="tr-table-card tr-detail-table-card">
        <div className="tr-detail-table-header">
          <h3>테스트 케이스 실행 목록</h3>
        </div>
        <TestRunDetailTable
          testCases={testRun.testCases ?? []}
          onResultChange={onResultChange}
        />
      </section>
    </div>
  );
}

export default TestRunDetailPage;
