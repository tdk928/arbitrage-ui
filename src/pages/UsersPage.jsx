import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchUsers } from "../auth/api.js";
import { getStoredToken } from "../auth/token.js";
import { useAuth } from "../auth/AuthContext.jsx";
import EditableUserField from "../components/EditableUserField.jsx";

export default function UsersPage() {
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [session.role, loadUsers]);

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
              </tr>
            </thead>
            <tbody>
              {data.users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="users-empty">
                    Няма регистрирани потребители
                  </td>
                </tr>
              ) : (
                data.users.map((user) => (
                  <tr key={user.email}>
                    <td>{user.email}</td>
                    <EditableUserField
                      email={user.email}
                      field="phone"
                      value={user.phone}
                      label="Телефон"
                      emptyHint="Добави телефон"
                      onSaved={handleUserUpdated}
                    />
                    <EditableUserField
                      email={user.email}
                      field="valid_from"
                      value={user.valid_from}
                      label="Valid from"
                      emptyHint="Задай начална дата"
                      mode="datetime"
                      onSaved={handleUserUpdated}
                    />
                    <EditableUserField
                      email={user.email}
                      field="valid_to"
                      value={user.valid_to}
                      label="Valid to"
                      emptyHint="Задай крайна дата"
                      mode="datetime"
                      onSaved={handleUserUpdated}
                    />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
