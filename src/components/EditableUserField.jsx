import { useState } from "react";
import { updateUser } from "../auth/api.js";
import { getStoredToken } from "../auth/token.js";
import InlineDateTimePicker from "./InlineDateTimePicker.jsx";

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

function EditIcon() {
  return (
    <svg
      className="users-field-icon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13.5 2.5a1.8 1.8 0 0 1 2.5 2.5l-9 9-3.5 1 1-3.5 9-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 4l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EditableUserField({
  email,
  field,
  value,
  label,
  emptyHint,
  mode = "text",
  onSaved,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(mode === "datetime" ? value : value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const displayValue = mode === "datetime" ? formatDateTime(value) : value;
  const isEmpty = !displayValue;

  function startEdit() {
    setDraft(mode === "datetime" ? value : value ?? "");
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const patch = {};
      if (field === "phone") {
        patch.phone = draft.trim() || null;
      } else {
        patch[field] = draft || null;
      }

      const token = getStoredToken();
      const updated = await updateUser(token, email, patch);
      onSaved(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message || "Грешка при запис");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <td className="users-field-cell">
        <div className={`users-field-box${isEmpty ? " users-field-box-empty" : ""}`}>
          <div className="users-field-meta">
            <span className="users-field-label">{label}</span>
            {isEmpty ? (
              <span className="users-field-placeholder">{emptyHint}</span>
            ) : (
              <span className="users-field-value">{displayValue}</span>
            )}
          </div>
          <button
            type="button"
            className="users-field-edit"
            onClick={startEdit}
            aria-label={`Редактирай ${label.toLowerCase()}`}
          >
            <EditIcon />
            <span>Редактирай</span>
          </button>
        </div>
      </td>
    );
  }

  return (
    <td className="users-field-cell users-field-cell-editing">
      <div className="users-field-editor">
        <span className="users-field-editor-title">{label}</span>

        {mode === "datetime" ? (
          <InlineDateTimePicker isoValue={draft} onChange={setDraft} />
        ) : (
          <input
            type="tel"
            className="users-edit-input"
            placeholder="+359 888 123 456"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        )}

        <div className="users-edit-actions">
          <button
            type="button"
            className="users-edit-btn users-edit-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Запис…" : "Запази"}
          </button>
          <button
            type="button"
            className="users-edit-btn users-edit-btn-cancel"
            onClick={cancelEdit}
            disabled={saving}
          >
            Отказ
          </button>
        </div>

        {error && <div className="users-edit-error">{error}</div>}
      </div>
    </td>
  );
}
