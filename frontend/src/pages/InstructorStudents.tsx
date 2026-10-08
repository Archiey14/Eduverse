
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./InstructorStudents.css";

interface Student {
  id: number;
  name: string;
  email: string;
  avatar: string;
  course: string;
  progress: number;
  enrolledDate: string;
  lastActive: string;
  status: "Active" | "Completed" | "Inactive";
  lessonsCompleted: number;
  totalLessons: number;
}

const students: Student[] = [
  {
    id: 1,
    name: "Rahul Kumar",
    email: "rahul.kumar@example.com",
    avatar: "R",
    course: "Complete React & TypeScript",
    progress: 82,
    enrolledDate: "Sep 12, 2026",
    lastActive: "10 minutes ago",
    status: "Active",
    lessonsCompleted: 26,
    totalLessons: 32,
  },
  {
    id: 2,
    name: "Ananya Sharma",
    email: "ananya.sharma@example.com",
    avatar: "A",
    course: "JavaScript Fundamentals",
    progress: 100,
    enrolledDate: "Aug 28, 2026",
    lastActive: "1 hour ago",
    status: "Completed",
    lessonsCompleted: 28,
    totalLessons: 28,
  },
  {
    id: 3,
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    avatar: "V",
    course: "Modern CSS Masterclass",
    progress: 76,
    enrolledDate: "Sep 5, 2026",
    lastActive: "3 hours ago",
    status: "Active",
    lessonsCompleted: 18,
    totalLessons: 24,
  },
  {
    id: 4,
    name: "Priya Reddy",
    email: "priya.reddy@example.com",
    avatar: "P",
    course: "Complete React & TypeScript",
    progress: 64,
    enrolledDate: "Sep 18, 2026",
    lastActive: "5 hours ago",
    status: "Active",
    lessonsCompleted: 20,
    totalLessons: 32,
  },
  {
    id: 5,
    name: "Arjun Patel",
    email: "arjun.patel@example.com",
    avatar: "A",
    course: "JavaScript Fundamentals",
    progress: 48,
    enrolledDate: "Sep 22, 2026",
    lastActive: "Yesterday",
    status: "Active",
    lessonsCompleted: 13,
    totalLessons: 28,
  },
  {
    id: 6,
    name: "Sneha Rani",
    email: "sneha.rani@example.com",
    avatar: "S",
    course: "Complete React & TypeScript",
    progress: 100,
    enrolledDate: "Jul 15, 2026",
    lastActive: "2 days ago",
    status: "Completed",
    lessonsCompleted: 32,
    totalLessons: 32,
  },
  {
    id: 7,
    name: "Karthik Rao",
    email: "karthik.rao@example.com",
    avatar: "K",
    course: "Modern CSS Masterclass",
    progress: 31,
    enrolledDate: "Sep 29, 2026",
    lastActive: "3 days ago",
    status: "Active",
    lessonsCompleted: 7,
    totalLessons: 24,
  },
  {
    id: 8,
    name: "Meera Joshi",
    email: "meera.joshi@example.com",
    avatar: "M",
    course: "JavaScript Fundamentals",
    progress: 18,
    enrolledDate: "Sep 30, 2026",
    lastActive: "1 week ago",
    status: "Inactive",
    lessonsCompleted: 5,
    totalLessons: 28,
  },
  {
    id: 9,
    name: "Arun Kumar",
    email: "arun.kumar@example.com",
    avatar: "A",
    course: "Node.js & Express",
    progress: 12,
    enrolledDate: "Oct 1, 2026",
    lastActive: "2 days ago",
    status: "Active",
    lessonsCompleted: 2,
    totalLessons: 18,
  },
  {
    id: 10,
    name: "Divya Nair",
    email: "divya.nair@example.com",
    avatar: "D",
    course: "Modern CSS Masterclass",
    progress: 100,
    enrolledDate: "Jul 30, 2026",
    lastActive: "5 days ago",
    status: "Completed",
    lessonsCompleted: 24,
    totalLessons: 24,
  },
];

