import { Link, Outlet, useLocation } from "react-router-dom";
import "./AdminDashboard.css";

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-dashboard">

      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside className="admin-sidebar">

        {/* =========================================
            ADMIN LOGO
        ========================================= */}
        <div className="admin-logo">

          <div className="admin-logo-icon">
            E
          </div>

          <div>
            <h2>Eduverse</h2>
            <span>Admin Panel</span>
          </div>

        </div>

        {/* =========================================
            NAVIGATION
        ========================================= */}
        <nav className="admin-nav">

          {/* Dashboard */}
          <Link
            to="/admin/dashboard"
            className={`admin-nav-item ${
              isActive("/admin/dashboard") ? "active" : ""
            }`}
          >
            <span>📊</span>
            Dashboard
          </Link>

          {/* Users */}
          <Link
            to="/admin/users"
            className={`admin-nav-item ${
              isActive("/admin/users") ? "active" : ""
            }`}
          >
            <span>👥</span>
            Users
          </Link>

          {/* Courses */}
          <Link
            to="/admin/courses"
            className={`admin-nav-item ${
              isActive("/admin/courses") ? "active" : ""
            }`}
          >
            <span>📚</span>
            Courses
          </Link>

          {/* Mentors */}
          <Link
            to="/admin/mentors"
            className={`admin-nav-item ${
              isActive("/admin/mentors") ? "active" : ""
            }`}
          >
            <span>👨‍🏫</span>
            Mentors
          </Link>

          {/* Enrollments */}
          <Link
            to="/admin/enrollments"
            className={`admin-nav-item ${
              isActive("/admin/enrollments") ? "active" : ""
            }`}
          >
            <span>🎓</span>
            Enrollments
          </Link>

          {/* Analytics */}
          <Link
            to="/admin/analytics"
            className={`admin-nav-item ${
              isActive("/admin/analytics") ? "active" : ""
            }`}
          >
            <span>📈</span>
            Analytics
          </Link>

          {/* Profile */}
          <Link
            to="/admin/profile"
            className={`admin-nav-item ${
              isActive("/admin/profile") ? "active" : ""
            }`}
          >
            <span>👤</span>
            Profile
          </Link>

          {/* Settings */}
          <Link
            to="/admin/settings"
            className={`admin-nav-item ${
              isActive("/admin/settings") ? "active" : ""
            }`}
          >
            <span>⚙️</span>
            Settings
          </Link>

        </nav>

        {/* =========================================
            BACK TO APP
        ========================================= */}
        <div className="admin-sidebar-bottom">

          <Link
            to="/student/dashboard"
            className="back-to-app"
          >
            <span>←</span>
            Back to App
          </Link>

        </div>

      </aside>

      {/* =========================================
          ADMIN PAGE CONTENT
      ========================================= */}
      <main className="admin-main">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;