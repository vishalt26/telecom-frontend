import MockAdapter from "axios-mock-adapter";
import { client } from "../api/client";
import { getDb, persist, resetDb, issueToken, userFromToken, toPublicUser } from "./db";
import { MAX_PAGE_SIZE, PAGE_SIZE, STAFF_NEXT_STATUSES, CUSTOMER_NEXT_STATUSES } from "../utils/constants";

const mock = new MockAdapter(client, { delayResponse: 350 });

function err(status, error, message, fieldErrors) {
  const body = { timestamp: new Date().toISOString(), status, error, message };
  if (fieldErrors) body.fieldErrors = fieldErrors;
  return [status, body];
}

function parseBody(config) {
  try {
    return config.data ? JSON.parse(config.data) : {};
  } catch {
    return {};
  }
}

function currentUser(config) {
  const auth = config.headers?.Authorization || config.headers?.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return userFromToken(token);
}

function requireAuth(config) {
  const user = currentUser(config);
  if (!user) return { error: err(401, "Unauthorized", "Missing or expired session. Please log in again.") };
  return { user };
}

function requireRole(user, roles) {
  if (!roles.includes(user.role)) {
    return err(403, "Forbidden", "You don't have permission to do this.");
  }
  return null;
}

function paginate(items, config, defaultSize = PAGE_SIZE) {
  const params = config.params || {};
  const page = Number(params.page ?? 0);
  const size = Math.min(Number(params.size ?? defaultSize), MAX_PAGE_SIZE);
  const start = page * size;
  const content = items.slice(start, start + size);
  return { content, page, size, totalElements: items.length, totalPages: Math.max(1, Math.ceil(items.length / size)) };
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
}

function isStrongPassword(v) {
  return !!v && v.length >= 8 && v.length <= 64 && /[A-Za-z]/.test(v) && /\d/.test(v);
}

function validateRegister(body) {
  const fieldErrors = {};
  if (!body.name || body.name.trim().length < 2 || body.name.trim().length > 100) fieldErrors.name = "Name must be 2-100 characters.";
  if (!isEmail(body.email)) fieldErrors.email = "Must be a valid email.";
  if (!body.phone || !/^\+?\d{7,15}$/.test(body.phone)) fieldErrors.phone = "Must be a valid phone number.";
  if (!isStrongPassword(body.password)) fieldErrors.password = "Password must be 8-64 characters with at least one letter and one digit.";
  return fieldErrors;
}

function ticketResponse(t, db, viewer, { includeHistory = true } = {}) {
  const customerUser = db.users.find((u) => u.id === t.customerId);
  const assigneeUser = t.assignedEmployeeId ? db.users.find((u) => u.id === t.assignedEmployeeId) : null;
  const isStaffViewer = viewer.role !== "CUSTOMER";
  const customer = customerUser
    ? { id: customerUser.id, name: customerUser.name, ...(isStaffViewer ? { email: customerUser.email, phone: customerUser.phone } : {}) }
    : undefined;
  const assignee = assigneeUser ? { id: assigneeUser.id, name: assigneeUser.name } : undefined;

  const base = {
    id: t.id,
    type: t.type,
    category: t.category,
    subject: t.subject,
    description: t.description,
    priority: t.priority,
    status: t.status,
    ...(t.preferredDate ? { preferredDate: t.preferredDate } : {}),
    customer,
    ...(assignee ? { assignee } : {}),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
  if (includeHistory) {
    base.history = t.history.map((h) => ({
      ...(h.fromStatus ? { fromStatus: h.fromStatus } : {}),
      toStatus: h.toStatus,
      ...(h.note ? { note: h.note } : {}),
      changedByName: h.changedByName,
      createdAt: h.createdAt,
    }));
  }
  return base;
}

function visible(user, ticket) {
  if (user.role === "ADMIN") return true;
  if (user.role === "EMPLOYEE") return ticket.assignedEmployeeId === user.id;
  return ticket.customerId === user.id;
}

function ticketPath(type) {
  return type === "COMPLAINT" ? "complaints" : "service-requests";
}

function scopedTickets(db, user, type) {
  const all = db.tickets.filter((t) => t.type === type);
  if (user.role === "ADMIN") return all;
  if (user.role === "EMPLOYEE") return all.filter((t) => t.assignedEmployeeId === user.id);
  return all.filter((t) => t.customerId === user.id);
}

function notify(db, userId, ticketId, ticketType, message) {
  db.notifications.unshift({ id: db.nextNotificationId++, userId, ticketId, ticketType, message, read: false, createdAt: new Date().toISOString() });
}

// ---------------- Auth ----------------
mock.onPost("/auth/register").reply((config) => {
  const body = parseBody(config);
  const fieldErrors = validateRegister(body);
  const db = getDb();
  if (db.users.some((u) => u.email.toLowerCase() === (body.email || "").toLowerCase())) {
    fieldErrors.email = "An account with this email already exists.";
  }
  if (Object.keys(fieldErrors).length) return err(400, "Bad Request", "Validation failed", fieldErrors);
  const user = { id: db.nextUserId++, name: body.name.trim(), email: body.email.trim(), phone: body.phone.trim(), role: "CUSTOMER", enabled: true, password: body.password, createdAt: new Date().toISOString() };
  db.users.push(user);
  persist();
  return [201, toPublicUser(user)];
});

mock.onPost("/auth/login").reply((config) => {
  const body = parseBody(config);
  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === (body.emailOrPhone || "").toLowerCase() || u.phone === body.emailOrPhone);
  if (!user || user.password !== body.password || user.enabled === false) {
    return err(401, "Unauthorized", "Invalid credentials.");
  }
  const accessToken = issueToken(user);
  return [200, { accessToken, tokenType: "Bearer", expiresInSeconds: 1800, user: toPublicUser(user) }];
});

