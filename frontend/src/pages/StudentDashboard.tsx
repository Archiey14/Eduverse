import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState<any>(null);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      logout();
      navigate("/login");
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.dashboard.getStudentDashboard();
        if (res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchDashboard();
  }, []);

  // Map live data from database with fallback presets
  const dbStats = dashboardData?.stats;
  const enrolledCount = dbStats?.enrolledCount ?? 2;
  const completedCount = dbStats?.completedCount ?? 1;
  const hoursLearned = dbStats ? `${dbStats.hoursLearned}h` : "14h";

  // Dynamic enrolled courses from DB
  const rawEnrolled = dashboardData?.activeEnrollments || [];
  const enrolledCourses =
    rawEnrolled.length > 0
      ? rawEnrolled.map((enr: any, idx: number) => ({
          id: enr.course?._id || enr._id,
          category: (enr.course?.category?.name || "Web Development").toUpperCase(),
          title: enr.course?.title || "Course",
          instructor: enr.course?.mentor?.name || "Lead Instructor",
          lesson: enr.lastLesson?.title || "Next Lesson",
          lessonNumber: enr.completedLessons?.length || 1,
          totalLessons: enr.course?.stats?.lessonCount || 8,
          progress: enr.progressPercent || 0,
          icon: idx % 2 === 0 ? "💻" : "🐍",
          duration: `${enr.course?.stats?.totalDurationMin || 45}m`,
          colorClass: idx % 3 === 0 ? "course-blue" : idx % 3 === 1 ? "course-purple" : "course-green",
        }))
      : [
          {
            id: "1",
            category: "WEB DEVELOPMENT",
            title: "Complete React & TypeScript Development",
            instructor: "Sarah Johnson",
            lesson: "Custom Hooks & Asynchronous State",
            lessonNumber: 2,
            totalLessons: 3,
            progress: 75,
            icon: "💻",
            duration: "59m",
            colorClass: "course-blue",
          },
          {
            id: "2",
            category: "DATA SCIENCE",
            title: "Python for Data Science & Machine Learning",
            instructor: "David Wilson",
            lesson: "Python Fundamentals",
            lessonNumber: 1,
            totalLessons: 3,
            progress: 33,
            icon: "🐍",
            duration: "73m",
            colorClass: "course-purple",
          },
        ];

  // Dynamic upcoming quizzes
  const upcomingQuizzes = [
    {
      id: 1,
      title: "React Fundamentals Quiz",
      course: "Complete React & TypeScript Development",
      questions: 10,
      duration: "15 min",
      date: "Today",
      icon: "⚛️",
      type: "today",
    },
    {
      id: 2,
      title: "Python Basics Assessment",
      course: "Python for Data Science",
      questions: 15,
      duration: "20 min",
      date: "Tomorrow",
      icon: "🐍",
      type: "tomorrow",
    },
    {
      id: 3,
      title: "Data Structures Test",
      course: "Computer Science Track",
      questions: 12,
      duration: "15 min",
      date: "Friday",
      icon: "🗃️",
      type: "upcoming",
    },
  ];

  // Dynamic recommended courses
  const recommendedCourses = [
    {
      id: 1,
      title: "JavaScript Mastery",
      instructor: "David Wilson",
      rating: "4.9",
      students: "2.4k",
      lessons: "24 lessons",
      duration: "18h",
      price: "Free",
      icon: "🟨",
      colorClass: "recommend-yellow",
    },
    {
      id: 2,
      title: "UI/UX Design Fundamentals",
      instructor: "Emily Davis",
      rating: "4.8",
      students: "1.8k",
      lessons: "18 lessons",
      duration: "12h",
      price: "Free",
      icon: "🎨",
      colorClass: "recommend-pink",
    },
    {
      id: 3,
      title: "Node.js & Express",
      instructor: "James Anderson",
      rating: "4.9",
      students: "3.1k",
      lessons: "22 lessons",
      duration: "16h",
      price: "Free",
      icon: "🟢",
      colorClass: "recommend-green",
    },
  ];

  // Dynamic activities from DB
  const rawActivities = dashboardData?.recentActivities || [];
  const recentActivities =
    rawActivities.length > 0
      ? rawActivities.slice(0, 4).map((act: any) => ({
          id: act._id,
          icon: act.type === "quiz_passed" ? "📝" : act.type === "enrolled" ? "📚" : "✓",
          title: act.message,
          description: act.course?.title || "Course Progress",
          time: new Date(act.createdAt).toLocaleDateString(),
          type: act.type === "quiz_passed" ? "quiz" : act.type === "enrolled" ? "course" : "success",
        }))
      : [
          {
            id: 1,
            icon: "✓",
            title: "Completed a lesson",
            description: "Introduction to React 19 & Course Overview",
            time: "Today",
            type: "success",
          },
          {
            id: 2,
            icon: "🏆",
            title: "Earned an achievement",
            description: "7 Day Learning Streak",
            time: "Yesterday",
            type: "achievement",
          },
          {
            id: 3,
            icon: "📝",
            title: "Passed quiz",
            description: "React Fundamentals Quiz — 100%",
            time: "2 days ago",
            type: "quiz",
          },
        ];

  const achievements = [
    {
      icon: "🏆",
      title: "First Course",
      description: "Completed your first course",
    },
    {
      icon: "🔥",
      title: "7 Day Streak",
      description: "Learned for 7 days in a row",
    },
    {
      icon: "⭐",
      title: "Quiz Master",
      description: "Scored 90% or higher",
    },
    {
      icon: "🚀",
      title: "Fast Learner",
      description: "Completed 5 lessons in a day",
    },
  ];

  const filteredCourses = enrolledCourses.filter((course: any) =>
    `${course.title} ${course.category} ${course.instructor}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const displayName = user?.name || "Alex Rivera";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="student-dashboard">
      {/* ================================
          MOBILE OVERLAY
      ================================= */}

      {sidebarOpen && (
        <div className="dashboard-overlay" onClick={closeSidebar}></div>
      )}

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="dashboard-brand">
          <Link
            to="/student/dashboard"
            className="dashboard-logo"
            onClick={closeSidebar}
          >
            <span className="dashboard-logo-icon">L</span>
            <span className="dashboard-logo-text">LearnHub</span>
          </Link>

          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
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
              className="dashboard-nav-item active"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">▦</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/courses"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">📚</span>
              <span>My Courses</span>
            </Link>

            <Link
              to="/discover"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">🔍</span>
              <span>Discover Courses</span>
            </Link>

            <Link
              to="/quizzes"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">📝</span>
              <span>Quizzes</span>
              <span className="nav-badge">3</span>
            </Link>

            <Link
              to="/progress"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">📈</span>
              <span>My Progress</span>
            </Link>
          </div>

          <div className="navigation-section">
            <span className="navigation-title">LEARNING</span>

            <Link
              to="/activities"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">⚡</span>
              <span>Learning Activity</span>
            </Link>

            <Link
              to="/progress"
              className="dashboard-nav-item"
              onClick={closeSidebar}
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
              <Link to="/courses">Visit Course Center →</Link>
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

      {/* ================================
          MAIN AREA
      ================================= */}

      <main className="dashboard-main">
        {/* ================================
            TOPBAR
        ================================= */}

        <header className="dashboard-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <Link to="/student/dashboard" className="mobile-dashboard-logo">
            <span className="dashboard-logo-icon">L</span>
            LearnHub
          </Link>

          <div className="dashboard-search">
            <span className="dashboard-search-icon">🔍</span>

            <input
              type="search"
              placeholder="Search courses, lessons..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            <span className="search-shortcut">Ctrl K</span>
          </div>

          <div className="dashboard-top-actions">
            <Link
              to="/courses"
              className="dashboard-icon-button"
              aria-label="Help"
            >
              ?
            </Link>

            <Link
              to="/activities"
              className="dashboard-icon-button notification-button"
              aria-label="Notifications"
            >
              🔔
              <span className="notification-indicator"></span>
            </Link>

            <div className="topbar-divider"></div>

            <div className="dashboard-user-menu">
              <div className="dashboard-avatar">{userInitial}</div>

              <div className="dashboard-user-info">
                <strong>{displayName}</strong>
                <span>Student</span>
              </div>

              <span className="user-menu-arrow">▼</span>
            </div>
          </div>
        </header>

        {/* ================================
            CONTENT
        ================================= */}

        <div className="dashboard-content">
          {/* ================================
              WELCOME HERO
          ================================= */}

          <section className="dashboard-welcome">
            <div className="welcome-content">
              <span className="welcome-eyebrow">STUDENT DASHBOARD</span>

              <h1>Welcome back, {displayName}! 👋</h1>

              <p>
                You're doing great! Keep learning and reach your goals one
                lesson at a time.
              </p>

              <div className="welcome-actions">
                <Link to="/courses" className="dashboard-primary-button">
                  Continue Learning
                  <span>→</span>
                </Link>

                <Link to="/discover" className="dashboard-secondary-button">
                  Explore Courses
                </Link>
              </div>
            </div>

            <div className="welcome-visual">
              <div className="welcome-circle circle-one"></div>
              <div className="welcome-circle circle-two"></div>

              <div className="welcome-student">🎓</div>

              <div className="floating-learning-card">
                <span>🔥</span>

                <div>
                  <strong>7 day streak</strong>
                  <small>Keep it going!</small>
                </div>
              </div>

              <div className="floating-progress-card">
                <div className="mini-progress-ring">68%</div>

                <div>
                  <strong>Overall Progress</strong>
                  <small>+12% this month</small>
                </div>
              </div>
            </div>
          </section>

          {/* ================================
              STATISTICS
          ================================= */}

          <section className="dashboard-stat-grid">
            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="dashboard-stat-icon blue">📚</div>

                <span className="stat-change positive">+2</span>
              </div>

              <span className="stat-label">Enrolled Courses</span>

              <strong className="stat-number">{enrolledCount}</strong>

              <p>
                <span>↑ Active</span> courses
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="dashboard-stat-icon purple">📈</div>

                <span className="stat-change positive">+12%</span>
              </div>

              <span className="stat-label">Average Progress</span>

              <strong className="stat-number">68%</strong>

              <p>
                <span>↑ 12%</span> this month
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="dashboard-stat-icon green">✓</div>

                <span className="stat-change positive">+1</span>
              </div>

              <span className="stat-label">Completed Courses</span>

              <strong className="stat-number">{completedCount}</strong>

              <p>
                <span>↑ Verified</span> certificates
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="dashboard-stat-icon orange">⏱</div>

                <span className="stat-change positive">+5h</span>
              </div>

              <span className="stat-label">Learning Hours</span>

              <strong className="stat-number">{hoursLearned}</strong>

              <p>
                <span>↑ Tracked</span> learning
              </p>
            </div>
          </section>

          {/* ================================
              MAIN GRID
          ================================= */}

          <div className="dashboard-main-grid">
            {/* IN PROGRESS COURSES */}

            <section className="dashboard-card in-progress-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="card-eyebrow">CONTINUE LEARNING</span>

                  <h2>In Progress Courses</h2>

                  <p>Pick up where you left off and keep moving forward.</p>
                </div>

                <Link to="/courses" className="view-all-link">
                  View all ({enrolledCourses.length}) →
                </Link>
              </div>

              <div className="course-list">
                {filteredCourses.map((course: any) => (
                  <article className="dashboard-course-item" key={course.id}>
                    <div className={`course-visual ${course.colorClass}`}>
                      <span>{course.icon}</span>

                      <small>{course.duration}</small>
                    </div>

                    <div className="dashboard-course-info">
                      <span className="course-category">{course.category}</span>

                      <h3>{course.title}</h3>

                      <p>
                        Current: <span>{course.lesson}</span> (Lesson{" "}
                        {course.lessonNumber} of {course.totalLessons})
                      </p>

                      <div className="course-progress-line">
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>

                        <strong>{course.progress}%</strong>
                      </div>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="course-play-button"
                      aria-label={`Continue ${course.title}`}
                    >
                      ▶
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            {/* UPCOMING QUIZZES */}

            <section className="dashboard-card quizzes-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="card-eyebrow">ASSESSMENTS</span>

                  <h2>Upcoming Quizzes</h2>

                  <p>Test your knowledge and track your scores.</p>
                </div>

                <Link to="/quizzes" className="view-all-link">
                  View all →
                </Link>
              </div>

              <div className="quiz-list">
                {upcomingQuizzes.map((quiz) => (
                  <article className="dashboard-quiz-item" key={quiz.id}>
                    <div className="quiz-item-icon">{quiz.icon}</div>

                    <div className="quiz-item-content">
                      <h3>{quiz.title}</h3>

                      <p>
                        {quiz.course} • {quiz.questions} questions •{" "}
                        {quiz.duration}
                      </p>
                    </div>

                    <span className={`quiz-date ${quiz.type}`}>
                      {quiz.date}
                    </span>
                  </article>
                ))}
              </div>

              <Link to="/quizzes" className="full-width-outline-button">
                View all quizzes →
              </Link>
            </section>
          </div>

          {/* ================================
              SECONDARY GRID
          ================================= */}

          <div className="dashboard-secondary-grid">
            {/* ACTIVITY */}

            <section className="dashboard-card activity-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="card-eyebrow">STUDY TIME</span>

                  <h2>Learning Activity</h2>

                  <p>Track your weekly learning time and consistency.</p>
                </div>

                <select className="activity-filter" aria-label="Select time range">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>

              <div className="activity-summary">
                <div>
                  <strong>14.5 hrs</strong>
                  <span>Total Time</span>
                </div>

                <div>
                  <strong>2.1 hrs</strong>
                  <span>Daily Average</span>
                </div>

                <div>
                  <strong>5 days</strong>
                  <span>Active Days</span>
                </div>
              </div>

              <div className="activity-chart">
                <div className="chart-y-axis">
                  <span>4h</span>
                  <span>3h</span>
                  <span>2h</span>
                  <span>1h</span>
                  <span>0</span>
                </div>

                <div className="chart-content">
                  <div className="chart-grid-line line-one"></div>
                  <div className="chart-grid-line line-two"></div>
                  <div className="chart-grid-line line-three"></div>
                  <div className="chart-grid-line line-four"></div>

                  <div className="chart-bars">
                    <div className="chart-day">
                      <div
                        className="activity-bar"
                        style={{ height: "45%" }}
                      ></div>
                      <span>Mon</span>
                    </div>

                    <div className="chart-day">
                      <div
                        className="activity-bar"
                        style={{ height: "68%" }}
                      ></div>
                      <span>Tue</span>
                    </div>

                    <div className="chart-day">
                      <div
                        className="activity-bar"
                        style={{ height: "52%" }}
                      ></div>
                      <span>Wed</span>
                    </div>

                    <div className="chart-day">
                      <div
                        className="activity-bar active"
                        style={{ height: "86%" }}
                      ></div>
                      <span>Thu</span>
                    </div>

                    <div className="chart-day">
                      <div
                        className="activity-bar"
                        style={{ height: "64%" }}
                      ></div>
                      <span>Fri</span>
                    </div>

                    <div className="chart-day">
                      <div
                        className="activity-bar"
                        style={{ height: "35%" }}
                      ></div>
                      <span>Sat</span>
                    </div>

                    <div className="chart-day">
                      <div
                        className="activity-bar"
                        style={{ height: "25%" }}
                      ></div>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ACHIEVEMENTS */}

            <section className="dashboard-card achievements-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="card-eyebrow">MILESTONES</span>

                  <h2>Achievements</h2>

                  <p>Celebrate your progress.</p>
                </div>

                <Link to="/progress" className="view-all-link">
                  View all →
                </Link>
              </div>

              <div className="achievement-grid">
                {achievements.map((achievement) => (
                  <div className="achievement-card" key={achievement.title}>
                    <div className="achievement-card-icon">
                      {achievement.icon}
                    </div>

                    <div>
                      <strong>{achievement.title}</strong>

                      <span>{achievement.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ================================
              RECOMMENDED COURSES
          ================================= */}

          <section className="dashboard-card recommended-section">
            <div className="dashboard-card-header">
              <div>
                <span className="card-eyebrow">RECOMMENDED FOR YOU</span>

                <h2>Explore New Courses</h2>

                <p>
                  Continue growing with courses selected for your learning
                  journey.
                </p>
              </div>

              <Link to="/discover" className="view-all-link">
                Explore all →
              </Link>
            </div>

            <div className="recommended-grid">
              {recommendedCourses.map((course) => (
                <article className="recommended-course" key={course.id}>
                  <div className={`recommended-course-image ${course.colorClass}`}>
                    <span>{course.icon}</span>

                    <button
                      type="button"
                      className="course-wishlist"
                      aria-label={`Add ${course.title} to wishlist`}
                    >
                      ♡
                    </button>
                  </div>

                  <div className="recommended-course-body">
                    <div className="course-rating">
                      <span>★</span>
                      <strong>{course.rating}</strong>
                      <span>({course.students})</span>
                    </div>

                    <h3>{course.title}</h3>

                    <p className="recommended-instructor">
                      By {course.instructor}
                    </p>

                    <div className="recommended-meta">
                      <span>📚 {course.lessons}</span>

                      <span>⏱ {course.duration}</span>
                    </div>

                    <div className="recommended-footer">
                      <strong>{course.price}</strong>

                      <Link
                        to={`/courses/${course.id}`}
                        className="course-details-link"
                      >
                        View Course →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ================================
              RECENT ACTIVITY
          ================================= */}

          <section className="dashboard-card recent-activity-section">
            <div className="dashboard-card-header">
              <div>
                <span className="card-eyebrow">RECENT ACTIVITY</span>

                <h2>What You've Been Up To</h2>

                <p>Your latest learning activities.</p>
              </div>

              <Link to="/activities" className="view-all-link">
                View activity →
              </Link>
            </div>

            <div className="recent-activity-list">
              {recentActivities.map((activity: any) => (
                <div className="recent-activity-item" key={activity.id}>
                  <div className={`activity-item-icon ${activity.type}`}>
                    {activity.icon}
                  </div>

                  <div className="recent-activity-content">
                    <strong>{activity.title}</strong>

                    <span>{activity.description}</span>
                  </div>

                  <time>{activity.time}</time>
                </div>
              ))}
            </div>
          </section>

          {/* ================================
              FOOTER
          ================================= */}

          <footer className="dashboard-footer">
            <p>© 2026 LearnHub. All rights reserved.</p>

            <div className="dashboard-footer-links">
              <Link to="/privacy">Privacy</Link>

              <Link to="/terms">Terms</Link>

              <Link to="/help">Help Center</Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
