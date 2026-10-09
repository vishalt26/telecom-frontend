import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LINKS = {
  CUSTOMER: [
    { to: "/dashboard", label: "Dashboard", icon: "home" },
    { to: "/complaints", label: "My Complaints", icon: "flag" },
    { to: "/service-requests", label: "My Service Requests", icon: "box" },
    { to: "/profile", label: "Profile", icon: "user" },
  ],
  EMPLOYEE: [
    { to: "/assigned", label: "Assigned Tickets", icon: "flag" },
    { to: "/profile", label: "Profile", icon: "user" },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: "home" },
    { to: "/admin/tickets", label: "All Tickets", icon: "flag" },
    { to: "/admin/customers", label: "Customers", icon: "users" },
    { to: "/admin/employees", label: "Employees", icon: "briefcase" },
    { to: "/admin/reports", label: "Reports", icon: "chart" },
    { to: "/profile", label: "Profile", icon: "user" },
  ],
};

const ICONS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5",
  flag: "M5 3v18M5 4h11l-2 4 2 4H5",
  box: "M3 7l9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  users: "M8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8 0a3.5 3.5 0 1 0 0-7M2 20a6 6 0 0 1 12 0m2-6a6 6 0 0 1 6 6",
  briefcase: "M4 7h16v12H4V7Zm4 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  chart: "M4 20V10m6 10V4m6 16v-7",
};

function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

export default function Sidebar({ open, onNavigate }) {
  const { user } = useAuth();
  const links = LINKS[user?.role] || [];

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`} aria-label="Primary">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden="true">
          T
        </span>
        <span>Telecom Care</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            end={link.to !== "/admin"}
          >
            <Icon name={link.icon} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
