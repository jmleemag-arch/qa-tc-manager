function SettingsCard({ title, children }) {
  return (
    <section className="st-card">
      <h3>{title}</h3>
      <div className="st-card-body">{children}</div>
    </section>
  );
}

export default SettingsCard;
