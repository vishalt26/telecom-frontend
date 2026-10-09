import { PRIORITY_LABELS } from "../../utils/constants";

export default function PriorityBadge({ priority }) {
  if (!priority) return <span className="text-muted text-sm">—</span>;
  const key = priority.toLowerCase();
  return <span className={`badge badge-${key}`}>{PRIORITY_LABELS[priority] || priority}</span>;
}