mock.onGet("/auth/me").reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  return [200, toPublicUser(user)];
});

// ---------------- Profile ----------------
mock.onGet("/profile").reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  return [200, toPublicUser(user)];
});

mock.onPut("/profile").reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  const body = parseBody(config);
  const fieldErrors = {};
  if (!body.name || body.name.trim().length < 2) fieldErrors.name = "Name must be at least 2 characters.";
  if (!body.phone || !/^\+?\d{7,15}$/.test(body.phone)) fieldErrors.phone = "Must be a valid phone number.";
  if (Object.keys(fieldErrors).length) return err(400, "Bad Request", "Validation failed", fieldErrors);
  user.name = body.name.trim();
  user.phone = body.phone.trim();
  persist();
  return [200, toPublicUser(user)];
});

mock.onPut("/profile/password").reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  const body = parseBody(config);
  if (user.password !== body.currentPassword) {
    return err(400, "Bad Request", "Current password is incorrect.", { currentPassword: "Incorrect password." });
  }
  if (!isStrongPassword(body.newPassword)) {
    return err(400, "Bad Request", "Validation failed", { newPassword: "Password must be 8-64 characters with at least one letter and one digit." });
  }
  user.password = body.newPassword;
  persist();
  return [204];
});

// ---------------- Complaints & Service Requests ----------------
function registerTicketRoutes(type) {
  const base = `/${ticketPath(type)}`;

  mock.onPost(base).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    if (user.role !== "CUSTOMER") return err(403, "Forbidden", "Only customers can submit tickets.");
    const body = parseBody(config);
    const db = getDb();
    const fieldErrors = {};
    if (!body.category) fieldErrors.category = "Category is required.";
    if (!body.subject || body.subject.trim().length < 3 || body.subject.trim().length > 150) fieldErrors.subject = "Subject must be 3-150 characters.";
    if (!body.description || body.description.trim().length < 10 || body.description.trim().length > 4000) fieldErrors.description = "Description must be 10-4000 characters.";
    if (type === "SERVICE_REQUEST" && !body.preferredDate) fieldErrors.preferredDate = "Preferred date is required.";
    if (Object.keys(fieldErrors).length) return err(400, "Bad Request", "Validation failed", fieldErrors);

    const now = new Date().toISOString();
    const ticket = {
      id: db.nextTicketId++,
      type,
      customerId: user.id,
      category: body.category,
      subject: body.subject.trim(),
      description: body.description.trim(),
      priority: body.priority || "MEDIUM",
      status: "PENDING",
      preferredDate: type === "SERVICE_REQUEST" ? body.preferredDate : null,
      assignedEmployeeId: null,
      createdAt: now,
      updatedAt: now,
      history: [{ fromStatus: null, toStatus: "PENDING", note: "Submitted", changedByUserId: user.id, changedByName: user.name, createdAt: now }],
    };
    db.tickets.push(ticket);
    persist();
    return [201, ticketResponse(ticket, db, user)];
  });

  mock.onGet(base).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const db = getDb();
    let items = scopedTickets(db, user, type);
    const status = config.params?.status;
    if (status) items = items.filter((t) => t.status === status);
    items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const page = paginate(items, config);
    page.content = page.content.map((t) => ticketResponse(t, db, user, { includeHistory: false }));
    return [200, page];
  });

  mock.onGet(new RegExp(`^${base}/\\d+$`)).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const id = Number(config.url.split("/").pop());
    const db = getDb();
    const ticket = db.tickets.find((t) => t.id === id && t.type === type);
    if (!ticket || !visible(user, ticket)) return err(404, "Not Found", "Ticket not found.");
    return [200, ticketResponse(ticket, db, user)];
  });

  mock.onPut(new RegExp(`^${base}/\\d+$`)).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const id = Number(config.url.split("/").pop());
    const db = getDb();
    const ticket = db.tickets.find((t) => t.id === id && t.type === type);
    if (!ticket || (user.role === "CUSTOMER" && ticket.customerId !== user.id)) return err(404, "Not Found", "Ticket not found.");
    if (user.role !== "CUSTOMER") return err(403, "Forbidden", "Only the customer who owns this ticket can edit it.");
    if (ticket.status !== "PENDING") return err(409, "Conflict", "Only pending tickets can be edited.");
    const body = parseBody(config);
    const fieldErrors = {};
    if (!body.subject || body.subject.trim().length < 3 || body.subject.trim().length > 150) fieldErrors.subject = "Subject must be 3-150 characters.";
    if (!body.description || body.description.trim().length < 10) fieldErrors.description = "Description must be at least 10 characters.";
    if (Object.keys(fieldErrors).length) return err(400, "Bad Request", "Validation failed", fieldErrors);
    ticket.category = body.category ?? ticket.category;
    ticket.subject = body.subject.trim();
    ticket.description = body.description.trim();
    ticket.priority = body.priority ?? ticket.priority;
    if (type === "SERVICE_REQUEST") ticket.preferredDate = body.preferredDate ?? ticket.preferredDate;
    ticket.updatedAt = new Date().toISOString();
    persist();
    return [200, ticketResponse(ticket, db, user)];
  });

  mock.onPatch(new RegExp(`^${base}/\\d+/status$`)).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const id = Number(config.url.split("/")[2]);
    const db = getDb();
    const ticket = db.tickets.find((t) => t.id === id && t.type === type);
    if (!ticket || !visible(user, ticket)) return err(404, "Not Found", "Ticket not found.");

    const body = parseBody(config);
    if (!body.status) return err(400, "Bad Request", "Validation failed", { status: "Status is required." });

    if (user.role === "CUSTOMER") {
      const allowed = CUSTOMER_NEXT_STATUSES[ticket.status] || [];
      if (!allowed.includes(body.status)) return err(403, "Forbidden", "You can only confirm or reopen a resolved ticket.");
    } else {
      const allowed = STAFF_NEXT_STATUSES[ticket.status] || [];
      if (!allowed.includes(body.status)) return err(409, "Conflict", "That status change isn't allowed from the current status.");
    }

    const from = ticket.status;
    ticket.status = body.status;
    ticket.updatedAt = new Date().toISOString();
    ticket.history.push({ fromStatus: from, toStatus: body.status, note: body.note || undefined, changedByUserId: user.id, changedByName: user.name, createdAt: ticket.updatedAt });
    if (user.role !== "CUSTOMER") {
      notify(db, ticket.customerId, ticket.id, type, `Your ${type === "COMPLAINT" ? "complaint" : "service request"} #${ticket.id} is now ${body.status.replace("_", " ").toLowerCase()}.`);
    }
    persist();
    return [200, ticketResponse(ticket, db, user)];
  });

  mock.onPatch(new RegExp(`^${base}/\\d+/assign$`)).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const roleErr = requireRole(user, ["ADMIN"]);
    if (roleErr) return roleErr;
    const id = Number(config.url.split("/")[2]);
    const db = getDb();
    const ticket = db.tickets.find((t) => t.id === id && t.type === type);
    if (!ticket) return err(404, "Not Found", "Ticket not found.");
    if (ticket.status === "COMPLETED") return err(409, "Conflict", "Completed tickets can't be reassigned.");
    const body = parseBody(config);
    const employee = db.users.find((u) => u.id === body.employeeId && u.role === "EMPLOYEE" && u.enabled !== false);
    if (!employee) return err(400, "Bad Request", "Validation failed", { employeeId: "Must be a valid, enabled employee." });
    ticket.assignedEmployeeId = employee.id;
    ticket.updatedAt = new Date().toISOString();
    ticket.history.push({ toStatus: ticket.status, note: `Assigned to ${employee.name}.`, changedByUserId: user.id, changedByName: user.name, createdAt: ticket.updatedAt });
    notify(db, employee.id, ticket.id, type, `You've been assigned ${type === "COMPLAINT" ? "complaint" : "service request"} #${ticket.id}.`);
    persist();
    return [200, ticketResponse(ticket, db, user)];
  });

  mock.onDelete(new RegExp(`^${base}/\\d+$`)).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const id = Number(config.url.split("/").pop());
    const db = getDb();
    const idx = db.tickets.findIndex((t) => t.id === id && t.type === type);
    if (idx === -1) return err(404, "Not Found", "Ticket not found.");
    const ticket = db.tickets[idx];
    if (user.role !== "ADMIN") {
      if (ticket.customerId !== user.id) return err(404, "Not Found", "Ticket not found.");
      if (ticket.status !== "PENDING") return err(409, "Conflict", "Only pending tickets can be deleted.");
    }
    db.tickets.splice(idx, 1);
    persist();
    return [204];
  });
}

