import { useState } from "react";
import { COMPLAINT_CATEGORIES, CATEGORY_LABELS, PRIORITIES, PRIORITY_LABELS, SERVICE_REQUEST_CATEGORIES } from "../../utils/constants";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TicketForm({ type, initialValues, onSubmit, onCancel, submitLabel = "Submit" }) {
  const isServiceRequest = type === "SERVICE_REQUEST";
  const categoryOptions = isServiceRequest ? SERVICE_REQUEST_CATEGORIES : COMPLAINT_CATEGORIES;
  const [form, setForm] = useState(
    initialValues || {
      category: categoryOptions[0],
      subject: "",
      description: "",
      priority: "MEDIUM",
      ...(isServiceRequest ? { preferredDate: todayStr() } : {}),
    }
  );
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
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      {formError && <div className="error-banner" role="alert">{formError}</div>}

      <div className="field">
        <label htmlFor="category">Category</label>
        <select id="category" className="input" value={form.category} onChange={(e) => update("category", e.target.value)}>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          className={`input${fieldErrors.subject ? " has-error" : ""}`}
          value={form.subject}
          maxLength={150}
          minLength={3}
          required
          onChange={(e) => update("subject", e.target.value)}
        />
        {fieldErrors.subject && <span className="field-error">{fieldErrors.subject}</span>}
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          className={`input${fieldErrors.description ? " has-error" : ""}`}
          value={form.description}
          maxLength={4000}
          minLength={10}
          required
          onChange={(e) => update("description", e.target.value)}
        />
        {fieldErrors.description ? (
          <span className="field-error">{fieldErrors.description}</span>
        ) : (
          <span className="field-hint">Include what happened and when, so we can help faster.</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="priority">Priority</label>
        <select id="priority" className="input" value={form.priority} onChange={(e) => update("priority", e.target.value)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {isServiceRequest && (
        <div className="field">
          <label htmlFor="preferredDate">Preferred date</label>
          <input
            id="preferredDate"
            type="date"
            className={`input${fieldErrors.preferredDate ? " has-error" : ""}`}
            value={form.preferredDate}
            min={todayStr()}
            required
            onChange={(e) => update("preferredDate", e.target.value)}
          />
          {fieldErrors.preferredDate && <span className="field-error">{fieldErrors.preferredDate}</span>}
        </div>
      )}

      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
