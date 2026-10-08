import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../services/api";

interface StudentTopbarProps {
  onOpenSidebar: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const menuLinkStyle: React.CSSProperties = {
  display: "block",
  padding: "8px 12px",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  textDecoration: "none",
};

const menuButtonStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  background: "none",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const dividerStyle: React.CSSProperties = {
  margin: "6px 0",
  borderColor: "#f3f4f6",
  borderStyle: "solid",
  borderWidth: "1px 0 0",
};

export const StudentTopbar: React.FC<StudentTopbarProps> = ({
  onOpenSidebar,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search courses, lessons...",
}) => {
  const { user, logout, roleLabel, isMentor, updateUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const displayName = user?.name || "Student";
  const userInitial = displayName.charAt(0).toUpperCase();

  // Only show the red dot when there really are unread notifications
  useEffect(() => {
    let cancelled = false;
    api.notifications
      .getAll(1)
      .then((res) => {
        if (!cancelled) setUnread(res.unreadCount || 0);
      })
      .catch(() => {
        if (!cancelled) setUnread(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const handleBecomeInstructor = async () => {
    setMenuOpen(false);
    if (!window.confirm("Do you want to upgrade your account to Instructor?")) return;
    try {
      const res = await api.auth.becomeMentor({ headline: "New Instructor" });
      if (res.user) updateUser(res.user);
      navigate("/instructor/dashboard");
    } catch (err) {
      window.alert(getErrorMessage(err, "Failed to upgrade your account."));
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
        <span className="dashboard-logo-icon">E</span>
        Eduverse
      </Link>

      <div className="dashboard-search">
        <span className="dashboard-search-icon">🔍</span>
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      <div className="dashboard-top-actions">
        <Link
          to="/help"
          className="dashboard-icon-button"
          aria-label="Help Center"
          title="Help Center"
        >
          ?
        </Link>

        <Link
          to="/notifications"
          className="dashboard-icon-button notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          🔔
          {unread > 0 && <span className="notification-indicator"></span>}
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
            <span>Student</span>
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
                minWidth: "180px",
                zIndex: 1000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Link to="/profile" style={menuLinkStyle} onClick={() => setMenuOpen(false)}>
                👤 My Profile
              </Link>
              <Link to="/student/courses" style={menuLinkStyle} onClick={() => setMenuOpen(false)}>
                📚 My Courses
              </Link>
              <Link to="/settings" style={menuLinkStyle} onClick={() => setMenuOpen(false)}>
                ⚙️ Settings
              </Link>

              <hr style={dividerStyle} />

              {!isMentor && (
                <button
                  type="button"
                  style={{ ...menuButtonStyle, color: "#4f46e5" }}
                  onClick={handleBecomeInstructor}
                >
                  🎓 Become Instructor
                </button>
              )}
              {isMentor && (
                <Link
                  to="/instructor/dashboard"
                  style={{ ...menuLinkStyle, color: "#4f46e5" }}
                  onClick={() => setMenuOpen(false)}
                >
                  🎓 Instructor Dashboard
                </Link>
              )}

              <hr style={dividerStyle} />

              <button
                type="button"
                style={{ ...menuButtonStyle, color: "#ef4444" }}
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
