import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../pages/StudentDashboard.css";
import "../pages/Mentor.css";

interface MentorLayoutProps {
  children: ReactNode;
  activeItem?: "dashboard" | "courses" | "new";
}

export default function MentorLayout({ children, activeItem }: MentorLayoutProps) {
  const { user, logout, roleLabel } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const current =
    activeItem ||
    (location.pathname.startsWith("/mentor/courses/new")
      ? "new"
      : location.pathname.startsWith("/mentor/courses")
      ? "courses"
      : "dashboard");

  const name = user?.name || "Instructor";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="student-dashboard">
      {open && (
        <div
          className="dashboard-overlay"
          style={{ display: "block" }}
          onClick={() => setOpen(false)}
        ></div>
      )}

      <aside className={`dashboard-sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="dashboard-brand">
          <Link to="/mentor/dashboard" className="dashboard-logo" onClick={() => setOpen(false)}>
            <span className="dashboard-logo-icon">E</span>
            <span className="dashboard-logo-text">Eduverse</span>
          </Link>
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="dashboard-navigation">
          <div className="navigation-section">
            <span className="navigation-title">INSTRUCTOR STUDIO</span>

            <Link
              to="/mentor/dashboard"
              className={`dashboard-nav-item ${current === "dashboard" ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-item-icon">▦</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/mentor/courses"
              className={`dashboard-nav-item ${current === "courses" ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-item-icon">📚</span>
              <span>My Courses</span>
            </Link>

            <Link
              to="/mentor/courses/new"
              className={`dashboard-nav-item ${current === "new" ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-item-icon">➕</span>
              <span>Create Course</span>
            </Link>
          </div>

          <div className="navigation-section">
            <span className="navigation-title">SWITCH VIEW</span>
            <Link
              to="/student/dashboard"
              className="dashboard-nav-item"
              onClick={() => setOpen(false)}
            >
              <span className="nav-item-icon">🎓</span>
              <span>Student View</span>
            </Link>
          </div>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button type="button" className="dashboard-logout" onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div style={{ flex: 1 }}></div>

          <div className="dashboard-top-actions">
            <div className="dashboard-user-menu">
              <div className="dashboard-avatar">{name.charAt(0).toUpperCase()}</div>
              <div className="dashboard-user-info">
                <strong>{name}</strong>
                <span>{roleLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
