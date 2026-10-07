import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface StudentSidebarProps {
  activeItem?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  activeItem,
  isOpen,
  onClose,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const current =
    activeItem ||
    (location.pathname === "/student/dashboard"
      ? "dashboard"
      : location.pathname.startsWith("/courses")
      ? "courses"
      : location.pathname.startsWith("/discover")
      ? "discover"
      : location.pathname.startsWith("/quizzes")
      ? "quizzes"
      : location.pathname.startsWith("/progress")
      ? "progress"
      : location.pathname.startsWith("/activities")
      ? "activities"
      : "");

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <aside className={`dashboard-sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="dashboard-brand">
        <Link
          to="/student/dashboard"
          className="dashboard-logo"
          onClick={onClose}
        >
          <span className="dashboard-logo-icon">L</span>
          <span className="dashboard-logo-text">LearnHub</span>
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

      <nav className="dashboard-navigation">
        <div className="navigation-section">
          <span className="navigation-title">MAIN MENU</span>

          <Link
            to="/student/dashboard"
            className={`dashboard-nav-item ${
              current === "dashboard" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <span className="nav-item-icon">▦</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/student/courses"
            className={`dashboard-nav-item ${
              current === "courses" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <span className="nav-item-icon">📚</span>
            <span>My Courses</span>
          </Link>

          <Link
            to="/courses"
            className={`dashboard-nav-item ${
              current === "catalog" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <span className="nav-item-icon">🔍</span>
            <span>Discover Courses</span>
          </Link>

          <Link
            to="/quizzes"
            className={`dashboard-nav-item ${
              current === "quizzes" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <span className="nav-item-icon">📝</span>
            <span>Quizzes</span>
          </Link>

          <Link
            to="/progress"
            className={`dashboard-nav-item ${
              current === "progress" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <span className="nav-item-icon">📈</span>
            <span>My Progress</span>
          </Link>
        </div>

        <div className="navigation-section">
          <span className="navigation-title">LEARNING</span>

          <Link
            to="/activities"
            className={`dashboard-nav-item ${
              current === "activities" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <span className="nav-item-icon">⚡</span>
            <span>Learning Activity</span>
          </Link>

          <Link
            to="/progress"
            className={`dashboard-nav-item ${
              current === "achievements" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <span className="nav-item-icon">🏆</span>
            <span>Achievements</span>
          </Link>
        </div>
      </nav>

      <div className="dashboard-sidebar-bottom">
        <div className="dashboard-help-card">
          <div className="help-card-icon">?</div>
          <div>
            <strong>Need help?</strong>
            <p>We're here to help.</p>
            <Link to="/courses" onClick={onClose}>
              Visit Course Center →
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
