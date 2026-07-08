function TestRunStatusChart({ distribution }) {
  const total =
    distribution.completed +
    distribution.inProgress +
    distribution.failed +
    distribution.waiting;

  const segments = [
    { key: "completed", label: "완료", count: distribution.completed, color: "#22c55e" },
    { key: "inProgress", label: "진행 중", count: distribution.inProgress, color: "#3b82f6" },
    { key: "failed", label: "실패", count: distribution.failed, color: "#ef4444" },
    { key: "waiting", label: "대기", count: distribution.waiting, color: "#94a3b8" },
  ];

  const getPercent = (count) => {
    if (!total) {
      return 0;
    }

    return (count / total) * 100;
  };

  let currentPercent = 0;
  const gradientParts = segments
    .filter((segment) => segment.count > 0)
    .map((segment) => {
      const nextPercent = currentPercent + getPercent(segment.count);
      const part = `${segment.color} ${currentPercent}% ${nextPercent}%`;
      currentPercent = nextPercent;
      return part;
    });

  const donutStyle =
    gradientParts.length > 0
      ? { background: `conic-gradient(${gradientParts.join(", ")})` }
      : { background: "#e2e8f0" };

  return (
    <section className="tr-bottom-card">
      <div className="tr-bottom-card-header">
        <h3>상태별 테스트 런 분포</h3>
      </div>

      <div className="tr-chart-body">
        <div className="tr-donut-wrap">
          <div className="tr-donut" style={donutStyle}>
            <div className="tr-donut-hole">
              <strong>{total}</strong>
              <span>전체</span>
            </div>
          </div>
        </div>

        <ul className="tr-chart-legend">
          {segments.map((segment) => (
            <li key={segment.key} className="tr-legend-item">
              <span
                className="tr-legend-dot"
                style={{ backgroundColor: segment.color }}
              />
              <span className="tr-legend-label">{segment.label}</span>
              <strong className="tr-legend-count">{segment.count}건</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TestRunStatusChart;
