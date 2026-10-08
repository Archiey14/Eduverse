
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./InstructorAnalytics.css";

interface CoursePerformance {
  id: number;
  title: string;
  students: number;
  completion: number;
  rating: number;
  revenue: number;
}

interface QuizPerformance {
  id: number;
  title: string;
  course: string;
  attempts: number;
  averageScore: number;
}

interface Activity {
  id: number;
  student: string;
  action: string;
  course: string;
  time: string;
  icon: string;
}

const InstructorAnalytics = () => {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days");

  const coursePerformance: CoursePerformance[] = [
    {
      id: 1,
      title: "Complete React & TypeScript",
      students: 248,
      completion: 92,
      rating: 4.9,
      revenue: 12400,
    },
    {
      id: 2,
      title: "JavaScript Fundamentals",
      students: 186,
      completion: 78,
      rating: 4.8,
      revenue: 9300,
    },
    {
      id: 3,
      title: "Modern CSS Masterclass",
      students: 124,
      completion: 65,
      rating: 4.7,
      revenue: 6200,
    },
    {
      id: 4,
      title: "Node.js & Express",
      students: 0,
      completion: 0,
      rating: 0,
      revenue: 0,
    },
  ];

  const quizPerformance: QuizPerformance[] = [
    {
      id: 1,
      title: "React Fundamentals Quiz",
      course: "Complete React & TypeScript",
      attempts: 186,
      averageScore: 82,
    },
    {
      id: 2,
      title: "JavaScript Basics Assessment",
      course: "JavaScript Fundamentals",
      attempts: 142,
      averageScore: 78,
    },
    {
      id: 3,
      title: "CSS Layout Quiz",
      course: "Modern CSS Masterclass",
      attempts: 96,
      averageScore: 85,
    },
  ];

  const activities: Activity[] = [
    {
      id: 1,
      student: "Rahul Kumar",
      action: "completed a lesson",
      course: "Complete React & TypeScript",
      time: "10 minutes ago",
      icon: "✓",
    },
    {
      id: 2,
      student: "Ananya Sharma",
      action: "completed a quiz",
      course: "JavaScript Fundamentals",
      time: "32 minutes ago",
      icon: "✓",
    },
    {
      id: 3,
      student: "Vikram Singh",
      action: "enrolled in",
      course: "Modern CSS Masterclass",
      time: "1 hour ago",
      icon: "＋",
    },
    {
      id: 4,
      student: "Priya Reddy",
      action: "left a 5-star review",
      course: "Complete React & TypeScript",
      time: "2 hours ago",
      icon: "★",
    },
    {
      id: 5,
      student: "Arjun Patel",
      action: "completed a lesson",
      course: "JavaScript Fundamentals",
      time: "3 hours ago",
      icon: "✓",
    },
  ];

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalStudents = coursePerformance.reduce(
    (sum, course) => sum + course.students,
    0
  );

  const totalRevenue = coursePerformance.reduce(
    (sum, course) => sum + course.revenue,
    0
  );

  const averageCompletion =
    coursePerformance.filter((course) => course.students > 0).length > 0
      ? Math.round(
          coursePerformance
            .filter((course) => course.students > 0)
            .reduce((sum, course) => sum + course.completion, 0) /
            coursePerformance.filter((course) => course.students > 0).length
        )
      : 0;

  const averageRating =
    coursePerformance.filter((course) => course.rating > 0).length > 0
      ? (
          coursePerformance
            .filter((course) => course.rating > 0)
            .reduce((sum, course) => sum + course.rating, 0) /
          coursePerformance.filter((course) => course.rating > 0).length
        ).toFixed(1)
      : "0.0";

  const monthlyData = [
    { month: "May", students: 42, revenue: 2100 },
    { month: "Jun", students: 58, revenue: 2900 },
    { month: "Jul", students: 76, revenue: 3800 },
    { month: "Aug", students: 91, revenue: 4500 },
    { month: "Sep", students: 118, revenue: 5900 },
    { month: "Oct", students: 136, revenue: 6800 },
  ];

  const maxStudents = Math.max(
    ...monthlyData.map((item) => item.students)
  );

  return (
    <div className="instructor-analytics-page">
      {/* Sidebar */}
      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <div className="instructor-brand-icon">L</div>

          <div className="instructor-brand-text">
            <h2 className="instructor-brand-title">LearnHub</h2>
            <span className="instructor-brand-subtitle">
              Instructor Portal
            </span>
          </div>
        </div>

        <nav className="instructor-navigation">
          <div className="instructor-nav-section">
            <span className="instructor-nav-label">MAIN</span>

            <Link
              to="/instructor/dashboard"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">⌂</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/instructor/courses"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">▣</span>
              <span>My Courses</span>
            </Link>

            <Link
              to="/instructor/courses/create"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">＋</span>
              <span>Create Course</span>
            </Link>
          </div>

          <div className="instructor-nav-section">
            <span className="instructor-nav-label">MANAGE</span>

            <Link
              to="/instructor/lessons"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">▤</span>
              <span>Manage Lessons</span>
            </Link>

            <Link
              to="/instructor/students"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">♙</span>
              <span>Students</span>
            </Link>

            <Link
              to="/instructor/quizzes"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">?</span>
              <span>Quizzes</span>
            </Link>

            <Link
              to="/instructor/analytics"
              className="instructor-nav-link active"
            >
              <span className="instructor-nav-icon">◒</span>
              <span>Analytics</span>
            </Link>
          </div>

          <div className="instructor-nav-section">
            <span className="instructor-nav-label">ACCOUNT</span>

            <Link to="/profile" className="instructor-nav-link">
              <span className="instructor-nav-icon">♙</span>
              <span>Profile</span>
            </Link>

            <Link to="/settings" className="instructor-nav-link">
              <span className="instructor-nav-icon">⚙</span>
              <span>Settings</span>
            </Link>

            <Link to="/help" className="instructor-nav-link">
              <span className="instructor-nav-icon">?</span>
              <span>Help Center</span>
            </Link>
          </div>
        </nav>

        <div className="instructor-sidebar-bottom">
          <div className="instructor-support-card">
            <div className="instructor-support-icon">?</div>

            <div>
              <strong>Need help?</strong>
              <p>Visit our Help Center</p>
            </div>
          </div>

          <button
            className="instructor-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="instructor-main">
        {/* Topbar */}
        <header className="instructor-topbar">
          <div className="instructor-breadcrumb">
            <span>Instructor</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Analytics</strong>
          </div>

          <div className="instructor-topbar-right">
            <button className="instructor-notification">
              ♢
              <span className="notification-dot"></span>
            </button>

            <div className="instructor-profile-wrapper">
              <button
                className="instructor-profile-button"
                onClick={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
              >
                <div className="instructor-avatar">S</div>

                <div className="instructor-user-info">
                  <strong>Supriya Enjam</strong>
                  <span>Instructor</span>
                </div>

                <span className="profile-chevron">
                  {showProfileMenu ? "▲" : "▼"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="instructor-profile-menu">
                  <Link to="/profile">My Profile</Link>
                  <Link to="/settings">Settings</Link>

                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="instructor-content">
          <div className="analytics-page-header">
            <div>
              <span className="welcome-label">
                PERFORMANCE OVERVIEW
              </span>

              <h1>Analytics</h1>

              <p>
                Track your courses, students, quizzes and overall
                teaching performance.
              </p>
            </div>

            <div className="analytics-period">
              <label htmlFor="analytics-period">
                Time Period
              </label>

              <select
                id="analytics-period"
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(e.target.value)
                }
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <section className="analytics-stats">
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon students">
                ♙
              </div>

              <div>
                <span>Total Students</span>
                <strong>{totalStudents}</strong>
                <small>Across all courses</small>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon completion">
                ✓
              </div>

              <div>
                <span>Avg. Completion</span>
                <strong>{averageCompletion}%</strong>
                <small>Course completion rate</small>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon rating">
                ★
              </div>

              <div>
                <span>Average Rating</span>
                <strong>{averageRating}</strong>
                <small>From student reviews</small>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon revenue">
                ₹
              </div>

              <div>
                <span>Total Revenue</span>
                <strong>₹{totalRevenue.toLocaleString()}</strong>
                <small>Estimated course revenue</small>
              </div>
            </div>
          </section>

          {/* Charts */}
          <section className="analytics-grid">
            <div className="analytics-panel revenue-panel">
              <div className="analytics-panel-header">
                <div>
                  <span className="panel-label">
                    STUDENT GROWTH
                  </span>

                  <h2>Student Enrollment</h2>
                </div>

                <span className="analytics-period-label">
                  {selectedPeriod}
                </span>
              </div>

              <div className="bar-chart">
                {monthlyData.map((item) => (
                  <div
                    className="bar-chart-column"
                    key={item.month}
                  >
                    <div className="bar-value">
                      {item.students}
                    </div>

                    <div className="bar-wrapper">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${
                            (item.students / maxStudents) * 100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <span>{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-panel">
              <div className="analytics-panel-header">
                <div>
                  <span className="panel-label">
                    COURSE PERFORMANCE
                  </span>

                  <h2>Course Completion</h2>
                </div>
              </div>

              <div className="completion-list">
                {coursePerformance
                  .filter((course) => course.students > 0)
                  .map((course) => (
                    <div
                      className="completion-item"
                      key={course.id}
                    >
                      <div className="completion-item-header">
                        <span>{course.title}</span>
                        <strong>
                          {course.completion}%
                        </strong>
                      </div>

                      <div className="completion-progress">
                        <div
                          className="completion-progress-fill"
                          style={{
                            width: `${course.completion}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          {/* Course Performance */}
          <section className="analytics-panel full-width-panel">
            <div className="analytics-panel-header">
              <div>
                <span className="panel-label">
                  COURSE ANALYTICS
                </span>

                <h2>Course Performance</h2>
              </div>

              <Link
                to="/instructor/courses"
                className="view-all-link"
              >
                Manage Courses →
              </Link>
            </div>

            <div className="course-performance-table-wrapper">
              <table className="course-performance-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Students</th>
                    <th>Completion</th>
                    <th>Rating</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {coursePerformance.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div className="course-name-cell">
                          <div className="course-table-icon">
                            ▣
                          </div>

                          <div>
                            <strong>{course.title}</strong>
                            <span>
                              {course.students > 0
                                ? "Published course"
                                : "Draft course"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{course.students}</td>

                      <td>
                        <div className="table-progress">
                          <span>{course.completion}%</span>

                          <div className="table-progress-bar">
                            <div
                              style={{
                                width: `${course.completion}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td>
                        {course.rating > 0 ? (
                          <span className="rating-value">
                            ★ {course.rating}
                          </span>
                        ) : (
                          <span className="no-rating">
                            No ratings
                          </span>
                        )}
                      </td>

                      <td>
                        <strong>
                          ₹{course.revenue.toLocaleString()}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quiz + Activity */}
          <section className="analytics-grid">
            <div className="analytics-panel">
              <div className="analytics-panel-header">
                <div>
                  <span className="panel-label">
                    QUIZ ANALYTICS
                  </span>

                  <h2>Quiz Performance</h2>
                </div>

                <Link
                  to="/instructor/quizzes"
                  className="view-all-link"
                >
                  View Quizzes →
                </Link>
              </div>

              <div className="quiz-performance-list">
                {quizPerformance.map((quiz) => (
                  <div
                    className="quiz-performance-item"
                    key={quiz.id}
                  >
                    <div className="quiz-performance-info">
                      <div className="quiz-icon">?</div>

                      <div>
                        <strong>{quiz.title}</strong>
                        <span>{quiz.course}</span>
                      </div>
                    </div>

                    <div className="quiz-performance-score">
                      <strong>{quiz.averageScore}%</strong>
                      <span>
                        {quiz.attempts} attempts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-panel">
              <div className="analytics-panel-header">
                <div>
                  <span className="panel-label">
                    RECENT ACTIVITY
                  </span>

                  <h2>Student Activity</h2>
                </div>

                <Link
                  to="/instructor/students"
                  className="view-all-link"
                >
                  View Students →
                </Link>
              </div>

              <div className="analytics-activity-list">
                {activities.map((activity) => (
                  <div
                    className="analytics-activity-item"
                    key={activity.id}
                  >
                    <div className="activity-icon">
                      {activity.icon}
                    </div>

                    <div className="activity-content">
                      <p>
                        <strong>{activity.student}</strong>{" "}
                        {activity.action}{" "}
                        <strong>{activity.course}</strong>
                      </p>

                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Insights */}
          <section className="analytics-insights">
            <div className="insights-icon">✦</div>

            <div className="insights-content">
              <span className="panel-label">
                PERFORMANCE INSIGHT
              </span>

              <h3>Your students are making great progress!</h3>

              <p>
                Your React & TypeScript course has the highest
                completion rate at 92%. Consider creating more
                advanced content for students who have completed
                the course.
              </p>
            </div>

            <Link
              to="/instructor/courses/create"
              className="insights-button"
            >
              Create Course
            </Link>
          </section>
        </div>

        {/* Footer */}
        <footer className="instructor-footer">
          <p>© 2026 LearnHub. All rights reserved.</p>

          <div className="instructor-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/">Visit Student Portal</Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default InstructorAnalytics;
