import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, GraduationCap, BarChart, User, Settings, ArrowLeft } from "lucide-react";
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
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          {/* Users */}
          <Link
            to="/admin/users"
            className={`admin-nav-item ${
              isActive("/admin/users") ? "active" : ""
            }`}
          >
            <Users size={20} />
            Users
          </Link>

          {/* Courses */}
          <Link
            to="/admin/courses"
            className={`admin-nav-item ${
              isActive("/admin/courses") ? "active" : ""
            }`}
          >
            <BookOpen size={20} />
            Courses
          </Link>

          {/* Mentors */}
          <Link
            to="/admin/mentors"
            className={`admin-nav-item ${
              isActive("/admin/mentors") ? "active" : ""
            }`}
          >
            <GraduationCap size={20} />
            Mentors
          </Link>

          {/* Enrollments */}
          <Link
            to="/admin/enrollments"
            className={`admin-nav-item ${
              isActive("/admin/enrollments") ? "active" : ""
            }`}
          >
            <Users size={20} />
            Enrollments
          </Link>

          {/* Analytics */}
          <Link
            to="/admin/analytics"
            className={`admin-nav-item ${
              isActive("/admin/analytics") ? "active" : ""
            }`}
          >
            <BarChart size={20} />
            Analytics
          </Link>

          {/* Profile */}
          <Link
            to="/admin/profile"
            className={`admin-nav-item ${
              isActive("/admin/profile") ? "active" : ""
            }`}
          >
            <User size={20} />
            Profile
          </Link>

          {/* Settings */}
          <Link
            to="/admin/settings"
            className={`admin-nav-item ${
              isActive("/admin/settings") ? "active" : ""
            }`}
          >
            <Settings size={20} />
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
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
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