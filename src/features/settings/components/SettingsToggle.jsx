function SettingsToggle({ checked, onChange, label, description, id }) {
  return (
    <label className="st-toggle-field" htmlFor={id}>
      <div className="st-toggle-copy">
        <span>{label}</span>
        {description ? <p>{description}</p> : null}
      </div>
      <span className="st-toggle-wrap">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="st-toggle-track" aria-hidden="true" />
      </span>
    </label>
  );
}

export default SettingsToggle;
