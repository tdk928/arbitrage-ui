function matchLabel(item) {
  if (item.home_team && item.away_team) {
    return `${item.home_team} — ${item.away_team}`;
  }
  return item.match;
}

export default function DeleteArbitrageModal({
  item,
  source,
  saving,
  error,
  onConfirm,
  onCancel,
}) {
  if (!item) return null;

  const isAudit = source === "audit";

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-card modal-card-danger"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-arb-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon modal-icon-danger" aria-hidden="true">
          🗑
        </div>
        <h3 id="delete-arb-modal-title" className="modal-title">
          Изтриване на арбитраж
        </h3>
        <p className="modal-text">
          Сигурен ли си, че искаш да премахнеш този запис
          {isAudit ? " от audit историята" : " от top 10"}?
        </p>
        <p className="modal-email">{matchLabel(item)}</p>
        <ul className="modal-details">
          <li>
            <strong>Market</strong> — {item.market}
          </li>
          <li>
            <strong>Margin</strong> — +{Number(item.margin_pct).toFixed(2)}%
          </li>
          {isAudit && (
            <li>
              <strong>Run</strong> — #{item.run_id}
            </li>
          )}
        </ul>
        <p className="modal-hint modal-hint-danger">
          Действието е необратимо след потвърждение.
        </p>

        {error && <div className="message error modal-error">{error}</div>}

        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn modal-btn-cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Отказ
          </button>
          <button
            type="button"
            className="modal-btn modal-btn-danger"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? "Изтриване…" : "Изтрий"}
          </button>
        </div>
      </div>
    </div>
  );
}
