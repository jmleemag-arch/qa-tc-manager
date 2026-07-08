import { SUMMARY_CARD_CONFIG, SUMMARY_ICONS } from "../constants/dashboardConstants";

function DashboardSummaryCards({ summaryCards }) {
  return (
    <section className="db-summary-grid">
      {SUMMARY_CARD_CONFIG.map((card) => (
        <article
          key={card.key}
          className={`db-summary-card db-tone-${card.tone}`}
        >
          <div className={`db-summary-icon db-icon-${card.tone}`}>
            {SUMMARY_ICONS[card.key]}
          </div>
          <div className="db-summary-content">
            <p className="db-summary-label">{card.label}</p>
            <strong className="db-summary-value">
              {summaryCards[card.key].toLocaleString()}
            </strong>
            <span className="db-summary-sub">{summaryCards[card.subKey]}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export default DashboardSummaryCards;
