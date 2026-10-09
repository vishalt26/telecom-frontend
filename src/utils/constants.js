export const ROLES = {
  CUSTOMER: "CUSTOMER",
  EMPLOYEE: "EMPLOYEE",
  ADMIN: "ADMIN",
};

export const STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED", "COMPLETED"];

export const STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  COMPLETED: "Completed",
};

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const TICKET_TYPES = {
  COMPLAINT: "COMPLAINT",
  SERVICE_REQUEST: "SERVICE_REQUEST",
};

// Both resources share the same Category enum (docs/api-contract.md) — the backend
// accepts any value on either, these are just the suggested groupings per type.
export const CATEGORIES = ["NETWORK", "BILLING", "SIM", "BROADBAND", "NEW_CONNECTION", "PLAN_CHANGE", "OTHER"];

export const CATEGORY_LABELS = {
  NETWORK: "Network",
  BILLING: "Billing",
  SIM: "SIM",
  BROADBAND: "Broadband",
  NEW_CONNECTION: "New connection",
  PLAN_CHANGE: "Plan change",
  OTHER: "Other",
};

export const COMPLAINT_CATEGORIES = ["NETWORK", "BILLING", "SIM", "BROADBAND", "OTHER"];
export const SERVICE_REQUEST_CATEGORIES = ["NEW_CONNECTION", "PLAN_CHANGE", "SIM", "BROADBAND", "OTHER"];

/** Forward lifecycle an ADMIN or the assigned EMPLOYEE can apply (reopen included; COMPLETED is customer-only). */
export const STAFF_NEXT_STATUSES = {
  PENDING: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["IN_PROGRESS"],
  COMPLETED: [],
};

/** A customer (ticket owner) may only confirm or reopen a RESOLVED ticket. */
export const CUSTOMER_NEXT_STATUSES = {
  PENDING: [],
  IN_PROGRESS: [],
  RESOLVED: ["COMPLETED", "IN_PROGRESS"],
  COMPLETED: [],
};

export const PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50; // backend caps page size at 50
