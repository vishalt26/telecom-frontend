import { client } from "./client";

function crud(base) {
  return {
    list: (params) => client.get(base, { params }).then((r) => r.data),
    create: (data) => client.post(base, data).then((r) => r.data),
    update: (id, data) => client.put(`${base}/${id}`, data).then((r) => r.data),
    remove: (id) => client.delete(`${base}/${id}`).then((r) => r.data),
  };
}

export const customersApi = crud("/admin/customers");
export const employeesApi = crud("/admin/employees");

export function getReportsSummary() {
  return client.get("/admin/reports/summary").then((r) => r.data);
}

export function getReportsTrends(params) {
  return client.get("/admin/reports/trends", { params }).then((r) => r.data);
}
