function formatDateTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReadOnlyUserField({
  label,
  hint,
  value,
  mode = "text",
}) {
  const displayValue = mode === "datetime" ? formatDateTime(value) : value;

  return (
    <td className="users-field-cell">
      <div className="users-field-box users-field-box-readonly" title={hint}>
        <div className="users-field-meta">
          <span className="users-field-label">{label}</span>
          {displayValue ? (
            <span className="users-field-value">{displayValue}</span>
          ) : null}
          <span className="users-field-readonly-hint">{hint}</span>
        </div>
        <span className="users-field-lock" aria-hidden="true" title={hint}>
          🔒 Не се редактира
        </span>
      </div>
    </td>
  );
}
