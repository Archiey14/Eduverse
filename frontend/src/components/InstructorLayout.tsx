import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, BookOpen, PlusCircle, Video, Users, ClipboardList, 
  BarChart, User, Settings, HelpCircle, GraduationCap, LogOut, Menu, X, Bell,
  ChevronDown, ChevronUp
} from "lucide-react";
import "../pages/StudentDashboard.css";
import "./InstructorLayout.css";

export type InstructorNavKey =
  | "dashboard"
  | "courses"
  | "create"
  | "lessons"
  | "students"
  | "quizzes"
  | "analytics"
  | "notifications"
  | "profile"
  | "settings";

interface InstructorLayoutProps {
  children: ReactNode;
  active?: InstructorNavKey;
  /** Page title (kept for page-level semantics / document title). */
  title?: string;
}

interface NavItem {
  key: InstructorNavKey;
  to: string;
  icon: ReactNode;
  label: string;
}

const MAIN_NAV: NavItem[] = [
  { key: "dashboard", to: "/instructor/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { key: "courses", to: "/instructor/courses", icon: <BookOpen size={20} />, label: "My Courses" },
  { key: "create", to: "/instructor/courses/create", icon: <PlusCircle size={20} />, label: "Create Course" },
];

const MANAGE_NAV: NavItem[] = [
  { key: "lessons", to: "/instructor/lessons", icon: <Video size={20} />, label: "Manage Lessons" },
  { key: "students", to: "/instructor/students", icon: <Users size={20} />, label: "Students" },
  { key: "quizzes", to: "/instructor/quizzes", icon: <ClipboardList size={20} />, label: "Quizzes" },
  { key: "analytics", to: "/instructor/analytics", icon: <BarChart size={20} />, label: "Analytics" },
];

const ACCOUNT_NAV: NavItem[] = [
  { key: "profile", to: "/instructor/profile", icon: <User size={20} />, label: "Profile" },
  { key: "settings", to: "/instructor/settings", icon: <Settings size={20} />, label: "Settings" },
];

export default function InstructorLayout({ children, active, title }: InstructorLayoutProps) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const name = user?.name || "Instructor";
  const initial = name.charAt(0).toUpperCase();

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const renderItem = (item: NavItem) => (
    <Link
      key={item.key}
      to={item.to}
      className={`dashboard-nav-item ${active === item.key ? "active" : ""}`}
      onClick={closeSidebar}
    >
      <span className="nav-item-icon">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );

  return (
    <div className="student-dashboard instructor-shell" data-page={title}>
      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          style={{ display: "block" }}
          onClick={closeSidebar}
        ></div>
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="dashboard-brand">
          <Link to="/instructor/dashboard" className="dashboard-logo" onClick={closeSidebar}>
            <span className="dashboard-logo-icon">E</span>
            <span className="dashboard-logo-text">Eduverse</span>
          </Link>
          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="dashboard-navigation">
          <div className="navigation-section">
            <span className="navigation-title">INSTRUCTOR STUDIO</span>
            {MAIN_NAV.map(renderItem)}
          </div>

          <div className="navigation-section">
            <span className="navigation-title">MANAGE</span>
            {MANAGE_NAV.map(renderItem)}
          </div>

          <div className="navigation-section">
            <span className="navigation-title">ACCOUNT</span>
            {ACCOUNT_NAV.map(renderItem)}
            <Link to="/help" className="dashboard-nav-item" onClick={closeSidebar}>
              <span className="nav-item-icon"><HelpCircle size={20} /></span>
              <span>Help Center</span>
            </Link>
          </div>

          <div className="navigation-section">
            <span className="navigation-title">SWITCH VIEW</span>
            <Link to="/student/dashboard" className="dashboard-nav-item" onClick={closeSidebar}>
              <span className="nav-item-icon"><GraduationCap size={20} /></span>
              <span>Student View</span>
            </Link>
          </div>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button type="button" className="dashboard-logout" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <Link to="/instructor/dashboard" className="mobile-dashboard-logo">
            <span className="dashboard-logo-icon">E</span>
            Eduverse
          </Link>

          <div style={{ flex: 1 }}></div>

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
              to="/instructor/notifications"
              className="dashboard-icon-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
            </Link>

            <div className="topbar-divider"></div>

            <div
              className="dashboard-user-menu il-user-menu"
              onClick={() => setMenuOpen((open) => !open)}
              tabIndex={0}
              role="button"
            >
              <div className="dashboard-avatar">{initial}</div>
              <div className="dashboard-user-info">
                <strong>{name}</strong>
                <span>Instructor</span>
              </div>
              <span className="user-menu-arrow">{menuOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>

              {menuOpen && (
                <div className="il-dropdown" onClick={(e) => e.stopPropagation()}>
                  <Link to="/instructor/profile" onClick={() => setMenuOpen(false)}>
                    <User size={16} style={{ marginRight: '8px' }} /> My Profile
                  </Link>
                  <Link to="/instructor/settings" onClick={() => setMenuOpen(false)}>
                    <Settings size={16} style={{ marginRight: '8px' }} /> Settings
                  </Link>
                  <Link to="/student/dashboard" onClick={() => setMenuOpen(false)}>
                    <GraduationCap size={16} style={{ marginRight: '8px' }} /> Student View
                  </Link>
                  <hr />
                  <button type="button" className="il-dropdown-danger" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <LogOut size={16} style={{ marginRight: '8px' }} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
