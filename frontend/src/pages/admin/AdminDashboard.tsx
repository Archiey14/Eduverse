import { useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

const AdminDashboard = () => {
  const [stats] = useState<StatCard[]>([
    {
      title: "Total Users",
      value: "1,248",
      change: "+12.5%",
      icon: "👥",
      color: "blue",
    },
    {
      title: "Total Courses",
      value: "86",
      change: "+8.2%",
      icon: "📚",
      color: "purple",
    },
    {
      title: "Active Mentors",
      value: "42",
      change: "+5.4%",
      icon: "👨‍🏫",
      color: "green",
    },
    {
      title: "Enrollments",
      value: "3,842",
      change: "+15.8%",
      icon: "🎓",
      color: "orange",
    },
  ]);

  const recentUsers = [
    {
      name: "Rahul Kumar",
      email: "rahul@example.com",
      role: "Student",
      status: "Active",
    },
    {
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "Mentor",
      status: "Active",
    },
    {
      name: "Arjun Reddy",
      email: "arjun@example.com",
      role: "Student",
      status: "Active",
    },
    {
      name: "Sneha Patel",
      email: "sneha@example.com",
      role: "Student",
      status: "Pending",
    },
  ];

  const recentCourses = [
    {
      title: "React & TypeScript Masterclass",
      instructor: "Priya Sharma",
      students: 245,
      status: "Published",
    },
    {
      title: "Python for Beginners",
      instructor: "Arjun Kumar",
      students: 189,
      status: "Published",
    },
    {
      title: "Node.js Backend Development",
      instructor: "Rahul Verma",
      students: 156,
      status: "Pending",
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">E</div>
          <div>
            <h2>Eduverse</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="admin-nav-item active">
            <span>📊</span>
            Dashboard
          </Link>

          <Link to="/admin/users" className="admin-nav-item">
            <span>👥</span>
            Users
          </Link>

          <Link to="/admin/courses" className="admin-nav-item">
            <span>📚</span>
            Courses
          </Link>

          <Link to="/admin/mentors" className="admin-nav-item">
            <span>👨‍🏫</span>
            Mentors
          </Link>

          <Link to="/admin/enrollments" className="admin-nav-item">
            <span>🎓</span>
            Enrollments
          </Link>

          <Link to="/admin/analytics" className="admin-nav-item">
            <span>📈</span>
            Analytics
          </Link>

          <Link to="/admin/settings" className="admin-nav-item">
            <span>⚙️</span>
            Settings
          </Link>
        </nav>

        <div className="admin-sidebar-bottom">
          <Link to="/student/dashboard" className="back-to-app">
            <span>←</span>
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h1>Dashboard</h1>
            <p className="admin-subtitle">
              Welcome back! Here's what's happening on Eduverse.
            </p>
          </div>

          <div className="admin-header-actions">
            <button className="notification-button">
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="admin-profile">
              <div className="admin-avatar">A</div>
              <div>
                <strong>Admin</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Statistics */}
        <section className="admin-stats">
          {stats.map((stat) => (
            <div className="admin-stat-card" key={stat.title}>
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>

              <div className="stat-info">
                <span>{stat.title}</span>
                <h2>{stat.value}</h2>

                <p>
                  <strong>↗ {stat.change}</strong>
                  <span> from last month</span>
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Main Grid */}
        <section className="admin-content-grid">
          {/* Recent Users */}
          <div className="admin-panel">
            <div className="panel-header">
              <div>
                <h2>Recent Users</h2>
                <p>Latest users registered on the platform</p>
              </div>

              <Link to="/admin/users" className="view-all">
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
                  {recentUsers.map((user) => (
                    <tr key={user.email}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.name.charAt(0)}
                          </div>

                          <div>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${user.status.toLowerCase()}`}
                        >
                          <span className="status-dot"></span>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-panel quick-actions-panel">
            <div className="panel-header">
              <div>
                <h2>Quick Actions</h2>
                <p>Manage your platform</p>
              </div>
            </div>

            <div className="quick-actions">
              <Link to="/admin/users" className="quick-action">
                <div className="quick-action-icon blue">👥</div>
                <div>
                  <strong>Manage Users</strong>
                  <span>View and manage users</span>
                </div>
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/admin/courses" className="quick-action">
                <div className="quick-action-icon purple">📚</div>
                <div>
                  <strong>Manage Courses</strong>
                  <span>Review platform courses</span>
                </div>
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/admin/mentors" className="quick-action">
                <div className="quick-action-icon green">👨‍🏫</div>
                <div>
                  <strong>Manage Mentors</strong>
                  <span>Review mentor accounts</span>
                </div>
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/admin/analytics" className="quick-action">
                <div className="quick-action-icon orange">📈</div>
                <div>
                  <strong>View Analytics</strong>
                  <span>Platform performance</span>
                </div>
                <span className="action-arrow">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="admin-panel courses-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Courses</h2>
              <p>Recently created or updated courses</p>
            </div>

            <Link to="/admin/courses" className="view-all">
              View All →
            </Link>
          </div>

          <div className="course-list">
            {recentCourses.map((course) => (
              <div className="course-row" key={course.title}>
                <div className="course-icon">📖</div>

                <div className="course-info">
                  <strong>{course.title}</strong>
                  <span>by {course.instructor}</span>
                </div>

                <div className="course-students">
                  <strong>{course.students}</strong>
                  <span>students</span>
                </div>

                <span
                  className={`course-status ${course.status.toLowerCase()}`}
                >
                  {course.status}
                </span>

                <button className="course-more">•••</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;