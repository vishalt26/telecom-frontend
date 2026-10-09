import axios from "axios";
import { getToken, clearToken } from "./tokenStore";
import { markSlowRequestEnd, markSlowRequestStart } from "../utils/serverWakeBus";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// The free Render plan sleeps after ~15 min idle and takes ~2.5 min (150s) to wake
// up (docs: COORDINATION.md round 4). 170s gives that a little margin instead of
// cutting it exactly at 150s.
const REQUEST_TIMEOUT_MS = 170000;
const SLOW_REQUEST_MS = 6000; // past this, assume it might be a cold start and say so

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

// /auth/login and /auth/register establish a session, so they never carry a token;
// every other endpoint — including /auth/me — needs it.
const NO_AUTH_PATHS = ["/auth/login", "/auth/register"];

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !NO_AUTH_PATHS.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.__slowTimer = setTimeout(() => {
    config.__slowFired = true;
    markSlowRequestStart();
  }, SLOW_REQUEST_MS);
  return config;
});

function clearSlowTimer(config) {
  if (!config) return;
  clearTimeout(config.__slowTimer);
  if (config.__slowFired) markSlowRequestEnd();
}

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

client.interceptors.response.use(
  (res) => {
    clearSlowTimer(res.config);
    return res;
  },
  (error) => {
    clearSlowTimer(error.config);
    const status = error.response?.status;
    if (status === 401) {
      clearToken();
      onUnauthorized?.();
    }
    const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
    const normalized = error.response?.data || {
      timestamp: new Date().toISOString(),
      status: status || 0,
      error: "Network Error",
      message: isTimeout
        ? "The server took too long to respond. If it's been idle, it may still be waking up — please try again in a moment."
        : status
          ? "Something went wrong. Please try again."
          : "Can't reach the server. Check your connection.",
    };
    if (status === 429) {
      const retryAfter = error.response.headers?.["retry-after"];
      normalized.message = normalized.message || "Too many attempts. Please wait a minute and try again.";
      normalized.retryAfterSeconds = retryAfter ? Number(retryAfter) : 60;
    }
    return Promise.reject(normalized);
  }
);
