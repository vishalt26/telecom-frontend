import { client } from "./client";

/**
 * Shared client for /complaints and /service-requests — same shape & permissions
 * per docs/api-contract.md. `resource` is "complaints" | "service-requests".
 */
export function createTicketApi(resource) {
  const base = `/${resource}`;
  return {
    list: (params) => client.get(base, { params }).then((r) => r.data),
    get: (id) => client.get(`${base}/${id}`).then((r) => r.data),
    create: (data) => client.post(base, data).then((r) => r.data),
    update: (id, data) => client.put(`${base}/${id}`, data).then((r) => r.data),
    updateStatus: (id, data) => client.patch(`${base}/${id}/status`, data).then((r) => r.data),
    assign: (id, employeeId) => client.patch(`${base}/${id}/assign`, { employeeId }).then((r) => r.data),
    remove: (id) => client.delete(`${base}/${id}`).then((r) => r.data),
  };
}

export const complaintsApi = createTicketApi("complaints");
export const serviceRequestsApi = createTicketApi("service-requests");

export function ticketApiFor(type) {
  return type === "COMPLAINT" ? complaintsApi : serviceRequestsApi;
}
