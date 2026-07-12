import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Паролата трябва да е поне 8 символа");
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Грешка при регистрация");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="auth-card">
        <h2 className="auth-title">Регистрация</h2>
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <div className="message error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "Регистрация…" : "Регистрация"}
          </button>
        </form>
        <p className="auth-footer">
          Вече имаш акаунт? <Link to="/login">Влез</Link>
        </p>
      </div>
    </div>
  );
}
