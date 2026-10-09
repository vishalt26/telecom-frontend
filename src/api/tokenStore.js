// JWT kept in memory first (per docs/security.md); sessionStorage only backs it up
// so a page refresh doesn't force a re-login. Never persisted to localStorage.
const SESSION_KEY = "telecom_access_token";

let token = sessionStorage.getItem(SESSION_KEY) || null;
const listeners = new Set();

export function getToken() {
  return token;
}

export function setToken(next) {
  token = next;
  if (next) {
    sessionStorage.setItem(SESSION_KEY, next);
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
  listeners.forEach((fn) => fn(token));
}

export function clearToken() {
  setToken(null);
}

export function onTokenChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
