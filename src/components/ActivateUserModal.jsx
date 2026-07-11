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

export default function ActivateUserModal({
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
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activate-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon" aria-hidden="true">
          24h
        </div>
        <h3 id="activate-modal-title" className="modal-title">
          Активиране за 24 часа
        </h3>
        <p className="modal-text">
          Потвърди абонамент за потребител:
        </p>
        <p className="modal-email">{email}</p>
        <ul className="modal-details">
          <li>
            <strong>Valid from</strong> — сега (UTC)
          </li>
          <li>
            <strong>Valid to</strong> — след 24 часа (UTC)
          </li>
        </ul>
        <p className="modal-hint">
          За по-дълъг период редактирай датите ръчно в таблицата.
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
            className="modal-btn modal-btn-confirm"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? "Активиране…" : "Потвърди 24ч абонамент"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function isSubscriptionActive(user) {
  if (!user?.valid_from || !user?.valid_to) return false;
  const now = Date.now();
  return (
    new Date(user.valid_from).getTime() <= now &&
    now <= new Date(user.valid_to).getTime()
  );
}

export function formatSubscriptionEnd(iso) {
  return formatDateTime(iso);
}
