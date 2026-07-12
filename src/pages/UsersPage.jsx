import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { activateUser, deactivateUser, fetchUsers } from "../auth/api.js";
import { accessDeniedPathForError } from "../auth/handleApiError.js";
import { getStoredToken } from "../auth/token.js";
import { useUsersRefresh } from "../context/UsersRefreshContext.jsx";
import EditableUserField from "../components/EditableUserField.jsx";
import ReadOnlyUserField from "../components/ReadOnlyUserField.jsx";
import { isAdminUser } from "../auth/userUtils.js";
import ActivateUserModal, {
  isSubscriptionActive,
  formatSubscriptionEnd,
} from "../components/ActivateUserModal.jsx";
import DeactivateUserModal, {
  hasSubscriptionDates,
} from "../components/DeactivateUserModal.jsx";

export default function UsersPage() {
  const navigate = useNavigate();
  const { refreshKey } = useUsersRefresh();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmEmail, setConfirmEmail] = useState(null);
  const [deactivateEmail, setDeactivateEmail] = useState(null);
  const [activateError, setActivateError] = useState(null);
  const [deactivateError, setDeactivateError] = useState(null);
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredToken();
      const result = await fetchUsers(token);
      setData(result);
    } catch (err) {
      const redirect = accessDeniedPathForError(err);
      if (redirect) {
        navigate(redirect.pathname, { replace: true, state: redirect.state });
        return;
      }
      setError(err.message || "Грешка при зареждане");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, refreshKey, location.pathname]);

  function handleUserUpdated(updatedUser) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map((u) =>
          u.email === updatedUser.email ? { ...u, ...updatedUser } : u
        ),
      };
    });
  }

  function openActivateModal(email) {
    setActivateError(null);
    setConfirmEmail(email);
  }

  function closeActivateModal() {
    if (activating) return;
    setConfirmEmail(null);
    setActivateError(null);
  }

  function openDeactivateModal(email) {
    setDeactivateError(null);
    setDeactivateEmail(email);
  }

  function closeDeactivateModal() {
    if (deactivating) return;
    setDeactivateEmail(null);
    setDeactivateError(null);
  }

  async function handleConfirmActivate() {
    if (!confirmEmail) return;

    setActivating(true);
    setActivateError(null);
    try {
      const token = getStoredToken();
      const updated = await activateUser(token, confirmEmail);
      handleUserUpdated(updated);
      setConfirmEmail(null);
    } catch (err) {
      setActivateError(err.message || "Грешка при активиране");
    } finally {
      setActivating(false);
    }
  }

  async function handleConfirmDeactivate() {
    if (!deactivateEmail) return;

    setDeactivating(true);
    setDeactivateError(null);
    try {
      const token = getStoredToken();
      const updated = await deactivateUser(token, deactivateEmail);
      handleUserUpdated(updated);
      setDeactivateEmail(null);
    } catch (err) {
      setDeactivateError(err.message || "Грешка при деактивиране");
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <div className="page">
      <div className="users-header">
        <h2 className="users-title">Всички потребители</h2>
        {data && (
          <span className="users-count">{data.count} потребителя</span>
        )}
      </div>

      {loading && <div className="message empty">Зареждане…</div>}
      {error && <div className="message error">{error}</div>}

      {data && !loading && (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Телефон</th>
                <th>Valid from</th>
                <th>Valid to</th>
                <th>Абонамент</th>
              </tr>
            </thead>
            <tbody>
              {data.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="users-empty">
                    Няма регистрирани потребители
                  </td>
                </tr>
              ) : (
                data.users.map((user) => {
                  const active = isSubscriptionActive(user);
                  const adminAccount = isAdminUser(user);
                  const hasDates = hasSubscriptionDates(user);
                  return (
                    <tr key={user.email}>
                      <td className="users-email-cell">
                        {user.email}
                        {adminAccount && (
                          <span className="users-role-badge">admin</span>
                        )}
                      </td>
                      <EditableUserField
                        email={user.email}
                        field="phone"
                        value={user.phone}
                        label="Телефон"
                        emptyHint="Добави телефон"
                        onSaved={handleUserUpdated}
                      />
                      {adminAccount ? (
                        <ReadOnlyUserField
                          label="Valid from"
                          hint="Админ акаунт — началната дата не се редактира"
                          value={user.valid_from}
                          mode="datetime"
                        />
                      ) : (
                        <EditableUserField
                          email={user.email}
                          field="valid_from"
                          value={user.valid_from}
                          label="Valid from"
                          emptyHint="Задай начална дата"
                          mode="datetime"
                          onSaved={handleUserUpdated}
                        />
                      )}
                      {adminAccount ? (
                        <ReadOnlyUserField
                          label="Valid to"
                          hint="Админ акаунт — крайната дата не се редактира"
                          value={user.valid_to}
                          mode="datetime"
                        />
                      ) : (
                        <EditableUserField
                          email={user.email}
                          field="valid_to"
                          value={user.valid_to}
                          label="Valid to"
                          emptyHint="Задай крайна дата"
                          mode="datetime"
                          onSaved={handleUserUpdated}
                        />
                      )}
                      <td className="users-action-cell">
                        {adminAccount ? (
                          <span className="users-na-badge" title="Админ акаунтите нямат абонамент">
                            N/A
                          </span>
                        ) : (
                          <div className="users-action-group">
                            {active && (
                              <span
                                className="users-active-badge"
                                title={`До ${formatSubscriptionEnd(user.valid_to)}`}
                              >
                                Активен
                              </span>
                            )}
                            {!active && (
                              <button
                                type="button"
                                className="users-activate-btn"
                                onClick={() => openActivateModal(user.email)}
                              >
                                Активирай 24ч
                              </button>
                            )}
                            {hasDates && (
                              <button
                                type="button"
                                className="users-deactivate-btn"
                                onClick={() => openDeactivateModal(user.email)}
                              >
                                Деактивирай
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <ActivateUserModal
        email={confirmEmail}
        saving={activating}
        error={activateError}
        onConfirm={handleConfirmActivate}
        onCancel={closeActivateModal}
      />

      <DeactivateUserModal
        email={deactivateEmail}
        saving={deactivating}
        error={deactivateError}
        onConfirm={handleConfirmDeactivate}
        onCancel={closeDeactivateModal}
      />
    </div>
  );
}
