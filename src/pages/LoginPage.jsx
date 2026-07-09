import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Грешка при вход");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="auth-card">
        <h2 className="auth-title">Вход</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="auth-field">
            <span>Парола</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <div className="message error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "Влизане…" : "Login"}
          </button>
        </form>
        <p className="auth-footer">
          Нямаш акаунт? <Link to="/register">Регистрирай се</Link>
        </p>
      </div>
    </div>
  );
}
