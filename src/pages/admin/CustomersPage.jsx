import UserAdminPage from "./UserAdminPage";
import { customersApi } from "../../api/admin";

export default function CustomersPage() {
  return <UserAdminPage api={customersApi} title="Customers" roleLabel="Customer" addLabel="Add customer" />;
}