registerTicketRoutes("COMPLAINT");
registerTicketRoutes("SERVICE_REQUEST");

// ---------------- Admin: customers & employees ----------------
function registerUserAdminRoutes(role, segment) {
  const base = `/admin/${segment}`;

  mock.onGet(base).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const roleErr = requireRole(user, ["ADMIN"]);
    if (roleErr) return roleErr;
    const db = getDb();
    const q = (config.params?.q || "").toLowerCase();
    let items = db.users.filter((u) => u.role === role);
    if (q) items = items.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
    items = items.map(toPublicUser).sort((a, b) => a.name.localeCompare(b.name));
    return [200, paginate(items, config)];
  });

  mock.onGet(new RegExp(`^${base}/\\d+$`)).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const roleErr = requireRole(user, ["ADMIN"]);
    if (roleErr) return roleErr;
    const id = Number(config.url.split("/").pop());
    const db = getDb();
    const target = db.users.find((u) => u.id === id && u.role === role);
    if (!target) return err(404, "Not Found", `${segment.slice(0, -1)} not found.`);
    return [200, toPublicUser(target)];
  });

  mock.onPost(base).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const roleErr = requireRole(user, ["ADMIN"]);
    if (roleErr) return roleErr;
    const body = parseBody(config);
    const db = getDb();
    const fieldErrors = validateRegister(body);
    if (db.users.some((u) => u.email.toLowerCase() === (body.email || "").toLowerCase())) {
      fieldErrors.email = "An account with this email already exists.";
    }
    if (Object.keys(fieldErrors).length) return err(400, "Bad Request", "Validation failed", fieldErrors);
    const created = { id: db.nextUserId++, name: body.name.trim(), email: body.email.trim(), phone: body.phone.trim(), role, enabled: true, password: body.password, createdAt: new Date().toISOString() };
    db.users.push(created);
    persist();
    return [201, toPublicUser(created)];
  });

  mock.onPut(new RegExp(`^${base}/\\d+$`)).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const roleErr = requireRole(user, ["ADMIN"]);
    if (roleErr) return roleErr;
    const id = Number(config.url.split("/").pop());
    const db = getDb();
    const target = db.users.find((u) => u.id === id && u.role === role);
    if (!target) return err(404, "Not Found", `${segment.slice(0, -1)} not found.`);
    const body = parseBody(config);
    const fieldErrors = {};
    if (!body.name || body.name.trim().length < 2) fieldErrors.name = "Name must be at least 2 characters.";
    if (!body.phone || !/^\+?\d{7,15}$/.test(body.phone)) fieldErrors.phone = "Must be a valid phone number.";
    if (body.newPassword && !isStrongPassword(body.newPassword)) fieldErrors.newPassword = "Password must be 8-64 characters with at least one letter and one digit.";
    if (Object.keys(fieldErrors).length) return err(400, "Bad Request", "Validation failed", fieldErrors);
    target.name = body.name.trim();
    target.phone = body.phone.trim();
    if (typeof body.enabled === "boolean") target.enabled = body.enabled;
    if (body.newPassword) target.password = body.newPassword;
    persist();
    return [200, toPublicUser(target)];
  });

  mock.onDelete(new RegExp(`^${base}/\\d+$`)).reply((config) => {
    const { user, error } = requireAuth(config);
    if (error) return error;
    const roleErr = requireRole(user, ["ADMIN"]);
    if (roleErr) return roleErr;
    const id = Number(config.url.split("/").pop());
    const db = getDb();
    const idx = db.users.findIndex((u) => u.id === id && u.role === role);
    if (idx === -1) return err(404, "Not Found", `${segment.slice(0, -1)} not found.`);
    if (role === "CUSTOMER") {
      db.tickets = db.tickets.filter((t) => t.customerId !== id);
    } else {
      db.tickets.forEach((t) => {
        if (t.assignedEmployeeId === id) t.assignedEmployeeId = null;
      });
    }
    db.users.splice(idx, 1);
    persist();
    return [204];
  });
}

