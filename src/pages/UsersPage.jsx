import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { activateUser, fetchUsers } from "../auth/api.js";
import { getStoredToken } from "../auth/token.js";
import { useAuth } from "../auth/AuthContext.jsx";
import EditableUserField from "../components/EditableUserField.jsx";
import ReadOnlyUserField from "../components/ReadOnlyUserField.jsx";
import { isAdminUser } from "../auth/userUtils.js";
import ActivateUserModal, {
  isSubscriptionActive,
  formatSubscriptionEnd,
} from "../components/ActivateUserModal.jsx";

export default function UsersPage() {
  const { session } = useAuth();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmEmail, setConfirmEmail] = useState(null);
  const [activateError, setActivateError] = useState(null);
  const [activating, setActivating] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredToken();
      const result = await fetchUsers(token);
      setData(result);
    } catch (err) {
      setError(err.message || "Грешка при зареждане");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session.role !== "admin") return;
    loadUsers();
  }, [session.role, loadUsers, location.state?.refreshAt]);

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

  if (session.role !== "admin") {
    return <Navigate to="/" replace />;
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
                      <EditableUserField
                        email={user.email}
                        field="valid_to"
                        value={user.valid_to}
                        label="Valid to"
                        emptyHint="Задай крайна дата"
                        mode="datetime"
                        onSaved={handleUserUpdated}
                      />
                      <td className="users-action-cell">
                        {adminAccount ? (
                          <span className="users-na-badge" title="Админ акаунтите нямат абонамент">
                            N/A
                          </span>
                        ) : active ? (
                          <span className="users-active-badge" title={`До ${formatSubscriptionEnd(user.valid_to)}`}>
                            Активен
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="users-activate-btn"
                            onClick={() => openActivateModal(user.email)}
                          >
                            Activate 24h
                          </button>
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
    </div>
  );
}
