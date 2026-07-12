export default function DeactivateUserModal({
  email,
  saving,
  error,
  onConfirm,
  onCancel,
}) {
  if (!email) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-card modal-card-danger"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon modal-icon-danger" aria-hidden="true">
          ✕
        </div>
        <h3 id="deactivate-modal-title" className="modal-title">
          Деактивиране на абонамент
        </h3>
        <p className="modal-text">
          Потвърди премахване на абонамента за потребител:
        </p>
        <p className="modal-email">{email}</p>
        <ul className="modal-details">
          <li>
            <strong>Valid from</strong> — ще бъде нулирано (null)
          </li>
          <li>
            <strong>Valid to</strong> — ще бъде нулирано (null)
          </li>
        </ul>
        <p className="modal-hint modal-hint-danger">
          Потребителят веднага губи достъп до client функциите, докато не бъде активиран отново.
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
            {saving ? "Деактивиране…" : "Потвърди деактивиране"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function hasSubscriptionDates(user) {
  return Boolean(user?.valid_from || user?.valid_to);
}