registerUserAdminRoutes("CUSTOMER", "customers");
registerUserAdminRoutes("EMPLOYEE", "employees");

// ---------------- Admin: reports ----------------
mock.onGet("/admin/reports/summary").reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  const roleErr = requireRole(user, ["ADMIN"]);
  if (roleErr) return roleErr;
  const db = getDb();
  const byStatus = {};
  const byCategory = {};
  const byType = { COMPLAINT: 0, SERVICE_REQUEST: 0 };
  let resolvedCount = 0;
  let resolutionHoursTotal = 0;
  let openCount = 0;
  let createdLast30Days = 0;
  const thirtyDaysAgo = Date.now() - 30 * 86400000;

  for (const t of db.tickets) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    byType[t.type] = (byType[t.type] || 0) + 1;
    if (t.status === "PENDING" || t.status === "IN_PROGRESS") openCount++;
    if (new Date(t.createdAt).getTime() >= thirtyDaysAgo) createdLast30Days++;
    const resolvedEntry = t.history.find((h) => h.toStatus === "RESOLVED");
    if (resolvedEntry) {
      resolvedCount += 1;
      resolutionHoursTotal += (new Date(resolvedEntry.createdAt) - new Date(t.createdAt)) / 36e5;
    }
  }

  const summary = {
    total: db.tickets.length,
    openCount,
    resolvedCount,
    createdLast30Days,
    byStatus,
    byCategory,
    byType,
  };
  if (resolvedCount > 0) summary.avgResolutionHours = Math.round((resolutionHoursTotal / resolvedCount) * 10) / 10;
  return [200, summary];
});

