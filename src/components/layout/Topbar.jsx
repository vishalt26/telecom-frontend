import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

function getInitialTheme() {
  return localStorage.getItem("telecom_theme") || "system";
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("telecom_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : t === "light" ? "system" : "dark"));
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <button type="button" className="btn btn-ghost btn-icon sidebar-toggle" aria-label="Toggle menu" onClick={onMenuClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <div className="topbar-spacer" />
      <div className="row">
        <button type="button" className="btn btn-ghost btn-icon" aria-label={`Theme: ${theme}`} title={`Theme: ${theme}`} onClick={toggleTheme}>
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.5A9 9 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5Z" /></svg>
          ) : theme === "light" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
          )}
        </button>
        <NotificationBell />
        <div className="user-menu">
          <button type="button" className="user-menu-trigger" onClick={() => setMenuOpen((v) => !v)}>
            <span className="avatar" aria-hidden="true">
              {(user?.name || "?").charAt(0).toUpperCase()}
            </span>
            <span className="user-menu-name">{user?.name}</span>
          </button>
          {menuOpen && (
            <div className="user-menu-panel card" role="menu" onMouseLeave={() => setMenuOpen(false)}>
              <p className="text-sm" style={{ marginBottom: "2px" }}>
                {user?.name}
              </p>
              <p className="text-xs text-muted" style={{ marginBottom: "var(--space-3)" }}>
                {user?.email}
              </p>
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
