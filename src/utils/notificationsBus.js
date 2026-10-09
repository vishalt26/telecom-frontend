// Tiny pub-sub so a rising unread-notification count (polled in NotificationBell)
// can tell other views — e.g. the customer dashboard — to quietly refetch,
// without wiring a bigger global store just for this.
const NEW_NOTIFICATIONS_EVENT = "telecom:new-notifications";

export function emitNewNotifications() {
  window.dispatchEvent(new Event(NEW_NOTIFICATIONS_EVENT));
}

export function onNewNotifications(handler) {
  window.addEventListener(NEW_NOTIFICATIONS_EVENT, handler);
  return () => window.removeEventListener(NEW_NOTIFICATIONS_EVENT, handler);
}

// The reverse direction: the backend now marks a ticket's notifications read as
// a side effect of GET-ing it (see COORDINATION.md API changes), so a page that
// just loaded a ticket can ask the bell to recheck /notifications/unread-count
// right away instead of waiting for its next ~30s poll.
const RECHECK_UNREAD_EVENT = "telecom:recheck-unread";

export function requestUnreadRecheck() {
  window.dispatchEvent(new Event(RECHECK_UNREAD_EVENT));
}

export function onUnreadRecheckRequested(handler) {
  window.addEventListener(RECHECK_UNREAD_EVENT, handler);
  return () => window.removeEventListener(RECHECK_UNREAD_EVENT, handler);
}
