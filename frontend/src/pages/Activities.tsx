import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import StudentLayout from "../components/StudentLayout";
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
  const [activeFilter, setActiveFilter] = useState("All");
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [stats, setStats] = useState([
    { label: "Total Activities", value: "0", change: "", icon: "⚡" },
    { label: "Lessons Completed", value: "0", change: "", icon: "📖" },
    { label: "Quizzes Completed", value: "0", change: "", icon: "📝" },
    { label: "Learning Days", value: "0", change: "", icon: "🔥" },
  ]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.activity.getMyActivities();
        if (res.data && res.data.length > 0) {
          const mapped: Activity[] = res.data.map(
            (act: any, idx: number) => ({
              id: act._id || idx,
              type:
                act.type === "quiz_attempt" ? "quiz"
                  : act.type === "lesson_complete" ? "lesson"
                  : act.type === "enroll" ? "enrollment"
                  : "course",
              title: act.title || "Recent Learning Activity",
              description: act.description || act.title,
              course: act.course?.title || "Enrolled Course",
              time: new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(act.createdAt).toLocaleDateString(),
              icon:
                act.type === "quiz_attempt" ? "📝"
                  : act.type === "lesson_complete" ? "📖"
                  : act.type === "enroll" ? "➕"
                  : "🎓",
            })
          );
          setActivityList(mapped);

          const lessons = mapped.filter((a) => a.type === "lesson").length;
          const quizzes = mapped.filter((a) => a.type === "quiz").length;
          const days = new Set(mapped.map((a) => a.date)).size;

          setStats([
            { label: "Total Activities", value: mapped.length.toString(), change: "Dynamic", icon: "⚡" },
            { label: "Lessons Completed", value: lessons.toString(), change: "Dynamic", icon: "📖" },
            { label: "Quizzes Completed", value: quizzes.toString(), change: "Dynamic", icon: "📝" },
            { label: "Learning Days", value: days.toString(), change: "Dynamic", icon: "🔥" },
          ]);
        } else {
          setActivityList([]);
        }
      } catch (err) {
        console.error("Failed to fetch activities:", err);
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

  return (
    <StudentLayout
      activeItem="activities"
      searchPlaceholder="Search your learning activity..."
    >
      <div className="activities-content" style={{ padding: "0" }}>
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
    </StudentLayout>
  );
};

export default Activities;
