import StatusBadge from "../common/StatusBadge";
import { formatDateTime } from "../../utils/formatters";

export default function StatusTimeline({ history }) {
  if (!history?.length) return null;
  return (
    <ol className="timeline">
      {history
        .slice()
        .reverse()
        .map((h, i) => (
          <li key={i} className="timeline-item">
            <div className="timeline-marker" aria-hidden="true" />
            <div className="timeline-body">
              <div className="row" style={{ gap: "var(--space-2)", flexWrap: "wrap" }}>
                {h.fromStatus && h.fromStatus !== h.toStatus && <StatusBadge status={h.fromStatus} />}
                {h.fromStatus && h.fromStatus !== h.toStatus && <span className="text-muted" aria-hidden="true">→</span>}
                <StatusBadge status={h.toStatus} />
                <span className="text-xs text-muted">{formatDateTime(h.createdAt)}</span>
              </div>
              {h.note && <p className="text-sm" style={{ marginTop: "var(--space-1)" }}>{h.note}</p>}
              <p className="text-xs text-muted" style={{ marginTop: "2px" }}>by {h.changedByName}</p>
            </div>
          </li>
        ))}
    </ol>
  );
}
