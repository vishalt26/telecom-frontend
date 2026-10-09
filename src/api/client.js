import axios from "axios";
import { getToken, clearToken } from "./tokenStore";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// /auth/login and /auth/register establish a session, so they never carry a token;
// every other endpoint — including /auth/me — needs it.
const NO_AUTH_PATHS = ["/auth/login", "/auth/register"];

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !NO_AUTH_PATHS.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearToken();
      onUnauthorized?.();
    }
    const normalized = error.response?.data || {
      timestamp: new Date().toISOString(),
      status: status || 0,
      error: "Network Error",
      message: status ? "Something went wrong. Please try again." : "Can't reach the server. Check your connection.",
    };
    if (status === 429) {
      const retryAfter = error.response.headers?.["retry-after"];
      normalized.message = normalized.message || "Too many attempts. Please wait a minute and try again.";
      normalized.retryAfterSeconds = retryAfter ? Number(retryAfter) : 60;
    }
    return Promise.reject(normalized);
  }
);
