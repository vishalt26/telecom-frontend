// The free Render instance sleeps after ~15 min idle and takes ~2.5 min to wake up
// (see COORDINATION.md round 4). `client.js` flags any request still pending past
// SLOW_REQUEST_MS here; this is a tiny pub-sub (same pattern as notificationsBus.js)
// so a banner can show regardless of which page triggered the slow request —
// including login/register, which render outside the authenticated app shell.
const EVENT = "telecom:server-wake-status";

let activeSlowRequests = 0;

function currentlyWaking() {
  return activeSlowRequests > 0;
}

function notify() {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: currentlyWaking() }));
}

export function markSlowRequestStart() {
  activeSlowRequests += 1;
  notify();
}

export function markSlowRequestEnd() {
  activeSlowRequests = Math.max(0, activeSlowRequests - 1);
  notify();
}

export function onServerWakeStatusChange(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export function isServerCurrentlyWaking() {
  return currentlyWaking();
}
