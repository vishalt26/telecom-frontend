export default function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        &#128203;
      </div>
      <h3>{title}</h3>
      {message && <p className="text-secondary">{message}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
