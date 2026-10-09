import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ticketApiFor } from "../api/tickets";
import { typeForResource, ticketTypeLabel } from "../utils/tickets";
import { requestUnreadRecheck } from "../utils/notificationsBus";
import { CATEGORY_LABELS, CUSTOMER_NEXT_STATUSES, STAFF_NEXT_STATUSES } from "../utils/constants";
import { formatDate, formatDateTime } from "../utils/formatters";
import StatusBadge from "../components/common/StatusBadge";
import PriorityBadge from "../components/common/PriorityBadge";
import LoadingState from "../components/common/LoadingState";
import ErrorBanner from "../components/common/ErrorBanner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import StatusTimeline from "../components/tickets/StatusTimeline";
import StatusUpdateForm from "../components/tickets/StatusUpdateForm";
import AssignForm from "../components/tickets/AssignForm";
import TicketForm from "../components/tickets/TicketForm";

export default function TicketDetailPage() {
  const { resource, id } = useParams();
  const type = typeForResource(resource);
  const api = ticketApiFor(type);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get(id)
      .then((data) => {
        setTicket(data);
        // Backend marks this ticket's notifications read as a side effect of this
        // GET (see COORDINATION.md API changes) — nudge the bell to recheck now
        // rather than waiting out its 30s poll.
        requestUnreadRecheck();
      })
      .catch((err) => setError(err.message || "Couldn't load this ticket."))
      .finally(() => setLoading(false));
  }, [api, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading ticket…" />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!ticket) return null;

  const isOwnerCustomer = user.role === "CUSTOMER" && ticket.customer?.id === user.id;
  const isAssignedEmployee = user.role === "EMPLOYEE" && ticket.assignee?.id === user.id;
  const staffOptions = (user.role === "ADMIN" || isAssignedEmployee) ? STAFF_NEXT_STATUSES[ticket.status] || [] : [];
  const customerOptions = isOwnerCustomer ? CUSTOMER_NEXT_STATUSES[ticket.status] || [] : [];
  const canEdit = isOwnerCustomer && ticket.status === "PENDING";
  const canDelete = user.role === "ADMIN" || (isOwnerCustomer && ticket.status === "PENDING");
  const backTo = user.role === "ADMIN" ? "/admin/tickets" : user.role === "EMPLOYEE" ? "/assigned" : `/${resource}`;

  async function handleStatusUpdate(payload) {
    const updated = await api.updateStatus(id, payload);
    setTicket(updated);
    toast.success("Status updated.");
  }

  async function handleAssign(employeeId) {
    const updated = await api.assign(id, employeeId);
    setTicket(updated);
    toast.success("Ticket assigned.");
  }

  async function handleEditSubmit(values) {
    const updated = await api.update(id, values);
    setTicket(updated);
    setEditing(false);
    toast.success("Ticket updated.");
  }

  async function handleDelete() {
    await api.remove(id);
    toast.success("Ticket deleted.");
    navigate(backTo);
  }

  return (
    <div className="stack">
      <Link to={backTo} className="back-link">
        ← Back
      </Link>

      <div className="page-header">
        <div>
          <h1>
            {ticketTypeLabel(ticket)} #{ticket.id}
          </h1>
          <p className="page-subtitle">{ticket.subject}</p>
        </div>
        <div className="row">
          <StatusBadge status={ticket.status} />
          {ticket.priority && <PriorityBadge priority={ticket.priority} />}
        </div>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <div className="card">
            <div className="row-between">
              <h2 className="card-title" style={{ marginBottom: 0 }}>
                Details
              </h2>
              {canEdit && !editing && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div style={{ marginTop: "var(--space-4)" }}>
                <TicketForm
                  type={ticket.type}
                  initialValues={{
                    category: ticket.category,
                    subject: ticket.subject,
                    description: ticket.description,
                    priority: ticket.priority,
                    ...(ticket.preferredDate ? { preferredDate: ticket.preferredDate } : {}),
                  }}
                  onSubmit={handleEditSubmit}
                  onCancel={() => setEditing(false)}
                  submitLabel="Save changes"
                />
              </div>
            ) : (
              <dl className="kv-grid" style={{ marginTop: "var(--space-3)" }}>
                <dt>Category</dt>
                <dd>{CATEGORY_LABELS[ticket.category] || ticket.category}</dd>
                <dt>Description</dt>
                <dd>{ticket.description}</dd>
                {ticket.preferredDate && (
                  <>
                    <dt>Preferred date</dt>
                    <dd>{formatDate(ticket.preferredDate)}</dd>
                  </>
                )}
                {user.role !== "CUSTOMER" && (
                  <>
                    <dt>Customer</dt>
                    <dd>
                      {ticket.customer?.name}
                      {ticket.customer?.email && <> · {ticket.customer.email}</>}
                      {ticket.customer?.phone && <> · {ticket.customer.phone}</>}
                    </dd>
                  </>
                )}
                <dt>Assigned to</dt>
                <dd>{ticket.assignee?.name || "Unassigned"}</dd>
                <dt>Created</dt>
                <dd>{formatDateTime(ticket.createdAt)}</dd>
                <dt>Last updated</dt>
                <dd>{formatDateTime(ticket.updatedAt)}</dd>
              </dl>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">History</h2>
            <StatusTimeline history={ticket.history} />
          </div>
        </div>

        <div className="stack">
          {staffOptions.length > 0 && (
            <div className="card">
              <h2 className="card-title">Update status</h2>
              <StatusUpdateForm key={ticket.status} options={staffOptions} onUpdate={handleStatusUpdate} />
            </div>
          )}

          {isOwnerCustomer && ticket.status === "RESOLVED" && (
            <div className="card">
              <h2 className="card-title">Confirm resolution</h2>
              <p className="text-sm text-secondary" style={{ marginBottom: "var(--space-3)" }}>
                If this fixed the issue, confirm it as completed. Otherwise, reopen it.
              </p>
              <StatusUpdateForm key={ticket.status} options={customerOptions} onUpdate={handleStatusUpdate} />
            </div>
          )}

          {user.role === "ADMIN" && (
            <div className="card">
              <h2 className="card-title">Assignment</h2>
              <AssignForm currentEmployeeId={ticket.assignee?.id} onAssign={handleAssign} />
            </div>
          )}

          {canDelete && (
            <div className="card">
              <h2 className="card-title">Danger zone</h2>
              <p className="text-sm text-secondary" style={{ marginBottom: "var(--space-3)" }}>
                Deleting a ticket can't be undone.
              </p>
              <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
                Delete ticket
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this ticket?"
        message={`Ticket #${ticket.id} will be permanently removed.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          handleDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
