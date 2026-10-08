import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../services/api";
import "./AdminDashboard.css";

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

interface AdminStats {
  totalUsers: number;
  totalMentors: number;
  totalCourses: number;
  totalEnrollments: number;
  recentSignups7d: number;
  topCourses: AdminCourse[];
}

interface AdminUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  roles?: string[];
  isActive?: boolean;
  createdAt?: string;
}

interface AdminCourse {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  status?: string;

  mentor?: {
    _id?: string;
    name?: string;
    email?: string;
  };

  category?: {
    _id?: string;
    name?: string;
  };

  stats?: {
    enrollmentCount?: number;
  };
}

const AdminDashboard = () => {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [recentCourses, setRecentCourses] = useState<AdminCourse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD DASHBOARD DATA
  ========================================================= */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, usersResponse] = await Promise.all([
        api.admin.getStats(),

        api.admin.getUsers({
          page: 1,
          limit: 4,
        }),
      ]);

      /* =====================================================
         ADMIN STATS
      ===================================================== */

      const statsData = statsResponse?.data || statsResponse;

      setAdminStats({
        totalUsers: Number(statsData?.totalUsers || 0),

        totalMentors: Number(statsData?.totalMentors || 0),

        totalCourses: Number(statsData?.totalCourses || 0),

        totalEnrollments: Number(
          statsData?.totalEnrollments || 0
        ),

        recentSignups7d: Number(
          statsData?.recentSignups7d || 0
        ),

        topCourses: Array.isArray(statsData?.topCourses)
          ? statsData.topCourses
          : [],
      });

      /* =====================================================
         RECENT USERS
      ===================================================== */

      const usersData = usersResponse?.data || usersResponse;

      const users =
        usersData?.items ||
        usersData?.users ||
        usersData?.docs ||
        (Array.isArray(usersData) ? usersData : []);

      setRecentUsers(
        Array.isArray(users) ? users : []
      );

      /* =====================================================
         TOP COURSES
      ===================================================== */

      setRecentCourses(
        Array.isArray(statsData?.topCourses)
          ? statsData.topCourses.slice(0, 5)
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load admin dashboard:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load admin dashboard data."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================================================
     STAT CARDS
  ========================================================= */

  const stats: StatCard[] = [
    {
      title: "Total Users",

      value: loading
        ? "..."
        : String(adminStats?.totalUsers ?? 0),

      change: loading
        ? "Loading..."
        : `+${adminStats?.recentSignups7d ?? 0} this week`,

      icon: "👥",

      color: "blue",
    },

    {
      title: "Total Courses",

      value: loading
        ? "..."
        : String(adminStats?.totalCourses ?? 0),

      change: "Platform total",

      icon: "📚",

      color: "purple",
    },

    {
      title: "Active Mentors",

      value: loading
        ? "..."
        : String(adminStats?.totalMentors ?? 0),

      change: "Platform total",

      icon: "👨‍🏫",

      color: "green",
    },

    {
      title: "Enrollments",

      value: loading
        ? "..."
        : String(adminStats?.totalEnrollments ?? 0),

      change: "Platform total",

      icon: "🎓",

      color: "orange",
    },
  ];

  /* =========================================================
     USER ROLE
  ========================================================= */

  const getUserRole = (user: AdminUser) => {
    if (user.roles?.includes("admin")) {
      return "Admin";
    }

    if (user.roles?.includes("mentor")) {
      return "Mentor";
    }

    return "Student";
  };

  /* =========================================================
     USER STATUS
  ========================================================= */

  const getUserStatus = (user: AdminUser) => {
    return user.isActive === false
      ? "Inactive"
      : "Active";
  };

  /* =========================================================
     COURSE STATUS
  ========================================================= */

  const getCourseStatus = (course: AdminCourse) => {
    const status = course.status || "draft";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  /* =========================================================
     COURSE STUDENTS
  ========================================================= */

  const getCourseStudents = (course: AdminCourse) => {
    return course.stats?.enrollmentCount ?? 0;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">
            ADMINISTRATION
          </p>

          <h1>Dashboard</h1>

          <p className="admin-subtitle">
            Welcome back! Here's what's happening on
            Eduverse.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            className="notification-button"
            type="button"
            title="Notifications"
          >
            🔔

            <span className="notification-dot"></span>
          </button>

          <div className="admin-profile">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>

              <span>Administrator</span>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div className="admin-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadDashboard}
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="admin-stats">
        {stats.map((stat) => (
          <div
            className="admin-stat-card"
            key={stat.title}
          >
            <div
              className={`stat-icon ${stat.color}`}
            >
              {stat.icon}
            </div>

            <div className="stat-info">
              <span>
                {stat.title}
              </span>

              <h2>
                {stat.value}
              </h2>

              <p>
                <strong>
                  {loading
                    ? "..."
                    : `↗ ${stat.change}`}
                </strong>

                {!loading &&
                  stat.title === "Total Users" && (
                    <span>
                      {" "}
                      recent signups
                    </span>
                  )}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <section className="admin-content-grid">

        {/* ===================================================
            RECENT USERS
        =================================================== */}

        <div className="admin-panel">
          <div className="panel-header">
            <div>
              <h2>
                Recent Users
              </h2>

              <p>
                Latest users registered on the platform
              </p>
            </div>

            <Link
              to="/admin/users"
              className="view-all"
            >
              View All →
            </Link>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>

                  <th>Role</th>

                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : recentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user) => {
                    const role =
                      getUserRole(user);

                    const status =
                      getUserStatus(user);

                    return (
                      <tr
                        key={
                          user._id ||
                          user.id ||
                          user.email
                        }
                      >
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {user.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {user.name}
                              </strong>

                              <span>
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`role-badge ${role.toLowerCase()}`}
                          >
                            {role}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${status.toLowerCase()}`}
                          >
                            <span className="status-dot"></span>

                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <div className="admin-panel quick-actions-panel">
          <div className="panel-header">
            <div>
              <h2>
                Quick Actions
              </h2>

              <p>
                Manage your platform
              </p>
            </div>
          </div>

          <div className="quick-actions">

            {/* Manage Users */}

            <Link
              to="/admin/users"
              className="quick-action"
            >
              <div className="quick-action-icon blue">
                👥
              </div>

              <div>
                <strong>
                  Manage Users
                </strong>

                <span>
                  View and manage users
                </span>
              </div>

              <span className="action-arrow">
                →
              </span>
            </Link>

            {/* Manage Courses */}

            <Link
              to="/admin/courses"
              className="quick-action"
            >
              <div className="quick-action-icon purple">
                📚
              </div>

              <div>
                <strong>
                  Manage Courses
                </strong>

                <span>
                  Review platform courses
                </span>
              </div>

              <span className="action-arrow">
                →
              </span>
            </Link>

            {/* Manage Mentors */}

            <Link
              to="/admin/mentors"
              className="quick-action"
            >
              <div className="quick-action-icon green">
                👨‍🏫
              </div>

              <div>
                <strong>
                  Manage Mentors
                </strong>

                <span>
                  Review mentor accounts
                </span>
              </div>

              <span className="action-arrow">
                →
              </span>
            </Link>

            {/* Analytics */}

            <Link
              to="/admin/analytics"
              className="quick-action"
            >
              <div className="quick-action-icon orange">
                📈
              </div>

              <div>
                <strong>
                  View Analytics
                </strong>

                <span>
                  Platform performance
                </span>
              </div>

              <span className="action-arrow">
                →
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* =====================================================
          TOP COURSES
      ===================================================== */}

      <section className="admin-panel courses-panel">
        <div className="panel-header">
          <div>
            <h2>
              Top Courses
            </h2>

            <p>
              Most enrolled published courses
            </p>
          </div>

          <Link
            to="/admin/courses"
            className="view-all"
          >
            View All →
          </Link>
        </div>

        <div className="course-list">
          {loading ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              Loading courses...
            </div>
          ) : recentCourses.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              No courses found.
            </div>
          ) : (
            recentCourses.map((course) => (
              <div
                className="course-row"
                key={
                  course._id ||
                  course.id ||
                  course.title
                }
              >
                <div className="course-icon">
                  📖
                </div>

                <div className="course-info">
                  <strong>
                    {course.title}
                  </strong>

                  <span>
                    by{" "}
                    {course.mentor?.name ||
                      "Unknown mentor"}
                  </span>
                </div>

                <div className="course-students">
                  <strong>
                    {getCourseStudents(course)}
                  </strong>

                  <span>
                    students
                  </span>
                </div>

                <span
                  className={`course-status ${
                    course.status || "draft"
                  }`}
                >
                  {getCourseStatus(course)}
                </span>

                <button
                  className="course-more"
                  type="button"
                  title="Course options"
                >
                  •••
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;