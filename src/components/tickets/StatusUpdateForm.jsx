import { useState } from "react";
import { STATUS_LABELS } from "../../utils/constants";

export default function StatusUpdateForm({ options, onUpdate, emptyMessage }) {
  const [status, setStatus] = useState(options[0] || "");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!options.length) {
    return <p className="text-sm text-muted">{emptyMessage || "No status change available right now."}</p>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onUpdate({ status, note });
      setNote("");
    } catch (err) {
      setError(err.message || "Couldn't update status.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="field">
        <label htmlFor="status">Move to</label>
        <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {options.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="note">Note (optional)</label>
        <textarea id="note" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What changed?" maxLength={500} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ alignSelf: "flex-start" }}>
        {submitting ? "Updating…" : "Update status"}
      </button>
    </form>
  );
}
