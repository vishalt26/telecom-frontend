import { SEED_USERS, buildSeedTickets, buildSeedNotifications } from "./seed";

const STORAGE_KEY = "telecom_mock_db_v2";
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 min, matches docs/security.md guidance

function freshData() {
  const tickets = buildSeedTickets();
  return {
    users: SEED_USERS.map((u) => ({ ...u })),
    tickets,
    notifications: buildSeedNotifications(tickets),
    nextUserId: SEED_USERS.length + 1,
    nextTicketId: tickets.length + 1,
    nextNotificationId: buildSeedNotifications(tickets).length + 1,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to fresh data
  }
  const data = freshData();
  save(data);
  return data;
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let db = load();

export function resetDb() {
  db = freshData();
  save(db);
  return db;
}

export function getDb() {
  return db;
}

export function persist() {
  save(db);
}

// ---- fake-JWT helpers (demo only; real tokens are issued by the Spring Boot backend) ----
function b64urlEncode(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/=+$/, "");
}
function b64urlDecode(str) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch {
    return null;
  }
}

export function issueToken(user) {
  const payload = { sub: user.id, role: user.role, name: user.name, iat: Date.now(), exp: Date.now() + TOKEN_TTL_MS };
  return `mock.${b64urlEncode(payload)}.signature`;
}

export function decodeToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "mock") return null;
  const payload = b64urlDecode(parts[1]);
  if (!payload || payload.exp < Date.now()) return null;
  return payload;
}

export function userFromToken(token) {
  const payload = decodeToken(token);
  if (!payload) return null;
  return db.users.find((u) => u.id === payload.sub) || null;
}

export function toPublicUser(user) {
  if (!user) return null;
  const { password: _password, ...rest } = user;
  return rest;
}
