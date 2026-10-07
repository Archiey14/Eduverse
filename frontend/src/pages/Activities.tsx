import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Activities.css";

interface Activity {
  id: string | number;
  type: "lesson" | "quiz" | "course" | "achievement" | "enrollment";
  title: string;
  description: string;
  course?: string;
  time: string;
  date: string;
  icon: string;
}

const defaultActivities: Activity[] = [
  {
    id: 1,
    type: "lesson",
    title: "Completed a lesson",
    description: "Completed Advanced React Hooks",
    course: "React & TypeScript Development",
    time: "10 minutes ago",
    date: "Today",
    icon: "📖",
  },
  {
    id: 2,
    type: "quiz",
    title: "Completed a quiz",
    description: "React Fundamentals Quiz",
    course: "React & TypeScript Development",
    time: "2 hours ago",
    date: "Today",
    icon: "📝",
  },
  {
    id: 3,
    type: "lesson",
    title: "Completed a lesson",
    description: "Completed Asynchronous JavaScript",
    course: "JavaScript Beginner to Advanced",
    time: "Yesterday",
    date: "Yesterday",
    icon: "📖",
  },
  {
    id: 4,
    type: "achievement",
    title: "Earned an achievement",
    description: "7 Day Learning Streak",
    time: "Yesterday",
    date: "Yesterday",
    icon: "🏆",
  },
  {
    id: 5,
    type: "course",
    title: "Completed a course",
    description: "HTML & CSS Fundamentals",
    time: "2 days ago",
    date: "This Week",
    icon: "🎓",
  },
  {
    id: 6,
    type: "quiz",
    title: "Completed a quiz",
    description: "HTML & CSS Assessment",
    course: "HTML & CSS Fundamentals",
    time: "3 days ago",
    date: "This Week",
    icon: "📝",
  },
  {
    id: 7,
    type: "enrollment",
    title: "Enrolled in a course",
    description: "Node.js & Express Backend Development",
    time: "5 days ago",
    date: "This Week",
    icon: "➕",
  },
  {
    id: 8,
    type: "lesson",
    title: "Completed a lesson",
    description: "Completed JavaScript Promises",
    course: "JavaScript Beginner to Advanced",
    time: "6 days ago",
    date: "This Week",
    icon: "📖",
  },
  {
    id: 9,
    type: "achievement",
    title: "Earned an achievement",
    description: "First Course Completed",
    time: "1 week ago",
    date: "Earlier",
    icon: "🏅",
  },
  {
    id: 10,
    type: "course",
    title: "Started learning",
    description: "React & TypeScript Development",
    time: "2 weeks ago",
    date: "Earlier",
    icon: "🚀",
  },
];

