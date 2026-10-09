import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { complaintsApi, serviceRequestsApi } from "../../api/tickets";
import { useAuth } from "../../context/AuthContext";
import { MAX_PAGE_SIZE } from "../../utils/constants";
import { onNewNotifications } from "../../utils/notificationsBus";
import StatCard from "../../components/common/StatCard";
import TicketList from "../../components/tickets/TicketList";
import LoadingState from "../../components/common/LoadingState";
import ErrorBanner from "../../components/common/ErrorBanner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState("");

  function load({ silent = false } = {}) {
    if (!silent) {
      setError("");
      setTickets(null);
    }
    Promise.all([complaintsApi.list({ size: MAX_PAGE_SIZE }), serviceRequestsApi.list({ size: MAX_PAGE_SIZE })])
      .then(([complaints, serviceRequests]) => {
        const merged = [...complaints.content, ...serviceRequests.content].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTickets(merged);
        if (silent) setError("");
      })
      .catch((err) => {
        // A silent background refresh (triggered by a new notification) shouldn't
        // replace a working dashboard with an error banner — just skip it.
        if (!silent) setError(err.message || "Couldn't load your dashboard.");
      });
  }

  useEffect(() => load(), []);
  // Notifications mean something changed server-side (e.g. a ticket got resolved
  // elsewhere) — quietly refetch so the dashboard doesn't look stale until reload.
  useEffect(() => onNewNotifications(() => load({ silent: true })), []);

  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!tickets) return <LoadingState label="Loading your dashboard…" />;

  const counts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const open = tickets.filter((t) => t.status !== "COMPLETED").length;

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="page-subtitle">Here's where things stand with your complaints and service requests.</p>
        </div>
        <div className="row">
          <Link to="/complaints/new" className="btn btn-secondary">
            New complaint
          </Link>
          <Link to="/service-requests/new" className="btn btn-primary">
            New service request
          </Link>
        </div>
      </div>

      <div className="grid grid-cards">
        <StatCard label="Open tickets" value={open} />
        <StatCard label="Pending" value={counts.PENDING || 0} />
        <StatCard label="In progress" value={counts.IN_PROGRESS || 0} />
        <StatCard label="Resolved" value={(counts.RESOLVED || 0) + (counts.COMPLETED || 0)} />
      </div>

      <div className="card">
        <h2 className="card-title">Recent activity</h2>
        <TicketList
          tickets={tickets.slice(0, 8)}
          loading={false}
          error=""
          showType
          emptyTitle="No activity yet"
          emptyMessage="Submit a complaint or service request to see it here."
        />
      </div>
    </div>
  );
}
