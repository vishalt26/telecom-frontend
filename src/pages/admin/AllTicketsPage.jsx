import { useCallback, useEffect, useState } from "react";
import { complaintsApi, serviceRequestsApi } from "../../api/tickets";
import { MAX_PAGE_SIZE, STATUSES, STATUS_LABELS } from "../../utils/constants";
import TicketList from "../../components/tickets/TicketList";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 10;

export default function AllTicketsPage() {
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(0);
  const [all, setAll] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    setAll(null);
    const params = { size: MAX_PAGE_SIZE, ...(status ? { status } : {}) };
    Promise.all([
      type === "SERVICE_REQUEST" ? Promise.resolve({ content: [] }) : complaintsApi.list(params),
      type === "COMPLAINT" ? Promise.resolve({ content: [] }) : serviceRequestsApi.list(params),
    ])
      .then(([complaints, serviceRequests]) => {
        const merged = [...complaints.content, ...serviceRequests.content].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAll(merged);
      })
      .catch((err) => setError(err.message || "Couldn't load tickets."));
  }, [status, type]);

  useEffect(load, [load]);

  const totalPages = all ? Math.max(1, Math.ceil(all.length / PAGE_SIZE)) : 1;
  const pageItems = all ? all.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) : [];

  return (
    <div className="stack">
      <div className="page-header">
        <h1>All Tickets</h1>
      </div>

      <div className="row" style={{ flexWrap: "wrap" }}>
        <div className="field" style={{ gap: 4 }}>
          <label htmlFor="type-filter" className="text-sm text-secondary">
            Type
          </label>
          <select
            id="type-filter"
            className="input"
            style={{ maxWidth: 200 }}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All types</option>
            <option value="COMPLAINT">Complaints</option>
            <option value="SERVICE_REQUEST">Service requests</option>
          </select>
        </div>
        <div className="field" style={{ gap: 4 }}>
          <label htmlFor="status-filter" className="text-sm text-secondary">
            Status
          </label>
          <select
            id="status-filter"
            className="input"
            style={{ maxWidth: 200 }}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TicketList
        tickets={pageItems}
        loading={!all && !error}
        error={error}
        onRetry={load}
        showType
        showCustomer
        showAssignee
        emptyTitle="No tickets found"
        emptyMessage="Try adjusting the filters."
      />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
