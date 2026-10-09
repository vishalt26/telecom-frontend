import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import PriorityBadge from "../common/PriorityBadge";
import EmptyState from "../common/EmptyState";
import LoadingState from "../common/LoadingState";
import ErrorBanner from "../common/ErrorBanner";
import { formatDate } from "../../utils/formatters";
import { detailPath, ticketCategoryLabel, ticketTitle, ticketTypeLabel } from "../../utils/tickets";

export default function TicketList({
  tickets,
  loading,
  error,
  onRetry,
  showType = false,
  showCustomer = false,
  showAssignee = false,
  emptyTitle = "No tickets yet",
  emptyMessage,
  emptyAction,
}) {
  if (loading) return <LoadingState label="Loading tickets…" />;
  if (error) return <ErrorBanner message={error} onRetry={onRetry} />;
  if (!tickets.length) return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            {showType && <th>Type</th>}
            <th>Subject</th>
            <th>Category</th>
            {showCustomer && <th>Customer</th>}
            {showAssignee && <th>Assigned to</th>}
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={`${t.type}-${t.id}`}>
              <td>#{t.id}</td>
              {showType && <td>{ticketTypeLabel(t)}</td>}
              <td className="wrap">{ticketTitle(t)}</td>
              <td>{ticketCategoryLabel(t)}</td>
              {showCustomer && <td>{t.customer?.name || "Unknown"}</td>}
              {showAssignee && <td>{t.assignee?.name || <span className="text-muted">Unassigned</span>}</td>}
              <td>
                <PriorityBadge priority={t.priority} />
              </td>
              <td>
                <StatusBadge status={t.status} />
              </td>
              <td>{formatDate(t.createdAt)}</td>
              <td>
                <Link to={detailPath(t)} className="btn btn-secondary btn-sm">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
