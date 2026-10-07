import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface StudentTopbarProps {
  onOpenSidebar: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  breadcrumb?: {
    parent?: string;
    parentLink?: string;
    current: string;
  };
}

export const StudentTopbar: React.FC<StudentTopbarProps> = ({
  onOpenSidebar,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search courses, lessons...",
}) => {
  const { user, logout, roleLabel } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.name || "Student";
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <header className="dashboard-topbar">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onOpenSidebar}
        aria-label="Open menu"
      >
        ☰
      </button>

      <Link to="/student/dashboard" className="mobile-dashboard-logo">
        <span className="dashboard-logo-icon">L</span>
        LearnHub
      </Link>

      <div className="dashboard-search">
        <span className="dashboard-search-icon">🔍</span>
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
        <span className="search-shortcut">Ctrl K</span>
      </div>

      <div className="dashboard-top-actions">
        <Link
          to="/courses"
          className="dashboard-icon-button"
          aria-label="Help Center"
          title="Help Center"
        >
          ?
        </Link>

        <Link
          to="/activities"
          className="dashboard-icon-button notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          🔔
          <span className="notification-indicator"></span>
        </Link>

        <div className="topbar-divider"></div>

        <div
          className="dashboard-user-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          tabIndex={0}
          role="button"
          style={{ position: "relative", cursor: "pointer" }}
        >
          <div className="dashboard-avatar">{userInitial}</div>

          <div className="dashboard-user-info">
            <strong>{displayName}</strong>
            <span>{roleLabel || "Student"}</span>
          </div>

          <span className="user-menu-arrow">{menuOpen ? "▲" : "▼"}</span>

          {menuOpen && (
            <div
              className="dashboard-dropdown-menu"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                padding: "8px",
                minWidth: "160px",
                zIndex: 1000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                to="/progress"
                style={{
                  display: "block",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  textDecoration: "none",
                }}
                onClick={() => setMenuOpen(false)}
              >
                👤 My Progress
              </Link>
              <Link
                to="/courses"
                style={{
                  display: "block",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  textDecoration: "none",
                }}
                onClick={() => setMenuOpen(false)}
              >
                📚 My Courses
              </Link>
              <hr
                style={{
                  margin: "6px 0",
                  borderColor: "#f3f4f6",
                  borderStyle: "solid",
                  borderWidth: "1px 0 0",
                }}
              />
              {!user?.roles?.includes("mentor") && (
                <button
                  type="button"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#4f46e5",
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    setMenuOpen(false);
                    if (window.confirm("Do you want to upgrade your account to Instructor?")) {
                      try {
                        await api.auth.becomeMentor({ headline: "New Instructor" });
                        alert("Success! You are now an instructor. Please login again to apply changes.");
                        logout();
                        navigate("/login");
                      } catch (err) {
                        alert("Failed to upgrade account");
                      }
                    }
                  }}
                >
                  🎓 Become Instructor
                </button>
              )}
              {user?.roles?.includes("mentor") && (
                <Link
                  to="/instructor/dashboard"
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#4f46e5",
                    textDecoration: "none",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  🎓 Instructor Dashboard
                </Link>
              )}
              <hr
                style={{
                  margin: "6px 0",
                  borderColor: "#f3f4f6",
                  borderStyle: "solid",
                  borderWidth: "1px 0 0",
                }}
              />
              <button
                type="button"
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#ef4444",
                  cursor: "pointer",
                }}
                onClick={handleLogout}
              >
                ↪ Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentTopbar;
