import UserAdminPage from "./UserAdminPage";
import { employeesApi } from "../../api/admin";

export default function EmployeesPage() {
  return <UserAdminPage api={employeesApi} title="Employees" roleLabel="Employee" addLabel="Add employee" />;
}
