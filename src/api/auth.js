import { client } from "./client";

export function register(data) {
  return client.post("/auth/register", data).then((r) => r.data);
}

export function login(data) {
  return client.post("/auth/login", data).then((r) => r.data);
}

export function fetchMe() {
  return client.get("/auth/me").then((r) => r.data);
}
