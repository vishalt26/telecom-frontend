import { useEffect, useState } from "react";

const empty = { name: "", email: "", phone: "", password: "", newPassword: "" };

export default function UserFormModal({ open, mode, initialValues, onSubmit, onCancel, roleLabel }) {
  const [form, setForm] = useState(empty);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialValues ? { ...empty, ...initialValues, password: "" } : empty);
      setFieldErrors({});
      setFormError("");
    }
  }, [open, initialValues]);

  if (!open) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((fe) => ({ ...fe, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const payload =
        mode === "create"
          ? { name: form.name, email: form.email, phone: form.phone, password: form.password }
          : { name: form.name, phone: form.phone, ...(form.newPassword ? { newPassword: form.newPassword } : {}) };
      await onSubmit(payload);
    } catch (err) {
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <form className="modal card stack" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{mode === "create" ? `Add ${roleLabel}` : `Edit ${roleLabel}`}</h3>
        {formError && <div className="error-banner" role="alert">{formError}</div>}

        <div className="field">
          <label htmlFor="uf-name">Full name</label>
          <input id="uf-name" className={`input${fieldErrors.name ? " has-error" : ""}`} value={form.name} onChange={(e) => update("name", e.target.value)} required />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="uf-email">Email</label>
          <input
            id="uf-email"
            type="email"
            className={`input${fieldErrors.email ? " has-error" : ""}`}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            disabled={mode === "edit"}
            required
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="uf-phone">Phone</label>
          <input id="uf-phone" className={`input${fieldErrors.phone ? " has-error" : ""}`} value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </div>
        {mode === "create" ? (
          <div className="field">
            <label htmlFor="uf-password">Temporary password</label>
            <input
              id="uf-password"
              type="text"
              className={`input${fieldErrors.password ? " has-error" : ""}`}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
            {fieldErrors.password ? (
              <span className="field-error">{fieldErrors.password}</span>
            ) : (
              <span className="field-hint">At least 8 characters, with a letter and a digit.</span>
            )}
          </div>
        ) : (
          <div className="field">
            <label htmlFor="uf-newPassword">Reset password (optional)</label>
            <input
              id="uf-newPassword"
              type="text"
              className={`input${fieldErrors.newPassword ? " has-error" : ""}`}
              value={form.newPassword}
              onChange={(e) => update("newPassword", e.target.value)}
              placeholder="Leave blank to keep current password"
            />
            {fieldErrors.newPassword && <span className="field-error">{fieldErrors.newPassword}</span>}
          </div>
        )}

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : mode === "create" ? "Add" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
