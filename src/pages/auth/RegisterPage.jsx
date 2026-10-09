import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const initialForm = { name: "", email: "", phone: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((fe) => ({ ...fe, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (form.password !== form.confirmPassword) {
      setFieldErrors((fe) => ({ ...fe, confirmPassword: "Passwords don't match." }));
      return;
    }
    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success("Account created. Please log in.");
      navigate("/login");
    } catch (err) {
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      setFormError(err.message || "Registration failed.");
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
        <h1 className="fs-xl">Create a customer account</h1>
        <p className="text-secondary text-sm" style={{ marginBottom: "var(--space-4)" }}>
          Submit and track complaints or service requests.
        </p>

        {formError && (
          <div className="error-banner" role="alert" style={{ marginBottom: "var(--space-4)" }}>
            {formError}
          </div>
        )}

        <div className="stack">
          <Field id="name" label="Full name" value={form.name} onChange={(v) => update("name", v)} error={fieldErrors.name} autoComplete="name" />
          <Field id="email" label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} error={fieldErrors.email} autoComplete="email" />
          <Field id="phone" label="Phone" value={form.phone} onChange={(v) => update("phone", v)} error={fieldErrors.phone} autoComplete="tel" hint="Digits only, e.g. 9000000004" />
          <Field id="password" label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} error={fieldErrors.password} autoComplete="new-password" hint="8-64 characters, with at least one letter and one digit" />
          <Field id="confirmPassword" label="Confirm password" type="password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} error={fieldErrors.confirmPassword} autoComplete="new-password" />

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </div>

        <p className="text-xs text-muted" style={{ marginTop: "var(--space-4)" }}>
          We store your name, email, phone and the complaints/requests you submit, only to provide this service and
          contact you about them. You can update or remove your details from your profile at any time.
        </p>

        <p className="text-sm text-secondary" style={{ marginTop: "var(--space-3)" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

function Field({ id, label, value, onChange, error, type = "text", autoComplete, hint }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={`input${error ? " has-error" : ""}`}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <span id={`${id}-error`} className="field-error">
          {error}
        </span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </div>
  );
}
