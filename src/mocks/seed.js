import { CATEGORIES, STATUSES } from "../utils/constants";

export const DEMO_PASSWORD = {
  ADMIN: "Admin123x",
  EMPLOYEE: "Employee123x",
  CUSTOMER: "Customer123x",
};

function iso(daysAgo, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

export const SEED_USERS = [
  { id: 1, name: "Asha Admin", email: "admin@telecom.test", phone: "9000000001", role: "ADMIN", enabled: true, password: DEMO_PASSWORD.ADMIN, createdAt: iso(120) },
  { id: 2, name: "Rahul Verma", email: "rahul.verma@telecom.test", phone: "9000000002", role: "EMPLOYEE", enabled: true, password: DEMO_PASSWORD.EMPLOYEE, createdAt: iso(110) },
  { id: 3, name: "Sneha Kulkarni", email: "sneha.kulkarni@telecom.test", phone: "9000000003", role: "EMPLOYEE", enabled: true, password: DEMO_PASSWORD.EMPLOYEE, createdAt: iso(100) },
  { id: 4, name: "Vikram Shah", email: "vikram.shah@example.test", phone: "9000000004", role: "CUSTOMER", enabled: true, password: DEMO_PASSWORD.CUSTOMER, createdAt: iso(90) },
  { id: 5, name: "Priya Nair", email: "priya.nair@example.test", phone: "9000000005", role: "CUSTOMER", enabled: true, password: DEMO_PASSWORD.CUSTOMER, createdAt: iso(75) },
  { id: 6, name: "Arjun Mehta", email: "arjun.mehta@example.test", phone: "9000000006", role: "CUSTOMER", enabled: true, password: DEMO_PASSWORD.CUSTOMER, createdAt: iso(60) },
];

const SUBJECTS = {
  NETWORK: ["No signal in area", "Frequent call drops", "Slow mobile data"],
  BILLING: ["Overcharged on last bill", "Plan discount not applied", "Duplicate charge"],
  SIM: ["SIM not activating", "SIM swap not working", "eSIM QR code failed"],
  BROADBAND: ["Broadband down since morning", "Frequent disconnections", "Router not getting WAN IP"],
  NEW_CONNECTION: ["New broadband connection request", "New mobile connection request"],
  PLAN_CHANGE: ["Upgrade to a higher data plan", "Downgrade billing plan"],
  OTHER: ["General service issue", "App login problem"],
};

const EMPLOYEES = [2, 3];
const CUSTOMERS = [4, 5, 6];

function pick(arr, i) {
  return arr[i % arr.length];
}

function buildHistory(createdAt, finalStatus, assignee, submitterName) {
  const order = ["PENDING", "IN_PROGRESS", "RESOLVED", "COMPLETED"];
  const history = [{ fromStatus: null, toStatus: "PENDING", note: "Submitted", changedByUserId: null, changedByName: submitterName, createdAt }];
  const finalIdx = order.indexOf(finalStatus);
  for (let i = 1; i <= finalIdx; i++) {
    const at = iso(Math.max(0, 20 - i * 5));
    const notes = {
      IN_PROGRESS: "Picked up and investigating.",
      RESOLVED: "Issue fixed and verified.",
      COMPLETED: "Confirmed resolved by customer.",
    };
    const byId = order[i] === "COMPLETED" ? null : assignee;
    const byName = order[i] === "COMPLETED" ? submitterName : SEED_USERS.find((u) => u.id === assignee)?.name || "System";
    history.push({ fromStatus: order[i - 1], toStatus: order[i], note: notes[order[i]], changedByUserId: byId, changedByName: byName, createdAt: at });
  }
  return history;
}

let nextId = 1;
function makeTicket({ type, customerId, category, subject, priority, status, assignedEmployeeId, createdAt, preferredDate }) {
  const submitterName = SEED_USERS.find((u) => u.id === customerId)?.name || "Customer";
  return {
    id: nextId++,
    type,
    customerId,
    category,
    subject,
    description: `${subject}. Reported by customer, needs attention.`,
    priority,
    status,
    preferredDate: preferredDate ?? null,
    assignedEmployeeId: assignedEmployeeId ?? null,
    createdAt,
    updatedAt: createdAt,
    history: buildHistory(createdAt, status, assignedEmployeeId, submitterName),
  };
}

export function buildSeedTickets() {
  nextId = 1;
  const tickets = [];
  const priorities = ["LOW", "MEDIUM", "HIGH"];
  const complaintCategories = ["NETWORK", "BILLING", "SIM", "BROADBAND", "OTHER"];
  const serviceCategories = ["NEW_CONNECTION", "PLAN_CHANGE", "SIM", "BROADBAND", "OTHER"];

  let dayOffset = 2;
  for (let i = 0; i < 24; i++) {
    const category = pick(complaintCategories, i);
    const customerId = pick(CUSTOMERS, i);
    const status = pick(STATUSES, i);
    const assignedEmployeeId = status === "PENDING" ? null : pick(EMPLOYEES, i);
    dayOffset += (i % 5) + 1;
    tickets.push(
      makeTicket({
        type: "COMPLAINT",
        customerId,
        category,
        subject: pick(SUBJECTS[category], i),
        priority: pick(priorities, i),
        status,
        assignedEmployeeId,
        createdAt: iso(Math.min(dayOffset, 44)),
      })
    );
  }

  dayOffset = 3;
  for (let i = 0; i < 12; i++) {
    const category = pick(serviceCategories, i);
    const customerId = pick(CUSTOMERS, i + 1);
    const status = pick(STATUSES, i + 2);
    const assignedEmployeeId = status === "PENDING" ? null : pick(EMPLOYEES, i + 1);
    dayOffset += (i % 4) + 2;
    const created = iso(Math.min(dayOffset, 44));
    tickets.push(
      makeTicket({
        type: "SERVICE_REQUEST",
        customerId,
        category,
        subject: pick(SUBJECTS[category], i),
        priority: pick(priorities, i + 1),
        status,
        assignedEmployeeId,
        createdAt: created,
        preferredDate: iso(Math.max(0, Math.min(dayOffset, 44) - 10)).slice(0, 10),
      })
    );
  }

  return tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function buildSeedNotifications(tickets) {
  const notifications = [];
  let id = 1;
  for (const t of tickets) {
    if (t.history.length > 1) {
      const last = t.history[t.history.length - 1];
      notifications.push({
        id: id++,
        userId: t.customerId,
        ticketId: t.id,
        ticketType: t.type,
        message: `Your ${t.type === "COMPLAINT" ? "complaint" : "service request"} #${t.id} is now ${last.toStatus.replace("_", " ").toLowerCase()}.`,
        read: Math.random() > 0.5,
        createdAt: last.createdAt,
      });
    }
  }
  return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export { CATEGORIES };
