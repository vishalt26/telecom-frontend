import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ticketApiFor } from "../../api/tickets";
import { resourceForType } from "../../utils/tickets";
import { STATUSES, STATUS_LABELS } from "../../utils/constants";
import TicketList from "../../components/tickets/TicketList";
import Pagination from "../../components/common/Pagination";

export default function TicketListPage({ type, title, newLabel }) {
  const api = ticketApiFor(type);
  const resource = resourceForType(type);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .list({ page, size: 10, ...(status ? { status } : {}) })
      .then(setData)
      .catch((err) => setError(err.message || "Couldn't load your tickets."))
      .finally(() => setLoading(false));
  }, [api, page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="stack">
      <div className="page-header">
        <h1>{title}</h1>
        <Link to={`/${resource}/new`} className="btn btn-primary">
          {newLabel}
        </Link>
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
        tickets={data.content}
        loading={loading}
        error={error}
        onRetry={load}
        emptyTitle={status ? "No tickets with this status" : "No tickets yet"}
        emptyMessage={status ? "Try a different status filter." : `You haven't submitted any ${title.toLowerCase()} yet.`}
        emptyAction={
          !status && (
            <Link to={`/${resource}/new`} className="btn btn-primary btn-sm">
              {newLabel}
            </Link>
          )
        }
      />
      <Pagination page={data.page ?? 0} totalPages={data.totalPages ?? 1} onChange={setPage} />
    </div>
  );
}
