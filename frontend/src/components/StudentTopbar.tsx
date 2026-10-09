
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu, Search, HelpCircle, Bell, User, BookOpen, Settings,
  GraduationCap, LogOut, ChevronDown, ChevronUp,
} from "lucide-react";
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

const avatarStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  minWidth: 38,
  borderRadius: "50%",
  objectFit: "cover",
  display: "block",
};

export const StudentTopbar: React.FC<StudentTopbarProps> = ({
  onOpenSidebar,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search courses, lessons...",
}) => {
  const { user, logout, isMentor, updateUser } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const displayName = user?.name || "Student";
  const userInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl = user?.avatarUrl?.trim() || "";

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    let cancelled = false;

    api.notifications
      .getAll(1, "student")
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

    if (!window.confirm("Do you want to upgrade your account to Instructor?")) {
      return;
    }

    try {
      const res = await api.auth.becomeMentor({
        headline: "New Instructor",
      });

      if (res.user) updateUser(res.user);
      navigate("/instructor/dashboard");
    } catch (err) {
      window.alert(
        getErrorMessage(err, "Failed to upgrade your account.")
      );
    }
  };

  const renderAvatar = () => {
    if (avatarUrl && !avatarLoadFailed) {
      return (
        <img
          key={avatarUrl}
          src={avatarUrl}
          alt={`${displayName}'s profile`}
          style={avatarStyle}
          onError={() => setAvatarLoadFailed(true)}
        />
      );
    }

    return (
      <div className="dashboard-avatar">
        {userInitial}
      </div>
    );
  };

  return (
    <header className="dashboard-topbar">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onOpenSidebar}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <Link to="/student/dashboard" className="mobile-dashboard-logo">
        <span className="dashboard-logo-icon">E</span>
        Eduverse
      </Link>

      <div className="dashboard-search">
        <span className="dashboard-search-icon">
          <Search size={16} color="#9ca3af" />
        </span>

        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      <div className="dashboard-top-actions">
        <Link
          to="/help"
          className="dashboard-icon-button"
          aria-label="Help Center"
          title="Help Center"
        >
          <HelpCircle size={20} />
        </Link>

        <Link
          to="/notifications"
          className="dashboard-icon-button notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="notification-indicator" />
          )}
        </Link>

        <div className="topbar-divider" />

        <div
          className="dashboard-user-menu"
          onClick={() => setMenuOpen((previous) => !previous)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setMenuOpen((previous) => !previous);
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={menuOpen}
          style={{ position: "relative", cursor: "pointer" }}
        >
          {renderAvatar()}

          <div className="dashboard-user-info">
            <strong>{displayName}</strong>
            <span>Student</span>
          </div>

          <span className="user-menu-arrow">
            {menuOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>

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
              <Link
                to="/profile"
                style={menuLinkStyle}
                onClick={() => setMenuOpen(false)}
              >
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <User size={16} /> My Profile
                </span>
              </Link>

              <Link
                to="/student/courses"
                style={menuLinkStyle}
                onClick={() => setMenuOpen(false)}
              >
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <BookOpen size={16} /> My Courses
                </span>
              </Link>

              <Link
                to="/settings"
                style={menuLinkStyle}
                onClick={() => setMenuOpen(false)}
              >
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Settings size={16} /> Settings
                </span>
              </Link>

              <hr style={dividerStyle} />

              {!isMentor && (
                <button
                  type="button"
                  style={{ ...menuButtonStyle, color: "#4f46e5" }}
                  onClick={handleBecomeInstructor}
                >
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <GraduationCap size={16} /> Become Instructor
                  </span>
                </button>
              )}

              {isMentor && (
                <Link
                  to="/instructor/dashboard"
                  style={{ ...menuLinkStyle, color: "#4f46e5" }}
                  onClick={() => setMenuOpen(false)}
                >
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <GraduationCap size={16} /> Instructor Dashboard
                  </span>
                </Link>
              )}

              <hr style={dividerStyle} />

              <button
                type="button"
                style={{ ...menuButtonStyle, color: "#ef4444" }}
                onClick={handleLogout}
              >
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <LogOut size={16} /> Logout
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentTopbar;