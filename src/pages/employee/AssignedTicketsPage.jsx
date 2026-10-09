import { useCallback, useEffect, useState } from "react";
import { complaintsApi, serviceRequestsApi } from "../../api/tickets";
import { MAX_PAGE_SIZE, STATUSES, STATUS_LABELS } from "../../utils/constants";
import TicketList from "../../components/tickets/TicketList";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 10;

export default function AssignedTicketsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [all, setAll] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    setAll(null);
    Promise.all([
      complaintsApi.list({ size: MAX_PAGE_SIZE, ...(status ? { status } : {}) }),
      serviceRequestsApi.list({ size: MAX_PAGE_SIZE, ...(status ? { status } : {}) }),
    ])
      .then(([complaints, serviceRequests]) => {
        const merged = [...complaints.content, ...serviceRequests.content].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAll(merged);
      })
      .catch((err) => setError(err.message || "Couldn't load assigned tickets."));
  }, [status]);

  useEffect(load, [load]);

  const totalPages = all ? Math.max(1, Math.ceil(all.length / PAGE_SIZE)) : 1;
  const pageItems = all ? all.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) : [];

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Assigned Tickets</h1>
      </div>

      <div className="row">
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
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <TicketList
        tickets={pageItems}
        loading={!all && !error}
        error={error}
        onRetry={load}
        showType
        showCustomer
        emptyTitle="Nothing assigned to you"
        emptyMessage="New tickets assigned to you by an admin will show up here."
      />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
