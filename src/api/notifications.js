import { client } from "./client";

export function listNotifications(params) {
  return client.get("/notifications", { params }).then((r) => r.data);
}

export function getUnreadCount() {
  return client.get("/notifications/unread-count").then((r) => r.data);
}

export function markNotificationRead(id) {
  return client.patch(`/notifications/${id}/read`).then((r) => r.data);
}

export function markAllNotificationsRead() {
  return client.post("/notifications/read-all").then((r) => r.data);
}
