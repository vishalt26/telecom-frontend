import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateProfile, changePassword } from "../api/profile";

export default function ProfilePage() {
  const { user, updateUserLocal } = useAuth();
  const toast = useToast();

  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <h1>Profile</h1>
      </div>
      <ProfileForm user={user} onSaved={updateUserLocal} toast={toast} />
      <PasswordForm toast={toast} />
    </div>
  );
}

function ProfileForm({ user, onSaved, toast }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await updateProfile(form);
      onSaved(updated);
      toast.success("Profile updated.");
      setFieldErrors({});
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      if (!err.fieldErrors) toast.error(err.message || "Couldn't update profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2 className="card-title" style={{ marginBottom: 0 }}>
        Your details
      </h2>
      <div className="field">
        <label>Email</label>
        <input className="input" value={user.email} disabled />
        <span className="field-hint">Email can't be changed here.</span>
      </div>
      <div className="field">
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          className={`input${fieldErrors.name ? " has-error" : ""}`}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
      </div>
      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          className={`input${fieldErrors.phone ? " has-error" : ""}`}
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
      </div>
      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ alignSelf: "flex-start" }}>
        {submitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function PasswordForm({ toast }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords don't match." });
      return;
    }
    setSubmitting(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success("Password changed.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setFieldErrors({});
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      if (!err.fieldErrors) toast.error(err.message || "Couldn't change password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2 className="card-title" style={{ marginBottom: 0 }}>
        Change password
      </h2>
      <div className="field">
        <label htmlFor="currentPassword">Current password</label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          className={`input${fieldErrors.currentPassword ? " has-error" : ""}`}
          value={form.currentPassword}
          onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
          required
        />
        {fieldErrors.currentPassword && <span className="field-error">{fieldErrors.currentPassword}</span>}
      </div>
      <div className="field">
        <label htmlFor="newPassword">New password</label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          className={`input${fieldErrors.newPassword ? " has-error" : ""}`}
          value={form.newPassword}
          onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
          required
        />
        {fieldErrors.newPassword && <span className="field-error">{fieldErrors.newPassword}</span>}
      </div>
      <div className="field">
        <label htmlFor="confirmPassword">Confirm new password</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={`input${fieldErrors.confirmPassword ? " has-error" : ""}`}
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          required
        />
        {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
      </div>
      <button type="submit" className="btn btn-secondary" disabled={submitting} style={{ alignSelf: "flex-start" }}>
        {submitting ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
