import { STATUS_LABELS } from "../../utils/constants";

export default function StatusBadge({ status }) {
  const key = (status || "").toLowerCase();
  return (
    <span className={`badge badge-${key}`}>
      <span className="badge-dot" aria-hidden="true" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
