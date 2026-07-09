export function SettingsField({ label, description, children }) {
  return (
    <label className="st-field">
      <span>{label}</span>
      {description ? <p>{description}</p> : null}
      {children}
    </label>
  );
}

export function SettingsCheckbox({ checked, onChange, label, description, id }) {
  return (
    <label className="st-checkbox-field" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <span>{label}</span>
        {description ? <p>{description}</p> : null}
      </div>
    </label>
  );
}
