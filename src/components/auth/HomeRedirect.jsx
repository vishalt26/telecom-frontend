import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HOME_BY_ROLE = {
  CUSTOMER: "/dashboard",
  EMPLOYEE: "/assigned",
  ADMIN: "/admin",
};

export default function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={HOME_BY_ROLE[user.role] || "/login"} replace />;
}
