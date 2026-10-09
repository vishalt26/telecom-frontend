import { client } from "./client";

export function getProfile() {
  return client.get("/profile").then((r) => r.data);
}

export function updateProfile(data) {
  return client.put("/profile", data).then((r) => r.data);
}

export function changePassword(data) {
  return client.put("/profile/password", data).then((r) => r.data);
}
