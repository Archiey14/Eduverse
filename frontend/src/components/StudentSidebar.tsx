
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Search, FileQuestion, TrendingUp,
  Zap, Heart, Trophy, User, Settings, HelpCircle, GraduationCap,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface StudentSidebarProps {
  activeItem?: string;
  isOpen: boolean;
  onClose: () => void;
}

const keyFromPath = (pathname: string): string => {
  if (pathname === "/student/dashboard") return "dashboard";
  if (pathname.startsWith("/student/courses") || pathname.startsWith("/learn")) return "courses";
  if (pathname.startsWith("/courses") || pathname.startsWith("/discover")) return "catalog";
  if (pathname.startsWith("/quizzes")) return "quizzes";
  if (pathname.startsWith("/progress")) return "progress";
  if (pathname.startsWith("/wishlist")) return "wishlist";
  if (pathname.startsWith("/achievements")) return "achievements";
  if (pathname.startsWith("/activities")) return "activities";
  if (pathname.startsWith("/notifications")) return "notifications";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/help")) return "help";
  return "";
};

const sidebarAvatarStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  minWidth: 44,
  borderRadius: "50%",
  objectFit: "cover",
  display: "block",
};

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  activeItem,
  isOpen,
  onClose,
}) => {
  const { user, logout, isMentor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const current = keyFromPath(location.pathname) || activeItem || "";
  const displayName = user?.name || "Student";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = user?.avatarUrl?.trim() || "";

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUrl]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const item = (
    key: string,
    to: string,
    icon: React.ReactNode,
    label: string
  ) => (
    <Link
      to={to}
      className={`dashboard-nav-item ${current === key ? "active" : ""}`}
      onClick={onClose}
    >
      <span className="nav-item-icon">{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className={`dashboard-sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="dashboard-brand">
        <Link
          to="/student/dashboard"
          className="dashboard-logo"
          onClick={onClose}
        >
          <span className="dashboard-logo-icon">E</span>
          <span className="dashboard-logo-text">Eduverse</span>
        </Link>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      {/* Student profile */}
      <Link
        to="/profile"
        onClick={onClose}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "16px 16px 20px",
          padding: "12px",
          borderRadius: 12,
          textDecoration: "none",
          color: "inherit",
          background: "rgba(127, 127, 127, 0.08)",
          minWidth: 0,
        }}
      >
        {avatarUrl && !avatarLoadFailed ? (
          <img
            key={avatarUrl}
            src={avatarUrl}
            alt={`${displayName}'s profile`}
            style={sidebarAvatarStyle}
            onError={() => setAvatarLoadFailed(true)}
          />
        ) : (
          <div
            className="dashboard-avatar"
            style={{
              ...sidebarAvatarStyle,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <strong
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 14,
            }}
          >
            {displayName}
          </strong>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Student</span>
        </div>
      </Link>

      <nav className="dashboard-navigation">
        <div className="navigation-section">
          <span className="navigation-title">MAIN MENU</span>
          {item("dashboard", "/student/dashboard", <LayoutDashboard size={20} />, "Dashboard")}
          {item("courses", "/student/courses", <BookOpen size={20} />, "My Courses")}
          {item("catalog", "/courses", <Search size={20} />, "Discover Courses")}
          {item("quizzes", "/quizzes", <FileQuestion size={20} />, "Quizzes")}
          {item("progress", "/progress", <TrendingUp size={20} />, "My Progress")}
        </div>

        <div className="navigation-section">
          <span className="navigation-title">LEARNING</span>
          {item("activities", "/activities", <Zap size={20} />, "Learning Activity")}
          {item("wishlist", "/wishlist", <Heart size={20} />, "Wishlist")}
          {item("achievements", "/achievements", <Trophy size={20} />, "Achievements")}
        </div>

        <div className="navigation-section">
          <span className="navigation-title">ACCOUNT</span>
          {item("profile", "/profile", <User size={20} />, "Profile")}
          {item("settings", "/settings", <Settings size={20} />, "Settings")}
          {item("help", "/help", <HelpCircle size={20} />, "Help Center")}

          {isMentor && (
            <Link
              to="/instructor/dashboard"
              className="dashboard-nav-item"
              onClick={onClose}
            >
              <span className="nav-item-icon">
                <GraduationCap size={20} />
              </span>
              <span>Instructor View</span>
            </Link>
          )}
        </div>
      </nav>

      <div className="dashboard-sidebar-bottom">
        <div className="dashboard-help-card">
          <div className="help-card-icon">?</div>
          <div>
            <strong>Need help?</strong>
            <p>We're here to help.</p>
            <Link to="/help" onClick={onClose}>
              Visit Help Center →
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <span><LogOut size={20} /></span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;