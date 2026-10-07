
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Progress.css";

interface CourseProgress {
  id: number;
  title: string;
  instructor: string;
  category: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastLesson: string;
  totalTime: string;
  imageClass: string;
  icon: string;
  color: string;
}

interface ActivityDay {
  day: string;
  hours: number;
}

const Progress = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const courseProgress: CourseProgress[] = [
    {
      id: 1,
      title: "React & TypeScript Development",
      instructor: "Alex Johnson",
      category: "Web Development",
      progress: 78,
      completedLessons: 18,
      totalLessons: 24,
      lastLesson: "Advanced React Hooks",
      totalTime: "12h 40m",
      imageClass: "progress-react",
      icon: "⚛️",
      color: "blue",
    },
    {
      id: 2,
      title: "JavaScript Beginner to Advanced",
      instructor: "Sarah Williams",
      category: "Programming",
      progress: 65,
      completedLessons: 26,
      totalLessons: 40,
      lastLesson: "Asynchronous JavaScript",
      totalTime: "10h 15m",
      imageClass: "progress-javascript",
      icon: "JS",
      color: "yellow",
    },
    {
      id: 3,
      title: "Python Programming Masterclass",
      instructor: "Michael Brown",
      category: "Programming",
      progress: 48,
      completedLessons: 19,
      totalLessons: 40,
      lastLesson: "Working with Functions",
      totalTime: "8h 30m",
      imageClass: "progress-python",
      icon: "🐍",
      color: "green",
    },
    {
      id: 4,
      title: "UI/UX Design Fundamentals",
      instructor: "Emily Davis",
      category: "Design",
      progress: 35,
      completedLessons: 7,
      totalLessons: 20,
      lastLesson: "Design Systems",
      totalTime: "5h 20m",
      imageClass: "progress-design",
      icon: "🎨",
      color: "purple",
    },
    {
      id: 5,
      title: "Node.js & Express Backend",
      instructor: "Daniel Wilson",
      category: "Backend Development",
      progress: 22,
      completedLessons: 5,
      totalLessons: 23,
      lastLesson: "Express Middleware",
      totalTime: "3h 45m",
      imageClass: "progress-node",
      icon: "🟢",
      color: "teal",
    },
  ];

  const weeklyActivity: ActivityDay[] = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.8 },
    { day: "Wed", hours: 3.2 },
    { day: "Thu", hours: 2.1 },
    { day: "Fri", hours: 4.0 },
    { day: "Sat", hours: 1.5 },
    { day: "Sun", hours: 2.9 },
  ];

  const totalWeeklyHours = useMemo(
    () =>
      weeklyActivity.reduce((total, activity) => total + activity.hours, 0),
    [weeklyActivity]
  );

  const completedLessons = courseProgress.reduce(
    (total, course) => total + course.completedLessons,
    0
  );

  const totalLessons = courseProgress.reduce(
    (total, course) => total + course.totalLessons,
    0
  );

  const overallProgress = Math.round(
    (courseProgress.reduce((total, course) => total + course.progress, 0) /
      courseProgress.length)
  );

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="progress-page">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="progress-sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`progress-sidebar ${
          sidebarOpen ? "progress-sidebar-open" : ""
        }`}
      >
        <div className="progress-sidebar-logo">
          <div className="progress-logo-icon">L</div>
          <span>LearnHub</span>
        </div>

        <nav className="progress-sidebar-nav">
          <p className="progress-nav-title">MAIN MENU</p>

          <Link to="/student/dashboard" className="progress-nav-item">
            <span>🏠</span>
            Dashboard
          </Link>

          <Link to="/courses" className="progress-nav-item">
            <span>📚</span>
            My Courses
          </Link>

          <Link to="/discover" className="progress-nav-item">
            <span>🔎</span>
            Discover
          </Link>

          <Link to="/quizzes" className="progress-nav-item">
            <span>📝</span>
            Quizzes
          </Link>

          <Link
            to="/progress"
            className="progress-nav-item progress-nav-active"
          >
            <span>📊</span>
            Progress
          </Link>

          <Link to="/activities" className="progress-nav-item">
            <span>⚡</span>
            Activities
          </Link>

          <p className="progress-nav-title progress-nav-title-spaced">
            PERSONAL
          </p>

          <Link to="/achievements" className="progress-nav-item">
            <span>🏆</span>
            Achievements
          </Link>

          <Link to="/wishlist" className="progress-nav-item">
            <span>❤️</span>
            Wishlist
          </Link>

          <Link to="/profile" className="progress-nav-item">
            <span>👤</span>
            Profile
          </Link>

          <Link to="/settings" className="progress-nav-item">
            <span>⚙️</span>
            Settings
          </Link>
        </nav>

        <div className="progress-sidebar-bottom">
          <div className="progress-help-card">
            <div className="progress-help-icon">💡</div>
            <strong>Need Help?</strong>
            <p>We're here to help you learn.</p>
            <Link to="/help">Visit Help Center →</Link>
          </div>

          <Link to="/login" className="progress-logout">
            <span>🚪</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="progress-main">
        {/* Top Bar */}
        <header className="progress-topbar">
          <div className="progress-topbar-left">
            <button
              className="progress-mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div className="progress-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search your learning..."
              />
            </div>
          </div>

          <div className="progress-topbar-right">
            <button className="progress-icon-button" title="Help">
              ?
            </button>

            <button
              className="progress-icon-button progress-notification"
              title="Notifications"
            >
              🔔
              <span></span>
            </button>

            <Link to="/profile" className="progress-user">
              <div className="progress-user-avatar">SE</div>
              <div className="progress-user-info">
                <strong>Supriya Enjam</strong>
                <span>Student</span>
              </div>
              <span className="progress-user-arrow">⌄</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="progress-content">
          {/* Header */}
          <section className="progress-page-header">
            <div>
              <span className="progress-eyebrow">YOUR LEARNING JOURNEY</span>
              <h1>My Progress</h1>
              <p>
                Track your learning activity, course completion, and
                achievements.
              </p>
            </div>

            <Link to="/courses" className="progress-browse-button">
              Browse Courses
              <span>→</span>
            </Link>
          </section>

          {/* Main Stats */}
          <section className="progress-stat-grid">
            <div className="progress-stat-card progress-stat-primary">
              <div className="progress-stat-icon">📈</div>
              <div className="progress-stat-content">
                <span>Overall Progress</span>
                <strong>{overallProgress}%</strong>
                <small>Across your active courses</small>
              </div>
              <div className="progress-stat-circle">
                <svg viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="progress-circle-bg"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="progress-circle-value"
                    strokeDasharray={`${overallProgress * 2.64} 264`}
                  />
                </svg>
                <span>{overallProgress}%</span>
              </div>
            </div>

            <div className="progress-stat-card">
              <div className="progress-stat-icon purple-icon">📚</div>
              <div className="progress-stat-content">
                <span>Lessons Completed</span>
                <strong>{completedLessons}</strong>
                <small>Out of {totalLessons} lessons</small>
              </div>
            </div>

            <div className="progress-stat-card">
              <div className="progress-stat-icon orange-icon">⏱️</div>
              <div className="progress-stat-content">
                <span>Learning Hours</span>
                <strong>42h</strong>
                <small>+8h this month</small>
              </div>
            </div>

            <div className="progress-stat-card">
              <div className="progress-stat-icon green-icon">🔥</div>
              <div className="progress-stat-content">
                <span>Learning Streak</span>
                <strong>12 days</strong>
                <small>Keep it going!</small>
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <div className="progress-main-grid">
            {/* Course Progress */}
            <section className="progress-courses-section">
              <div className="progress-section-header">
                <div>
                  <h2>Course Progress</h2>
                  <p>Continue where you left off.</p>
                </div>

                <Link to="/courses">View All →</Link>
              </div>

              <div className="progress-course-list">
                {courseProgress.map((course) => (
                  <div className="progress-course-card" key={course.id}>
                    <div
                      className={`progress-course-image ${course.imageClass}`}
                    >
                      <span>{course.icon}</span>
                    </div>

                    <div className="progress-course-details">
                      <div className="progress-course-heading">
                        <div>
                          <span className="progress-course-category">
                            {course.category}
                          </span>

                          <h3>{course.title}</h3>

                          <p>
                            By <strong>{course.instructor}</strong>
                          </p>
                        </div>

                        <span className="progress-percentage">
                          {course.progress}%
                        </span>
                      </div>

                      <div className="progress-bar-wrapper">
                        <div className="progress-bar-track">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="progress-course-meta">
                        <span>
                          {course.completedLessons}/{course.totalLessons}{" "}
                          lessons
                        </span>
                        <span>{course.totalTime} learned</span>
                      </div>

                      <div className="progress-course-footer">
                        <span>
                          Last: <strong>{course.lastLesson}</strong>
                        </span>

                        <Link to={`/courses/${course.id}`}>
                          Continue Learning →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Weekly Activity */}
            <aside className="progress-side-column">
              <section className="progress-activity-card">
                <div className="progress-section-header">
                  <div>
                    <h2>Weekly Activity</h2>
                    <p>Your learning time</p>
                  </div>
                </div>

                <div className="progress-week-total">
                  <strong>{totalWeeklyHours.toFixed(1)}h</strong>
                  <span>This week</span>
                </div>

                <div className="progress-chart">
                  {weeklyActivity.map((activity) => (
                    <div className="progress-chart-column" key={activity.day}>
                      <div className="progress-chart-value">
                        {activity.hours}h
                      </div>

                      <div className="progress-chart-bar-area">
                        <div
                          className="progress-chart-bar"
                          style={{
                            height: `${(activity.hours / 4) * 100}%`,
                          }}
                        ></div>
                      </div>

                      <span>{activity.day}</span>
                    </div>
                  ))}
                </div>

                <div className="progress-week-goal">
                  <div>
                    <span>Weekly Goal</span>
                    <strong>20 / 25 hours</strong>
                  </div>

                  <div className="progress-goal-track">
                    <div
                      className="progress-goal-fill"
                      style={{ width: "80%" }}
                    ></div>
                  </div>

                  <small>5 more hours to reach your goal</small>
                </div>
              </section>

              {/* Quick Summary */}
              <section className="progress-summary-card">
                <h2>Learning Summary</h2>

                <div className="progress-summary-row">
                  <div className="progress-summary-icon">🎯</div>
                  <div>
                    <strong>6</strong>
                    <span>Enrolled Courses</span>
                  </div>
                </div>

                <div className="progress-summary-row">
                  <div className="progress-summary-icon">✅</div>
                  <div>
                    <strong>3</strong>
                    <span>Completed Courses</span>
                  </div>
                </div>

                <div className="progress-summary-row">
                  <div className="progress-summary-icon">🏆</div>
                  <div>
                    <strong>8</strong>
                    <span>Achievements Earned</span>
                  </div>
                </div>

                <div className="progress-summary-row">
                  <div className="progress-summary-icon">⭐</div>
                  <div>
                    <strong>4.8</strong>
                    <span>Average Course Rating</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          {/* Bottom Learning Insights */}
          <section className="progress-insights">
            <div className="progress-insight-card">
              <div className="progress-insight-icon">💡</div>
              <div>
                <span>LEARNING TIP</span>
                <h3>Consistency beats intensity.</h3>
                <p>
                  You have been learning for 12 days in a row. Keep your
                  streak alive by spending at least 30 minutes learning today.
                </p>
              </div>
            </div>

            <div className="progress-insight-card">
              <div className="progress-insight-icon">🚀</div>
              <div>
                <span>NEXT MILESTONE</span>
                <h3>Complete React & TypeScript</h3>
                <p>
                  You are only 22% away from completing your React course.
                  Keep going!
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="progress-footer">
          <div>
            <strong>LearnHub</strong>
            <span>Learn. Grow. Succeed.</span>
          </div>

          <div className="progress-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>

          <span>© 2026 LearnHub. All rights reserved.</span>
        </footer>
      </main>
    </div>
  );
};

export default Progress;
