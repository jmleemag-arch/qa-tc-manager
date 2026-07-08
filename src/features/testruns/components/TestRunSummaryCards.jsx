import { SUMMARY_CARD_CONFIG } from "../constants/testRunConstants";

const SUMMARY_ICONS = {
  totalRuns: "▦",
  inProgress: "◷",
  completed: "✓",
  failed: "✕",
  waiting: "⏸",
  totalTcCount: "☰",
};

function TestRunSummaryCards({ summaryStats }) {
  return (
    <section className="tr-summary-grid">
      {SUMMARY_CARD_CONFIG.map((card) => (
        <article key={card.key} className={`tr-summary-card tr-tone-${card.tone}`}>
          <div className={`tr-summary-icon tr-icon-${card.tone}`}>
            {SUMMARY_ICONS[card.key]}
          </div>
          <div className="tr-summary-content">
            <p className="tr-summary-label">{card.label}</p>
            <strong className="tr-summary-value">
              {(summaryStats[card.key] ?? 0).toLocaleString()}
            </strong>
          </div>
        </article>
      ))}
    </section>
  );
}

export default TestRunSummaryCards;
