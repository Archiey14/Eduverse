
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./InstructorDashboard.css";

interface Course {
  id: string | number;
  title: string;
  category: string;
  students: number;
  lessons: number;
  rating: number;
  status: "Published" | "Draft";
  progress: number;
}

interface Activity {
  id: string | number;
  type: "enrollment" | "completion" | "review" | "quiz";
  student: string;
  message: string;
  time: string;
  course: string;
}

const initialCourses: Course[] = [
  {
    id: 1,
    title: "Complete React & TypeScript",
    category: "Web Development",
    students: 248,
    lessons: 32,
    rating: 4.9,
    status: "Published",
    progress: 92,
  },
  {
    id: 2,
    title: "JavaScript Fundamentals",
    category: "Programming",
    students: 186,
    lessons: 28,
    rating: 4.8,
    status: "Published",
    progress: 78,
  },
  {
    id: 3,
    title: "Modern CSS Masterclass",
    category: "Web Design",
    students: 124,
    lessons: 24,
    rating: 4.7,
    status: "Published",
    progress: 65,
  },
  {
    id: 4,
    title: "Node.js & Express",
    category: "Backend Development",
    students: 0,
    lessons: 18,
    rating: 0,
    status: "Draft",
    progress: 35,
  },
];

const initialActivities: Activity[] = [
  {
    id: 1,
    type: "enrollment",
    student: "Rahul Kumar",
    message: "enrolled in your course",
    time: "10 minutes ago",
    course: "Complete React & TypeScript",
  },
  {
    id: 2,
    type: "review",
    student: "Ananya Sharma",
    message: "gave a 5-star review",
    time: "1 hour ago",
    course: "JavaScript Fundamentals",
  },
  {
    id: 3,
    type: "completion",
    student: "Vikram Singh",
    message: "completed the course",
    time: "3 hours ago",
    course: "Modern CSS Masterclass",
  },
  {
    id: 4,
    type: "quiz",
    student: "Priya Reddy",
    message: "completed a quiz",
    time: "5 hours ago",
    course: "Complete React & TypeScript",
  },
];

function InstructorDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    api.mentor.getDashboard()
      .then((res) => {
        if (res.data) {
          setDbStats(res.data.stats);
          if (res.data.courses && res.data.courses.length > 0) {
            setCourses(
              res.data.courses.map((c: any) => ({
                id: c._id,
                title: c.title,
                category: c.category?.name || "Web Development",
                students: c.stats?.enrollmentCount || 0,
                lessons: c.stats?.lessonCount || 0,
                rating: c.stats?.ratingAvg || 0,
                status: c.status === "published" ? "Published" : "Draft",
                progress: 100,
              }))
            );
          }
          if (res.data.recentEnrollments && res.data.recentEnrollments.length > 0) {
            setActivities(
              res.data.recentEnrollments.map((e: any, idx: number) => ({
                id: e._id || idx,
                type: "enrollment",
                student: e.student?.name || "Learner",
                message: "enrolled in your course",
                time: e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "Recently",
                course: e.course?.title || "Course",
              }))
            );
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch mentor dashboard data:", err);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "enrollment":
        return "👤";
      case "completion":
        return "🎓";
      case "review":
        return "⭐";
      case "quiz":
        return "📝";
      default:
        return "🔔";
    }
  };

  const publishedCourses = dbStats
    ? dbStats.publishedCourses
    : courses.filter((course) => course.status === "Published").length;

  const totalStudents = dbStats
    ? dbStats.totalEnrollments
    : courses.reduce((total, course) => total + course.students, 0);

  const totalLessons = courses.reduce(
    (total, course) => total + course.lessons,
    0
  );

  const ratedCourses = courses.filter((course) => course.rating > 0);

  const averageRating = dbStats?.overallRating
    ? dbStats.overallRating.toFixed(1)
    : ratedCourses.length > 0
    ? (
        ratedCourses.reduce(
          (total, course) => total + course.rating,
          0
        ) / ratedCourses.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="instructor-dashboard">
      {/* ==================== SIDEBAR ==================== */}
      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <div className="instructor-brand-icon">L</div>

          <div className="instructor-brand-text">
            <span className="instructor-brand-title">LearnHub</span>
            <span className="instructor-brand-subtitle">
              Instructor
            </span>
          </div>
        </div>

        <nav className="instructor-navigation">
          {/* MAIN */}
          <div className="instructor-nav-section">
            <span className="instructor-nav-label">MAIN</span>

            <Link
              to="/instructor/dashboard"
              className="instructor-nav-link active"
            >
              <span className="instructor-nav-icon">▦</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/instructor/courses"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">📚</span>
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

          {/* MANAGE */}
          <div className="instructor-nav-section">
            <span className="instructor-nav-label">MANAGE</span>

            {/* Manage Lessons */}
            <Link
              to="/instructor/lessons"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">📖</span>
              <span>Manage Lessons</span>
            </Link>

            <Link
              to="/instructor/students"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">👥</span>
              <span>Students</span>
            </Link>

            <Link
              to="/instructor/quizzes"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">📝</span>
              <span>Quizzes</span>
            </Link>

            <Link
              to="/instructor/analytics"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">📊</span>
              <span>Analytics</span>
            </Link>
          </div>

          {/* ACCOUNT */}
          <div className="instructor-nav-section">
            <span className="instructor-nav-label">ACCOUNT</span>

            <Link
              to="/profile"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">👤</span>
              <span>Profile</span>
            </Link>

            <Link
              to="/settings"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">⚙</span>
              <span>Settings</span>
            </Link>

            <Link
              to="/help"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">?</span>
              <span>Help Center</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Bottom */}
        <div className="instructor-sidebar-bottom">
          <div className="instructor-support-card">
            <div className="instructor-support-icon">💡</div>

            <div>
              <strong>Need help?</strong>
              <span>Visit our Help Center</span>
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

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="instructor-main">
        {/* TOPBAR */}
        <header className="instructor-topbar">
          <div className="instructor-breadcrumb">
            <span>Instructor</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Dashboard</strong>
          </div>

          <div className="instructor-topbar-right">
            <button
              className="instructor-notification"
              aria-label="Notifications"
              onClick={() => navigate("/notifications")}
            >
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="instructor-profile-wrapper">
              <button
                className="instructor-profile-button"
                onClick={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
              >
                <div className="instructor-avatar">
                  {(user?.name || "I").charAt(0).toUpperCase()}
                </div>

                <div className="instructor-user-info">
                  <strong>{user?.name || "Instructor"}</strong>
                  <span>Instructor</span>
                </div>

                <span className="profile-chevron">⌄</span>
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

        {/* PAGE CONTENT */}
        <div className="instructor-content">
          {/* WELCOME */}
          <section className="instructor-welcome">
            <div>
              <span className="welcome-label">
                INSTRUCTOR DASHBOARD
              </span>

              <h1>Welcome back, Supriya! 👋</h1>

              <p>
                Manage your courses, track your students, and
                continue creating great learning experiences.
              </p>
            </div>

            <Link
              to="/instructor/courses/create"
              className="create-course-button"
            >
              <span>＋</span>
              Create New Course
            </Link>
          </section>

          {/* STATISTICS */}
          <section className="instructor-stats">
            <div className="instructor-stat-card">
              <div className="stat-icon courses-stat-icon">
                📚
              </div>

              <div className="stat-content">
                <span>Total Courses</span>
                <strong>{courses.length}</strong>

                <small>
                  <b>{publishedCourses}</b> published
                </small>
              </div>
            </div>

            <div className="instructor-stat-card">
              <div className="stat-icon students-stat-icon">
                👥
              </div>

              <div className="stat-content">
                <span>Total Students</span>
                <strong>{totalStudents}</strong>

                <small>
                  <b>+12%</b> this month
                </small>
              </div>
            </div>

            <div className="instructor-stat-card">
              <div className="stat-icon lessons-stat-icon">
                ▶
              </div>

              <div className="stat-content">
                <span>Total Lessons</span>
                <strong>{totalLessons}</strong>

                <small>
                  <b>8</b> added this month
                </small>
              </div>
            </div>

            <div className="instructor-stat-card">
              <div className="stat-icon rating-stat-icon">
                ⭐
              </div>

              <div className="stat-content">
                <span>Average Rating</span>
                <strong>{averageRating}</strong>

                <small>
                  <b>Excellent</b> overall
                </small>
              </div>
            </div>
          </section>

          {/* COURSES + ACTIVITY */}
          <div className="instructor-dashboard-grid">
            {/* COURSES */}
            <section className="instructor-panel courses-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-label">CONTENT</span>
                  <h2>Your Courses</h2>
                </div>

                <Link
                  to="/instructor/courses"
                  className="view-all-link"
                >
                  View All →
                </Link>
              </div>

              <div className="instructor-course-list">
                {courses.map((course) => (
                  <div
                    className="instructor-course-row"
                    key={course.id}
                  >
                    <div className="course-thumbnail">
                      <span>📖</span>
                    </div>

                    <div className="course-row-content">
                      <div className="course-row-top">
                        <span className="course-category">
                          {course.category}
                        </span>

                        <span
                          className={`course-status ${course.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {course.status}
                        </span>
                      </div>

                      <h3>{course.title}</h3>

                      <div className="course-row-meta">
                        <span>
                          👥 {course.students} students
                        </span>

                        <span>
                          📚 {course.lessons} lessons
                        </span>

                        {course.rating > 0 && (
                          <span>⭐ {course.rating}</span>
                        )}
                      </div>
                    </div>

                    <button
                      className="course-action-button"
                      onClick={() =>
                        navigate(
                          `/instructor/courses/${course.id}`
                        )
                      }
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* STUDENT ACTIVITY */}
            <section className="instructor-panel activity-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-label">RECENT</span>
                  <h2>Student Activity</h2>
                </div>

                <button className="panel-more-button">
                  •••
                </button>
              </div>

              <div className="activity-list">
                {activities.map((activity) => (
                  <div
                    className="activity-item"
                    key={activity.id}
                  >
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="activity-content">
                      <p>
                        <strong>{activity.student}</strong>{" "}
                        {activity.message}
                      </p>

                      <span>{activity.course}</span>

                      <small>{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>

              <button className="activity-view-button">
                View All Activity
              </button>
            </section>
          </div>

          {/* PERFORMANCE + QUICK ACTIONS */}
          <div className="instructor-bottom-grid">
            {/* PERFORMANCE */}
            <section className="instructor-panel performance-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-label">
                    PERFORMANCE
                  </span>

                  <h2>Course Performance</h2>
                </div>

                <select
                  className="performance-select"
                  defaultValue="30"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>

              <div className="performance-summary">
                <div>
                  <span>Total Enrollments</span>
                  <strong>558</strong>
                  <small>
                    ↑ 14.8% compared to last month
                  </small>
                </div>

                <div>
                  <span>Course Completions</span>
                  <strong>286</strong>
                  <small>
                    ↑ 9.4% compared to last month
                  </small>
                </div>
              </div>

              <div className="performance-chart">
                <div className="chart-y-axis">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                <div className="chart-area">
                  <div className="chart-grid-line line-100"></div>
                  <div className="chart-grid-line line-75"></div>
                  <div className="chart-grid-line line-50"></div>
                  <div className="chart-grid-line line-25"></div>
                  <div className="chart-grid-line line-0"></div>

                  <svg
                    className="performance-line"
                    viewBox="0 0 700 200"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="0,150 80,135 160,142 240,110 320,120 400,85 480,95 560,60 640,70 700,42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />

                    <circle
                      cx="0"
                      cy="150"
                      r="4"
                      fill="currentColor"
                    />

                    <circle
                      cx="80"
                      cy="135"
                      r="4"
                      fill="currentColor"
                    />

                    <circle
                      cx="160"
                      cy="142"
                      r="4"
                      fill="currentColor"
                    />

                    <circle
                      cx="240"
                      cy="110"
                      r="4"
                      fill="currentColor"
                    />

                    <circle
                      cx="320"
                      cy="120"
                      r="4"
                      fill="currentColor"
                    />

                    <circle
                      cx="400"
                      cy="85"
                      r="4"
                      fill="currentColor"
                    />

                    <circle
                      cx="480"
                      cy="95"
                      r="4"
                      fill="currentColor"
                    />

                    <circle
                      cx="560"
                      cy="60"
                      r="4"
                      fill="currentColor"
                    />

                    <circle
                      cx="640"
                      cy="70"
                      r="4"
                      fill="currentColor"
                    />

                    <circle
                      cx="700"
                      cy="42"
                      r="4"
                      fill="currentColor"
                    />
                  </svg>

                  <div className="chart-x-axis">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="instructor-panel quick-actions-panel">
              <div className="panel-header">
                <div>
                  <span className="panel-label">
                    SHORTCUTS
                  </span>

                  <h2>Quick Actions</h2>
                </div>
              </div>

              <div className="quick-action-list">
                <Link
                  to="/instructor/courses/create"
                  className="quick-action"
                >
                  <div className="quick-action-icon create-icon">
                    ＋
                  </div>

                  <div>
                    <strong>Create a Course</strong>
                    <span>
                      Start building a new course
                    </span>
                  </div>

                  <span className="quick-action-arrow">
                    →
                  </span>
                </Link>

                <Link
                  to="/instructor/courses"
                  className="quick-action"
                >
                  <div className="quick-action-icon manage-icon">
                    📚
                  </div>

                  <div>
                    <strong>Manage Courses</strong>
                    <span>
                      Edit and organize your courses
                    </span>
                  </div>

                  <span className="quick-action-arrow">
                    →
                  </span>
                </Link>

                {/* Manage Lessons */}
                <Link
                  to="/instructor/lessons"
                  className="quick-action"
                >
                  <div className="quick-action-icon manage-icon">
                    📖
                  </div>

                  <div>
                    <strong>Manage Lessons</strong>
                    <span>
                      Add and organize course lessons
                    </span>
                  </div>

                  <span className="quick-action-arrow">
                    →
                  </span>
                </Link>

                <Link
                  to="/instructor/quizzes"
                  className="quick-action"
                >
                  <div className="quick-action-icon quiz-icon">
                    📝
                  </div>

                  <div>
                    <strong>Manage Quizzes</strong>
                    <span>
                      Create and update quizzes
                    </span>
                  </div>

                  <span className="quick-action-arrow">
                    →
                  </span>
                </Link>

                <Link
                  to="/instructor/students"
                  className="quick-action"
                >
                  <div className="quick-action-icon students-icon">
                    👥
                  </div>

                  <div>
                    <strong>View Students</strong>
                    <span>
                      Track your learners
                    </span>
                  </div>

                  <span className="quick-action-arrow">
                    →
                  </span>
                </Link>
              </div>
            </section>
          </div>

          {/* CTA */}
          <section className="instructor-cta">
            <div className="cta-icon">🚀</div>

            <div className="cta-content">
              <span>
                GROW YOUR LEARNING COMMUNITY
              </span>

              <h2>Keep creating great courses!</h2>

              <p>
                Share your knowledge, help students grow, and
                build your teaching journey with LearnHub.
              </p>
            </div>

            <Link
              to="/instructor/courses/create"
              className="cta-button"
            >
              Create Course →
            </Link>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="instructor-footer">
          <div>
            <strong>LearnHub</strong>
            <span>
              © 2026 LearnHub. All rights reserved.
            </span>
          </div>

          <div className="instructor-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default InstructorDashboard;
