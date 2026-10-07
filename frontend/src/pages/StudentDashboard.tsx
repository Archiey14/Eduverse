
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      navigate("/login");
    }
  };

  const enrolledCourses = [
    {
      id: 1,
      category: "WEB DEVELOPMENT",
      title: "Full Stack Web Development",
      instructor: "Alex Johnson",
      lesson: "React Components",
      lessonNumber: 8,
      totalLessons: 12,
      progress: 72,
      icon: "💻",
      duration: "12h 30m",
      colorClass: "course-blue",
    },
    {
      id: 2,
      category: "DATA SCIENCE",
      title: "Python for Data Science",
      instructor: "Sarah Williams",
      lesson: "Data Analysis with Pandas",
      lessonNumber: 5,
      totalLessons: 10,
      progress: 48,
      icon: "🐍",
      duration: "9h 45m",
      colorClass: "course-purple",
    },
    {
      id: 3,
      category: "DATABASE",
      title: "MongoDB for Beginners",
      instructor: "Michael Brown",
      lesson: "MongoDB Queries",
      lessonNumber: 4,
      totalLessons: 8,
      progress: 55,
      icon: "🗄️",
      duration: "6h 20m",
      colorClass: "course-green",
    },
  ];

  const upcomingQuizzes = [
    {
      id: 1,
      title: "React Fundamentals",
      course: "Full Stack Web Development",
      questions: 10,
      duration: "15 min",
      date: "Today",
      icon: "⚛️",
      type: "today",
    },
    {
      id: 2,
      title: "Python Basics",
      course: "Python for Data Science",
      questions: 15,
      duration: "20 min",
      date: "Tomorrow",
      icon: "🐍",
      type: "tomorrow",
    },
    {
      id: 3,
      title: "Database Fundamentals",
      course: "MongoDB for Beginners",
      questions: 12,
      duration: "15 min",
      date: "Friday",
      icon: "🗃️",
      type: "upcoming",
    },
  ];

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

  const recentActivities = [
    {
      id: 1,
      icon: "✓",
      title: "Completed a lesson",
      description: "React Props and State",
      time: "2 hours ago",
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
      title: "Completed a quiz",
      description: "JavaScript Fundamentals — 92%",
      time: "2 days ago",
      type: "quiz",
    },
    {
      id: 4,
      icon: "📚",
      title: "Enrolled in a course",
      description: "MongoDB for Beginners",
      time: "4 days ago",
      type: "course",
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

  const filteredCourses = enrolledCourses.filter((course) =>
    `${course.title} ${course.category} ${course.instructor}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="student-dashboard">

      {/* ================================
          MOBILE OVERLAY
      ================================= */}

      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="dashboard-brand">
          <Link
            to="/student/dashboard"
            className="dashboard-logo"
            onClick={closeSidebar}
          >
            <span className="dashboard-logo-icon">L</span>

            <span className="dashboard-logo-text">
              LearnHub
            </span>
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
            <span className="navigation-title">
              MAIN MENU
            </span>

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
            <span className="navigation-title">
              LEARNING
            </span>

            <Link
              to="/activities"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">⚡</span>
              <span>Learning Activity</span>
            </Link>

            <Link
              to="/achievements"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">🏆</span>
              <span>Achievements</span>
            </Link>

            <Link
              to="/wishlist"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">♡</span>
              <span>Wishlist</span>
            </Link>
          </div>

          <div className="navigation-section">
            <span className="navigation-title">
              ACCOUNT
            </span>

            <Link
              to="/profile"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">👤</span>
              <span>My Profile</span>
            </Link>

            <Link
              to="/settings"
              className="dashboard-nav-item"
              onClick={closeSidebar}
            >
              <span className="nav-item-icon">⚙️</span>
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-help-card">
            <div className="help-card-icon">?</div>

            <div>
              <strong>Need help?</strong>

              <p>
                We're here to help.
              </p>

              <Link to="/help">
                Visit Help Center →
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

          <Link
            to="/student/dashboard"
            className="mobile-dashboard-logo"
          >
            <span className="dashboard-logo-icon">
              L
            </span>

            LearnHub
          </Link>

          <div className="dashboard-search">
            <span className="dashboard-search-icon">
              🔍
            </span>

            <input
              type="search"
              placeholder="Search courses, lessons..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />

            <span className="search-shortcut">
              Ctrl K
            </span>
          </div>

          <div className="dashboard-top-actions">
            <button
              type="button"
              className="dashboard-icon-button"
              aria-label="Help"
            >
              ?
            </button>

            <button
              type="button"
              className="dashboard-icon-button notification-button"
              aria-label="Notifications"
            >
              🔔
              <span className="notification-indicator"></span>
            </button>

            <div className="topbar-divider"></div>

            <Link
              to="/profile"
              className="dashboard-user-menu"
            >
              <div className="dashboard-avatar">
                S
              </div>

              <div className="dashboard-user-info">
                <strong>Supriya</strong>
                <span>Student</span>
              </div>

              <span className="user-menu-arrow">
                ▼
              </span>
            </Link>
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
              <span className="welcome-eyebrow">
                STUDENT DASHBOARD
              </span>

              <h1>
                Welcome back, Supriya! 👋
              </h1>

              <p>
                You're doing great! Keep learning and
                reach your goals one lesson at a time.
              </p>

              <div className="welcome-actions">
                <Link
                  to="/courses"
                  className="dashboard-primary-button"
                >
                  Continue Learning
                  <span>→</span>
                </Link>

                <Link
                  to="/discover"
                  className="dashboard-secondary-button"
                >
                  Explore Courses
                </Link>
              </div>
            </div>

            <div className="welcome-visual">
              <div className="welcome-circle circle-one"></div>
              <div className="welcome-circle circle-two"></div>

              <div className="welcome-student">
                🎓
              </div>

              <div className="floating-learning-card">
                <span>🔥</span>

                <div>
                  <strong>7 day streak</strong>
                  <small>Keep it going!</small>
                </div>
              </div>

              <div className="floating-progress-card">
                <div className="mini-progress-ring">
                  68%
                </div>

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
                <div className="dashboard-stat-icon blue">
                  📚
                </div>

                <span className="stat-change positive">
                  +2
                </span>
              </div>

              <span className="stat-label">
                Enrolled Courses
              </span>

              <strong className="stat-number">
                6
              </strong>

              <p>
                <span>↑ 33%</span> from last month
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="dashboard-stat-icon purple">
                  📈
                </div>

                <span className="stat-change positive">
                  +12%
                </span>
              </div>

              <span className="stat-label">
                Average Progress
              </span>

              <strong className="stat-number">
                68%
              </strong>

              <p>
                <span>↑ 12%</span> this month
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="dashboard-stat-icon green">
                  ✓
                </div>

                <span className="stat-change positive">
                  +1
                </span>
              </div>

              <span className="stat-label">
                Completed Courses
              </span>

              <strong className="stat-number">
                3
              </strong>

              <p>
                <span>↑ 50%</span> from last month
              </p>
            </div>

            <div className="dashboard-stat-card">
              <div className="stat-card-top">
                <div className="dashboard-stat-icon orange">
                  ⏱
                </div>

                <span className="stat-change positive">
                  +5h
                </span>
              </div>

              <span className="stat-label">
                Learning Hours
              </span>

              <strong className="stat-number">
                42h
              </strong>

              <p>
                <span>↑ 14%</span> this week
              </p>
            </div>
          </section>

          {/* ================================
              MAIN TWO COLUMN AREA
          ================================= */}

          <div className="dashboard-main-grid">

            {/* CONTINUE LEARNING */}

            <section className="dashboard-card continue-learning-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="card-eyebrow">
                    KEEP LEARNING
                  </span>

                  <h2>Continue Learning</h2>

                  <p>
                    Pick up where you left off.
                  </p>
                </div>

                <Link
                  to="/courses"
                  className="view-all-link"
                >
                  View all →
                </Link>
              </div>

              <div className="course-list">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div
                      className="dashboard-course-item"
                      key={course.id}
                    >
                      <div
                        className={`course-visual ${course.colorClass}`}
                      >
                        <span>{course.icon}</span>

                        <small>
                          {course.duration}
                        </small>
                      </div>

                      <div className="dashboard-course-info">
                        <span className="course-category">
                          {course.category}
                        </span>

                        <h3>{course.title}</h3>

                        <p>
                          <span>{course.instructor}</span>
                          {" · "}
                          Lesson {course.lessonNumber} of{" "}
                          {course.totalLessons}
                        </p>

                        <div className="course-progress-line">
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${course.progress}%`,
                              }}
                            ></div>
                          </div>

                          <strong>
                            {course.progress}%
                          </strong>
                        </div>
                      </div>

                      <Link
                        to={`/courses/${course.id}`}
                        className="course-play-button"
                        aria-label={`Continue ${course.title}`}
                      >
                        ▶
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-empty-state">
                    <span>🔍</span>
                    <strong>No courses found</strong>
                    <p>
                      Try searching for another course.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* UPCOMING QUIZZES */}

            <section className="dashboard-card quizzes-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="card-eyebrow">
                    TEST YOUR KNOWLEDGE
                  </span>

                  <h2>Upcoming Quizzes</h2>

                  <p>
                    Put your knowledge to the test.
                  </p>
                </div>

                <Link
                  to="/quizzes"
                  className="view-all-link"
                >
                  View all →
                </Link>
              </div>

              <div className="quiz-list">
                {upcomingQuizzes.map((quiz) => (
                  <div
                    className="dashboard-quiz-item"
                    key={quiz.id}
                  >
                    <div className="quiz-item-icon">
                      {quiz.icon}
                    </div>

                    <div className="quiz-item-content">
                      <h3>{quiz.title}</h3>

                      <p>
                        {quiz.questions} Questions
                        {" · "}
                        {quiz.duration}
                      </p>
                    </div>

                    <span
                      className={`quiz-date ${quiz.type}`}
                    >
                      {quiz.date}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/quizzes"
                className="full-width-outline-button"
              >
                View All Quizzes
              </Link>
            </section>
          </div>

          {/* ================================
              ACTIVITY + ACHIEVEMENTS
          ================================= */}

          <div className="dashboard-secondary-grid">

            {/* LEARNING ACTIVITY */}

            <section className="dashboard-card activity-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="card-eyebrow">
                    YOUR ACTIVITY
                  </span>

                  <h2>Learning Activity</h2>

                  <p>
                    Your learning time this week.
                  </p>
                </div>

                <select
                  className="activity-filter"
                  defaultValue="week"
                  aria-label="Activity period"
                >
                  <option value="week">
                    This Week
                  </option>

                  <option value="month">
                    This Month
                  </option>
                </select>
              </div>

              <div className="activity-summary">
                <div>
                  <strong>8h 45m</strong>
                  <span>Total learning time</span>
                </div>

                <div>
                  <strong>5</strong>
                  <span>Lessons completed</span>
                </div>

                <div>
                  <strong>92%</strong>
                  <span>Average quiz score</span>
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
                        style={{ height: "42%" }}
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
                  <span className="card-eyebrow">
                    MILESTONES
                  </span>

                  <h2>Achievements</h2>

                  <p>
                    Celebrate your progress.
                  </p>
                </div>

                <Link
                  to="/achievements"
                  className="view-all-link"
                >
                  View all →
                </Link>
              </div>

              <div className="achievement-grid">
                {achievements.map((achievement) => (
                  <div
                    className="achievement-card"
                    key={achievement.title}
                  >
                    <div className="achievement-card-icon">
                      {achievement.icon}
                    </div>

                    <div>
                      <strong>
                        {achievement.title}
                      </strong>

                      <span>
                        {achievement.description}
                      </span>
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
                <span className="card-eyebrow">
                  RECOMMENDED FOR YOU
                </span>

                <h2>Explore New Courses</h2>

                <p>
                  Continue growing with courses selected
                  for your learning journey.
                </p>
              </div>

              <Link
                to="/discover"
                className="view-all-link"
              >
                Explore all →
              </Link>
            </div>

            <div className="recommended-grid">
              {recommendedCourses.map((course) => (
                <article
                  className="recommended-course"
                  key={course.id}
                >
                  <div
                    className={`recommended-course-image ${course.colorClass}`}
                  >
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
                      <span>
                        ({course.students})
                      </span>
                    </div>

                    <h3>{course.title}</h3>

                    <p className="recommended-instructor">
                      By {course.instructor}
                    </p>

                    <div className="recommended-meta">
                      <span>
                        📚 {course.lessons}
                      </span>

                      <span>
                        ⏱ {course.duration}
                      </span>
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
                <span className="card-eyebrow">
                  RECENT ACTIVITY
                </span>

                <h2>What You've Been Up To</h2>

                <p>
                  Your latest learning activities.
                </p>
              </div>

              <Link
                to="/activities"
                className="view-all-link"
              >
                View activity →
              </Link>
            </div>

            <div className="recent-activity-list">
              {recentActivities.map((activity) => (
                <div
                  className="recent-activity-item"
                  key={activity.id}
                >
                  <div
                    className={`activity-item-icon ${activity.type}`}
                  >
                    {activity.icon}
                  </div>

                  <div className="recent-activity-content">
                    <strong>{activity.title}</strong>

                    <span>
                      {activity.description}
                    </span>
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
            <p>
              © 2026 LearnHub. All rights reserved.
            </p>

            <div className="dashboard-footer-links">
              <Link to="/privacy">
                Privacy
              </Link>

              <Link to="/terms">
                Terms
              </Link>

              <Link to="/help">
                Help Center
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
