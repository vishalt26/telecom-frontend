import { CATEGORY_LABELS } from "./constants";

export function resourceForType(type) {
  return type === "COMPLAINT" ? "complaints" : "service-requests";
}

export function typeForResource(resource) {
  return resource === "complaints" ? "COMPLAINT" : "SERVICE_REQUEST";
}

export function detailPath(ticket) {
  return `/tickets/${resourceForType(ticket.type)}/${ticket.id}`;
}

export function ticketTitle(ticket) {
  return ticket.subject;
}

export function ticketCategoryLabel(ticket) {
  return CATEGORY_LABELS[ticket.category] || ticket.category;
}

export function ticketTypeLabel(ticket) {
  return ticket.type === "COMPLAINT" ? "Complaint" : "Service request";
}

/**
 * Where a notification should link to. Prefers the direct path from `ticketType`
 * (added in API changes, see COORDINATION.md); falls back to the `/tickets/:id`
 * resolver for older notifications that predate that field.
 */
export function notificationLinkPath(notification) {
  if (!notification.ticketId) return null;
  if (notification.ticketType) return `/tickets/${resourceForType(notification.ticketType)}/${notification.ticketId}`;
  return `/tickets/${notification.ticketId}`;
}