function InstructorStudents() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.course
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCourse =
        courseFilter === "All Courses" ||
        student.course === courseFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        student.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [searchTerm, courseFilter, statusFilter]);

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.status === "Active"
  ).length;

  const completedStudents = students.filter(
    (student) => student.status === "Completed"
  ).length;

  const averageProgress =
    students.length > 0
      ? Math.round(
          students.reduce(
            (total, student) => total + student.progress,
            0
          ) / students.length
        )
      : 0;

  const courseOptions = [
    "All Courses",
    ...Array.from(
      new Set(students.map((student) => student.course))
    ),
  ];

  return (
    <div className="instructor-students-page">
      {/* ==================== SIDEBAR ==================== */}
      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <div className="instructor-brand-icon">L</div>

          <div className="instructor-brand-text">
            <span className="instructor-brand-title">
              LearnHub
            </span>

            <span className="instructor-brand-subtitle">
              Instructor
            </span>
          </div>
        </div>

        <nav className="instructor-navigation">
          {/* MAIN */}
          <div className="instructor-nav-section">
            <span className="instructor-nav-label">
              MAIN
            </span>

            <Link
              to="/instructor/dashboard"
              className="instructor-nav-link"
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
            <span className="instructor-nav-label">
              MANAGE
            </span>

            <Link
              to="/instructor/lessons"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">📖</span>
              <span>Manage Lessons</span>
            </Link>

            <Link
              to="/instructor/students"
              className="instructor-nav-link active"
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
            <span className="instructor-nav-label">
              ACCOUNT
            </span>

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

        {/* SIDEBAR BOTTOM */}
        <div className="instructor-sidebar-bottom">
          <div className="instructor-support-card">
            <div className="instructor-support-icon">
              💡
            </div>

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

      {/* ==================== MAIN ==================== */}
      <main className="instructor-main">
        {/* TOPBAR */}
        <header className="instructor-topbar">
          <div className="instructor-breadcrumb">
            <span>Instructor</span>

            <span className="breadcrumb-separator">
              /
            </span>

            <strong>Students</strong>
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
                  S
                </div>

                <div className="instructor-user-info">
                  <strong>Supriya Enjam</strong>
                  <span>Instructor</span>
                </div>

                <span className="profile-chevron">
                  ⌄
                </span>
              </button>

              {showProfileMenu && (
                <div className="instructor-profile-menu">
                  <Link to="/profile">
                    My Profile
                  </Link>

                  <Link to="/settings">
                    Settings
                  </Link>

                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="instructor-content instructor-students-content">
          {/* PAGE HEADER */}
          <section className="students-page-header">
            <div>
              <span className="welcome-label">
                STUDENT MANAGEMENT
              </span>

              <h1>My Students</h1>

              <p>
                Track your students, monitor their progress,
                and manage course enrollments.
              </p>
            </div>

            <Link
              to="/instructor/courses"
              className="students-header-button"
            >
              <span>📚</span>
              View My Courses
            </Link>
          </section>

          {/* STATISTICS */}
          <section className="student-stats">
            <div className="student-stat-card">
              <div className="student-stat-icon total">
                👥
              </div>

              <div className="student-stat-content">
                <span>Total Students</span>
                <strong>{totalStudents}</strong>
                <small>Across all courses</small>
              </div>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon active">
                🟢
              </div>

              <div className="student-stat-content">
                <span>Active Students</span>
                <strong>{activeStudents}</strong>
                <small>Currently learning</small>
              </div>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon completed">
                🎓
              </div>

              <div className="student-stat-content">
                <span>Completed</span>
                <strong>{completedStudents}</strong>
                <small>Finished a course</small>
              </div>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon progress">
                📈
              </div>

              <div className="student-stat-content">
                <span>Average Progress</span>
                <strong>{averageProgress}%</strong>
                <small>Overall student progress</small>
              </div>
            </div>
          </section>

          {/* FILTERS */}
          <section className="students-filter-panel">
            <div className="students-search">
              <span className="search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search students by name, email or course..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="student-filter-group">
              <select
                value={courseFilter}
                onChange={(event) =>
                  setCourseFilter(event.target.value)
                }
                aria-label="Filter by course"
              >
                {courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filter by status"
              >
                <option value="All Status">
                  All Status
                </option>

                <option value="Active">Active</option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>
          </section>

          {/* STUDENT LIST */}
          <section className="students-panel">
            <div className="students-panel-header">
              <div>
                <span className="panel-label">
                  LEARNERS
                </span>

                <h2>Student List</h2>
              </div>

              <span className="student-result-count">
                {filteredStudents.length}{" "}
                {filteredStudents.length === 1
                  ? "student"
                  : "students"}
              </span>
            </div>

            {filteredStudents.length > 0 ? (
              <div className="student-table-wrapper">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        {/* STUDENT */}
                        <td>
                          <div className="student-info">
                            <div className="student-avatar">
                              {student.avatar}
                            </div>

                            <div>
                              <strong>
                                {student.name}
                              </strong>

                              <span>
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* COURSE */}
                        <td>
                          <div className="student-course">
                            <strong>
                              {student.course}
                            </strong>

                            <span>
                              Enrolled{" "}
                              {student.enrolledDate}
                            </span>
                          </div>
                        </td>

                        {/* PROGRESS */}
                        <td>
                          <div className="student-progress">
                            <div className="progress-header">
                              <span>
                                {student.progress}%
                              </span>

                              <small>
                                {student.lessonsCompleted}/
                                {student.totalLessons}{" "}
                                lessons
                              </small>
                            </div>

                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${student.progress}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`student-status ${student.status
                              .toLowerCase()}`}
                          >
                            <span className="status-dot"></span>
                            {student.status}
                          </span>
                        </td>

                        {/* LAST ACTIVE */}
                        <td>
                          <span className="last-active">
                            {student.lastActive}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td>
                          <button
                            className="student-view-button"
                            onClick={() =>
                              alert(
                                `Student: ${student.name}\n\nEmail: ${student.email}\nCourse: ${student.course}\nProgress: ${student.progress}%`
                              )
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="students-empty-state">
                <div className="empty-icon">
                  🔍
                </div>

                <h3>No students found</h3>

                <p>
                  Try changing your search or filter
                  criteria.
                </p>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCourseFilter("All Courses");
                    setStatusFilter("All Status");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>

          {/* COURSE SUMMARY */}
          <section className="course-summary-panel">
            <div className="students-panel-header">
              <div>
                <span className="panel-label">
                  OVERVIEW
                </span>

                <h2>Students by Course</h2>
              </div>
            </div>

            <div className="course-summary-grid">
              {courseOptions
                .filter((course) => course !== "All Courses")
                .map((course) => {
                  const courseStudents = students.filter(
                    (student) =>
                      student.course === course
                  );

                  const courseAverage =
                    courseStudents.length > 0
                      ? Math.round(
                          courseStudents.reduce(
                            (total, student) =>
                              total + student.progress,
                            0
                          ) / courseStudents.length
                        )
                      : 0;

                  return (
                    <div
                      className="course-summary-card"
                      key={course}
                    >
                      <div className="course-summary-icon">
                        📚
                      </div>

                      <div className="course-summary-info">
                        <h3>{course}</h3>

                        <div className="course-summary-meta">
                          <span>
                            👥{" "}
                            {courseStudents.length}{" "}
                            students
                          </span>

                          <span>
                            📈 {courseAverage}% avg.
                            progress
                          </span>
                        </div>

                        <div className="course-summary-progress">
                          <div
                            className="course-summary-progress-fill"
                            style={{
                              width: `${courseAverage}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <button
                        className="course-summary-button"
                        onClick={() => {
                          setCourseFilter(course);
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                      >
                        View
                      </button>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* INFO BANNER */}
          <section className="students-info-banner">
            <div className="students-info-icon">
              💡
            </div>

            <div>
              <strong>
                Keep your students engaged
              </strong>

              <p>
                Regularly review student progress and
                provide helpful feedback to improve their
                learning experience.
              </p>
            </div>
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

export default InstructorStudents;
