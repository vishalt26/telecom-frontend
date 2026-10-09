import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form.emailOrPhone, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}.`);
      const dest = location.state?.from?.pathname;
      navigate(dest && dest !== "/login" ? dest : "/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="sidebar-brand" style={{ padding: 0, marginBottom: "var(--space-2)" }}>
          <span className="sidebar-brand-mark" aria-hidden="true">
            T
          </span>
          <span>Telecom Care</span>
        </div>
        <h1 className="fs-xl">Log in to your account</h1>
        <p className="text-secondary text-sm" style={{ marginBottom: "var(--space-4)" }}>
          Track complaints and service requests in one place.
        </p>

        {error && <ErrorAlert message={error} />}

        <div className="stack">
          <div className="field">
            <label htmlFor="emailOrPhone">Email or phone</label>
            <input
              id="emailOrPhone"
              className="input"
              type="text"
              autoComplete="username"
              required
              value={form.emailOrPhone}
              onChange={(e) => update("emailOrPhone", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </div>

        <p className="text-sm text-secondary" style={{ marginTop: "var(--space-4)" }}>
          New here? <Link to="/register">Create a customer account</Link>
        </p>
      </form>
    </div>
  );
}

function ErrorAlert({ message }) {
  return (
    <div className="error-banner" role="alert" style={{ marginBottom: "var(--space-4)" }}>
      <span>{message}</span>
    </div>
  );
}