mock.onGet("/admin/reports/trends").reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  const roleErr = requireRole(user, ["ADMIN"]);
  if (roleErr) return roleErr;
  const db = getDb();
  const from = config.params?.from ? new Date(config.params.from) : new Date(Date.now() - 29 * 86400000);
  const to = config.params?.to ? new Date(config.params.to) : new Date();
  if ((to - from) / 86400000 > 366) return err(400, "Bad Request", "Date range can't exceed 366 days.");

  const days = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d).toISOString().slice(0, 10));
  }
  const createdByDay = Object.fromEntries(days.map((d) => [d, 0]));
  const resolvedByDay = Object.fromEntries(days.map((d) => [d, 0]));

  for (const t of db.tickets) {
    const createdDay = t.createdAt.slice(0, 10);
    if (createdDay in createdByDay) createdByDay[createdDay]++;
    const resolvedEntry = t.history.find((h) => h.toStatus === "RESOLVED");
    if (resolvedEntry) {
      const day = resolvedEntry.createdAt.slice(0, 10);
      if (day in resolvedByDay) resolvedByDay[day]++;
    }
  }

  return [200, days.map((date) => ({ date, created: createdByDay[date], resolved: resolvedByDay[date] }))];
});

// ---------------- Notifications ----------------
mock.onGet("/notifications/unread-count").reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  const db = getDb();
  const unread = db.notifications.filter((n) => n.userId === user.id && !n.read).length;
  return [200, { unread }];
});

mock.onGet("/notifications").reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  const db = getDb();
  const items = db.notifications.filter((n) => n.userId === user.id).map(({ userId: _userId, ...rest }) => rest);
  return [200, paginate(items, config, 20)];
});

mock.onPatch(/^\/notifications\/\d+\/read$/).reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  const id = Number(config.url.split("/")[2]);
  const db = getDb();
  const n = db.notifications.find((x) => x.id === id && x.userId === user.id);
  if (!n) return err(404, "Not Found", "Notification not found.");
  n.read = true;
  persist();
  return [204];
});

mock.onPost("/notifications/read-all").reply((config) => {
  const { user, error } = requireAuth(config);
  if (error) return error;
  const db = getDb();
  db.notifications.filter((n) => n.userId === user.id).forEach((n) => (n.read = true));
  persist();
  return [204];
});

mock.onAny(/.*/).passThrough();

export { resetDb };
