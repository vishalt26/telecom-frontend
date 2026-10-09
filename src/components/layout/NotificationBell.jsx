import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUnreadCount, listNotifications, markAllNotificationsRead, markNotificationRead } from "../../api/notifications";
import { timeAgo } from "../../utils/formatters";
import { notificationLinkPath } from "../../utils/tickets";
import { emitNewNotifications, onUnreadRecheckRequested } from "../../utils/notificationsBus";

const POLL_MS = 30000; // "real-time" tracking = periodic refresh, per docs/api-contract.md

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const rootRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let previous = null;
    const poll = () => {
      getUnreadCount()
        .then((data) => {
          if (cancelled) return;
          setUnreadCount(data.unread);
          // Skip the first poll (nothing to compare against) so mounting the bell
          // doesn't itself trigger a refresh everywhere.
          if (previous !== null && data.unread > previous) emitNewNotifications();
          previous = data.unread;
        })
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, POLL_MS);
    // A page that just marked something read (e.g. opening a ticket, which the
    // backend now marks read as a side effect) can ask for an immediate recheck
    // instead of waiting out the rest of this interval.
    const unsubscribe = onUnreadRecheckRequested(poll);
    return () => {
      cancelled = true;
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (open) {
      listNotifications({ size: 8 })
        .then((data) => setItems(data.content || []))
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleClick(n) {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationRead(n.id).catch(() => {});
    }
    setOpen(false);
    const path = notificationLinkPath(n);
    if (path) navigate(path);
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnreadCount(0);
    markAllNotificationsRead().catch(() => {});
  }

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9a6 6 0 1 1 12 0c0 3 1 4.5 2 6H4c1-1.5 2-3 2-6Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && <span className="notif-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-panel card" role="menu">
          <div className="row-between" style={{ marginBottom: "var(--space-2)" }}>
            <strong className="text-sm">Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-secondary text-sm">You're all caught up.</p>
          ) : (
            <ul className="notif-list">
              {items.map((n) => (
                <li key={n.id}>
                  <button type="button" className={`notif-item${n.read ? "" : " unread"}`} onClick={() => handleClick(n)}>
                    <span>{n.message}</span>
                    <span className="text-xs text-muted">{timeAgo(n.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", marginTop: "var(--space-2)" }}
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
}