const Activities = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activityList, setActivityList] = useState<Activity[]>(defaultActivities);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.dashboard.getStudentDashboard();
        if (res.data?.recentActivities && res.data.recentActivities.length > 0) {
          const mapped: Activity[] = res.data.recentActivities.map(
            (act: any, idx: number) => ({
              id: act._id || idx,
              type:
                act.type === "quiz_attempt"
                  ? "quiz"
                  : act.type === "lesson_complete"
                  ? "lesson"
                  : act.type === "enroll"
                  ? "enrollment"
                  : "course",
              title: act.title || "Recent Learning Activity",
              description: act.description || act.title,
              course: act.course?.title || "Enrolled Course",
              time: "Just now",
              date: "Today",
              icon:
                act.type === "quiz_attempt"
                  ? "📝"
                  : act.type === "lesson_complete"
                  ? "📖"
                  : act.type === "enroll"
                  ? "➕"
                  : "🎓",
            })
          );
          setActivityList([...mapped, ...defaultActivities.slice(mapped.length)]);
        }
      } catch (err) {
        console.warn("Using preset activities:", err);
      }
    };
    fetchActivities();
  }, []);

  const filters = [
    { label: "All", value: "All" },
    { label: "Lessons", value: "lesson" },
    { label: "Quizzes", value: "quiz" },
    { label: "Courses", value: "course" },
    { label: "Achievements", value: "achievement" },
  ];

  const filteredActivities =
    activeFilter === "All"
      ? activityList
      : activityList.filter((activity) => activity.type === activeFilter);

  const stats = [
    {
      label: "Total Activities",
      value: "48",
      change: "+12 this week",
      icon: "⚡",
    },
    {
      label: "Lessons Completed",
      value: "76",
      change: "+8 this week",
      icon: "📖",
    },
    {
      label: "Quizzes Completed",
      value: "18",
      change: "+3 this week",
      icon: "📝",
    },
    {
      label: "Learning Days",
      value: "42",
      change: "12 day streak",
      icon: "🔥",
    },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="activities-page">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="activities-sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`activities-sidebar ${
          sidebarOpen ? "activities-sidebar-open" : ""
        }`}
      >
        <div className="activities-sidebar-logo">
          <div className="activities-logo-icon">L</div>
          <span>LearnHub</span>
        </div>

        <nav className="activities-sidebar-nav">
          <p className="activities-nav-title">MAIN MENU</p>

          <Link to="/student/dashboard" className="activities-nav-item">
            <span>🏠</span>
            Dashboard
          </Link>

          <Link to="/courses" className="activities-nav-item">
            <span>📚</span>
            My Courses
          </Link>

          <Link to="/discover" className="activities-nav-item">
            <span>🔎</span>
            Discover
          </Link>

          <Link to="/quizzes" className="activities-nav-item">
            <span>📝</span>
            Quizzes
          </Link>

          <Link to="/progress" className="activities-nav-item">
            <span>📊</span>
            Progress
          </Link>

          <Link
            to="/activities"
            className="activities-nav-item activities-nav-active"
          >
            <span>⚡</span>
            Activities
          </Link>

          <p className="activities-nav-title activities-nav-title-spaced">
            PERSONAL
          </p>

          <Link to="/courses" className="activities-nav-item">
            <span>🏆</span>
            Achievements
          </Link>

          <Link to="/courses" className="activities-nav-item">
            <span>❤️</span>
            Wishlist
          </Link>

          <Link to="/student/dashboard" className="activities-nav-item">
            <span>👤</span>
            Profile
          </Link>

          <Link to="/student/dashboard" className="activities-nav-item">
            <span>⚙️</span>
            Settings
          </Link>
        </nav>

        <div className="activities-sidebar-bottom">
          <div className="activities-help-card">
            <div className="activities-help-icon">💡</div>
            <strong>Need Help?</strong>
            <p>We're here to help you learn.</p>
            <Link to="/courses">Visit Help Center →</Link>
          </div>

          <button
            onClick={handleLogout}
            className="activities-logout"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="activities-main">
        {/* Topbar */}
        <header className="activities-topbar">
          <div className="activities-topbar-left">
            <button
              className="activities-mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div className="activities-search">
              <span>⌕</span>
              <input type="text" placeholder="Search activities..." />
            </div>
          </div>

          <div className="activities-topbar-right">
            <button className="activities-icon-button" title="Filter">
              ⚙️
            </button>

            <button
              className="activities-icon-button activities-notification-btn"
              title="Notifications"
            >
              🔔
              <span className="activities-notification-badge"></span>
            </button>

            <div className="activities-user">
              <div className="activities-user-avatar">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                  : "ST"}
              </div>
              <div className="activities-user-info">
                <strong>{user?.name || "Student"}</strong>
                <span>Student</span>
              </div>
              <span className="activities-user-arrow">⌄</span>
            </div>
          </div>
        </header>

        <div className="activities-content">
          {/* Header */}
          <section className="activities-page-header">
            <div>
              <span className="activities-eyebrow">LEARNING HISTORY</span>
              <h1>Activity Log</h1>
              <p>
                Track every step of your learning journey and view all past
                achievements.
              </p>
            </div>

            <Link to="/progress" className="activities-progress-button">
              View Progress →
            </Link>
          </section>

          {/* Stats Grid */}
          <section className="activities-stat-grid">
            {stats.map((stat) => (
              <div className="activities-stat-card" key={stat.label}>
                <div className="activities-stat-icon">{stat.icon}</div>
                <div>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <small>{stat.change}</small>
                </div>
              </div>
            ))}
          </section>

          {/* Main Grid */}
          <div className="activities-layout">
            {/* Timeline */}
            <section className="activities-list-section">
              <div className="activities-filters">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    className={
                      activeFilter === filter.value
                        ? "activities-filter-active"
                        : ""
                    }
                    onClick={() => setActiveFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="activities-timeline">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <div
                      className="activities-timeline-item"
                      key={activity.id}
                    >
                      <div
                        className={`activities-timeline-icon activities-type-${activity.type}`}
                      >
                        {activity.icon}
                      </div>

                      <div className="activities-timeline-line"></div>

                      <div className="activities-timeline-content">
                        <div className="activities-item-heading">
                          <div>
                            <span className="activities-item-type">
                              {activity.title}
                            </span>

                            <h3>{activity.description}</h3>

                            {activity.course && (
                              <p className="activities-course-name">
                                📚 {activity.course}
                              </p>
                            )}
                          </div>

                          <span className="activities-item-time">
                            {activity.time}
                          </span>
                        </div>

                        <div className="activities-item-bottom">
                          <span>{activity.date}</span>

                          {activity.type === "lesson" && (
                            <Link to="/courses">View Lesson →</Link>
                          )}

                          {activity.type === "quiz" && (
                            <Link to="/quizzes">View Quiz →</Link>
                          )}

                          {activity.type === "course" && (
                            <Link to="/courses">View Course →</Link>
                          )}

                          {activity.type === "achievement" && (
                            <Link to="/courses">View Achievement →</Link>
                          )}

                          {activity.type === "enrollment" && (
                            <Link to="/courses">Continue Learning →</Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activities-empty">
                    <div>🔍</div>
                    <h3>No activities found</h3>
                    <p>There are no activities in this category yet.</p>
                  </div>
                )}
              </div>

              <button className="activities-load-more">
                Load More Activities
              </button>
            </section>

            {/* Right Column */}
            <aside className="activities-right-column">
              {/* Current Streak */}
              <section className="activities-streak-card">
                <div className="activities-streak-header">
                  <div>
                    <span>YOUR CURRENT STREAK</span>
                    <strong>12 Days</strong>
                  </div>

                  <div className="activities-fire">🔥</div>
                </div>

                <p>
                  Great job! Keep learning every day to maintain your streak.
                </p>

                <div className="activities-streak-days">
                  <span className="streak-completed">M</span>
                  <span className="streak-completed">T</span>
                  <span className="streak-completed">W</span>
                  <span className="streak-completed">T</span>
                  <span className="streak-completed">F</span>
                  <span className="streak-completed">S</span>
                  <span className="streak-today">S</span>
                </div>

                <Link to="/courses">Start Learning →</Link>
              </section>

              {/* Monthly Summary */}
              <section className="activities-summary-card">
                <div className="activities-summary-header">
                  <div>
                    <h2>Monthly Summary</h2>
                    <p>October 2026</p>
                  </div>

                  <span>📅</span>
                </div>

                <div className="activities-summary-stat">
                  <span>Learning Hours</span>
                  <strong>18h 42m</strong>
                  <small>+24% from last month</small>
                </div>

                <div className="activities-summary-progress">
                  <div className="activities-summary-progress-top">
                    <span>Monthly Goal</span>
                    <strong>18.7 / 25h</strong>
                  </div>

                  <div className="activities-summary-track">
                    <div
                      className="activities-summary-fill"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>

                <div className="activities-summary-items">
                  <div>
                    <span>📖</span>
                    <div>
                      <strong>32</strong>
                      <small>Lessons</small>
                    </div>
                  </div>

                  <div>
                    <span>📝</span>
                    <div>
                      <strong>8</strong>
                      <small>Quizzes</small>
                    </div>
                  </div>

                  <div>
                    <span>🏆</span>
                    <div>
                      <strong>3</strong>
                      <small>Achievements</small>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Links */}
              <section className="activities-quick-card">
                <h2>Quick Actions</h2>

                <Link to="/courses">
                  <span>📚</span>
                  Browse Courses
                  <b>→</b>
                </Link>

                <Link to="/quizzes">
                  <span>📝</span>
                  Take a Quiz
                  <b>→</b>
                </Link>

                <Link to="/courses">
                  <span>🏆</span>
                  View Achievements
                  <b>→</b>
                </Link>
              </section>
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="activities-footer">
          <div>
            <strong>LearnHub</strong>
            <span>Learn. Grow. Succeed.</span>
          </div>

          <div className="activities-footer-links">
            <Link to="/courses">Help Center</Link>
            <Link to="/courses">Privacy</Link>
            <Link to="/courses">Terms</Link>
          </div>

          <span>© 2026 LearnHub. All rights reserved.</span>
        </footer>
      </main>
    </div>
  );
};

export default Activities;
