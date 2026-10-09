import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notifications";
import LoadingState from "../components/common/LoadingState";
import ErrorBanner from "../components/common/ErrorBanner";
import EmptyState from "../components/common/EmptyState";
import Pagination from "../components/common/Pagination";
import { timeAgo } from "../utils/formatters";
import { notificationLinkPath } from "../utils/tickets";

export default function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 1 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    listNotifications({ page, size: 20 })
      .then(setData)
      .catch((err) => setError(err.message || "Couldn't load notifications."))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleClick(n) {
    if (!n.read) {
      setData((d) => ({ ...d, content: d.content.map((x) => (x.id === n.id ? { ...x, read: true } : x)) }));
      markNotificationRead(n.id).catch(() => {});
    }
    const path = notificationLinkPath(n);
    if (path) navigate(path);
  }

  async function handleMarkAllRead() {
    setData((d) => ({ ...d, content: d.content.map((x) => ({ ...x, read: true })) }));
    markAllNotificationsRead().catch(() => {});
  }

  const hasUnread = data.content.some((n) => !n.read);

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Notifications</h1>
        {hasUnread && (
          <button type="button" className="btn btn-secondary" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState label="Loading notifications…" />
      ) : error ? (
        <ErrorBanner message={error} onRetry={load} />
      ) : data.content.length === 0 ? (
        <EmptyState title="No notifications" message="You're all caught up." />
      ) : (
        <>
          <ul className="notif-list card" style={{ padding: "var(--space-2)" }}>
            {data.content.map((n) => (
              <li key={n.id}>
                <button type="button" className={`notif-item${n.read ? "" : " unread"}`} onClick={() => handleClick(n)}>
                  <span>{n.message}</span>
                  <span className="text-xs text-muted">{timeAgo(n.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
          <Pagination page={data.page ?? 0} totalPages={data.totalPages ?? 1} onChange={setPage} />
        </>
      )}
    </div>
  );
}
