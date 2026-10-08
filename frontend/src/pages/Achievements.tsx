
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Achievements.css";

interface Achievement {
  id: number;
  title: string;
  description: string;
  category: "Courses" | "Quizzes" | "Streaks" | "Learning" | "Milestones";
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  target?: number;
  color: string;
}

const achievements: Achievement[] = [
  {
    id: 1,
    title: "First Step",
    description: "Enroll in your first course",
    category: "Milestones",
    icon: "🚀",
    earned: true,
    earnedDate: "Sep 12, 2026",
    color: "#6366f1",
  },
  {
    id: 2,
    title: "Course Starter",
    description: "Complete your first course",
    category: "Courses",
    icon: "🎓",
    earned: true,
    earnedDate: "Sep 18, 2026",
    color: "#10b981",
  },
  {
    id: 3,
    title: "Quiz Master",
    description: "Score 90% or higher on a quiz",
    category: "Quizzes",
    icon: "🏆",
    earned: true,
    earnedDate: "Sep 22, 2026",
    color: "#f59e0b",
  },
  {
    id: 4,
    title: "7 Day Streak",
    description: "Learn for 7 consecutive days",
    category: "Streaks",
    icon: "🔥",
    earned: true,
    earnedDate: "Sep 25, 2026",
    color: "#ef4444",
  },
  {
    id: 5,
    title: "Knowledge Seeker",
    description: "Complete 25 lessons",
    category: "Learning",
    icon: "📚",
    earned: true,
    earnedDate: "Sep 28, 2026",
    color: "#8b5cf6",
  },
  {
    id: 6,
    title: "Perfect Score",
    description: "Get 100% on a quiz",
    category: "Quizzes",
    icon: "💯",
    earned: false,
    progress: 92,
    target: 100,
    color: "#ec4899",
  },
  {
    id: 7,
    title: "Course Collector",
    description: "Complete 5 courses",
    category: "Courses",
    icon: "📖",
    earned: false,
    progress: 3,
    target: 5,
    color: "#0ea5e9",
  },
  {
    id: 8,
    title: "14 Day Streak",
    description: "Learn for 14 consecutive days",
    category: "Streaks",
    icon: "⚡",
    earned: false,
    progress: 9,
    target: 14,
    color: "#f97316",
  },
  {
    id: 9,
    title: "Learning Champion",
    description: "Complete 50 lessons",
    category: "Learning",
    icon: "🌟",
    earned: false,
    progress: 32,
    target: 50,
    color: "#14b8a6",
  },
  {
    id: 10,
    title: "Dedicated Learner",
    description: "Spend 100 hours learning",
    category: "Milestones",
    icon: "⏱️",
    earned: false,
    progress: 42,
    target: 100,
    color: "#64748b",
  },
];

const categories = [
  "All",
  "Courses",
  "Quizzes",
  "Streaks",
  "Learning",
  "Milestones",
];

function Achievements() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);
  const displayName = user?.name || "Student";
  const firstName = displayName.split(" ")[0] || "Student";
  const initials = displayName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const earnedCount = achievements.filter(
    (achievement) => achievement.earned
  ).length;

  const totalCount = achievements.length;

  const completionPercentage = Math.round(
    (earnedCount / totalCount) * 100
  );

  const filteredAchievements = useMemo(() => {
    return achievements.filter((achievement) => {
      const matchesCategory =
        activeCategory === "All" ||
        achievement.category === activeCategory;

      const matchesEarned =
        !showEarnedOnly || achievement.earned;

      return matchesCategory && matchesEarned;
    });
  }, [activeCategory, showEarnedOnly]);

  return (
    <div className="achievements-page">
      {/* Sidebar */}
      <aside className="achievements-sidebar">
        <div className="achievements-brand">
          <div className="achievements-brand-icon">L</div>
          <div>
            <h2>LearnHub</h2>
            <span>Learning Platform</span>
          </div>
        </div>

        <nav className="achievements-nav">
          <p className="achievements-nav-label">MAIN MENU</p>

          <Link to="/student/dashboard" className="achievements-nav-item">
            <span>▦</span>
            Dashboard
          </Link>

          <Link to="/courses" className="achievements-nav-item">
            <span>📚</span>
            My Courses
          </Link>

          <Link to="/discover" className="achievements-nav-item">
            <span>🔎</span>
            Discover
          </Link>

          <Link to="/quizzes" className="achievements-nav-item">
            <span>📝</span>
            Quizzes
          </Link>

          <Link to="/progress" className="achievements-nav-item">
            <span>📈</span>
            Progress
          </Link>

          <Link to="/activities" className="achievements-nav-item">
            <span>🕘</span>
            Activities
          </Link>

          <Link
            to="/achievements"
            className="achievements-nav-item active"
          >
            <span>🏆</span>
            Achievements
          </Link>

          <Link to="/wishlist" className="achievements-nav-item">
            <span>❤️</span>
            Wishlist
          </Link>

          <p className="achievements-nav-label second-label">
            ACCOUNT
          </p>

          <Link to="/profile" className="achievements-nav-item">
            <span>👤</span>
            Profile
          </Link>

          <Link to="/settings" className="achievements-nav-item">
            <span>⚙️</span>
            Settings
          </Link>
        </nav>

        <div className="achievements-help-card">
          <div className="help-icon">💡</div>
          <h4>Need some help?</h4>
          <p>We're here to help you with your learning journey.</p>
          <Link to="/help">Visit Help Center →</Link>
        </div>

        <Link to="/login" className="achievements-logout">
          <span>↪</span>
          Logout
        </Link>
      </aside>

      {/* Main */}
      <main className="achievements-main">
        <header className="achievements-topbar">
          <div className="achievements-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search achievements..."
            />
          </div>

          <div className="achievements-topbar-actions">
            <button className="topbar-icon-button" type="button">
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="topbar-user">
              <div className="topbar-avatar">{initials || "S"}</div>
              <div>
                <strong>{firstName}</strong>
                <span>Student</span>
              </div>
            </div>
          </div>
        </header>

        <div className="achievements-content">
          {/* Header */}
          <section className="achievements-header">
            <div>
              <span className="section-eyebrow">YOUR MILESTONES</span>
              <h1>Achievements 🏆</h1>
              <p>
                Celebrate your progress and keep reaching new
                learning milestones.
              </p>
            </div>

            <div className="achievement-completion">
              <div
                className="completion-circle"
                style={
                  {
                    "--completion": `${completionPercentage * 3.6}deg`,
                  } as React.CSSProperties
                }
              >
                <div className="completion-inner">
                  <strong>{completionPercentage}%</strong>
                  <span>Complete</span>
                </div>
              </div>

              <div>
                <strong>
                  {earnedCount} of {totalCount}
                </strong>
                <span>Achievements earned</span>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="achievement-stats">
            <div className="achievement-stat-card">
              <div className="stat-icon earned">🏆</div>
              <div>
                <span>Earned</span>
                <strong>{earnedCount}</strong>
              </div>
            </div>

            <div className="achievement-stat-card">
              <div className="stat-icon locked">🔒</div>
              <div>
                <span>Locked</span>
                <strong>{totalCount - earnedCount}</strong>
              </div>
            </div>

            <div className="achievement-stat-card">
              <div className="stat-icon streak">🔥</div>
              <div>
                <span>Current Streak</span>
                <strong>9 days</strong>
              </div>
            </div>

            <div className="achievement-stat-card">
              <div className="stat-icon points">⭐</div>
              <div>
                <span>Total Points</span>
                <strong>1,240</strong>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="achievements-toolbar">
            <div className="achievement-tabs">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    activeCategory === category
                      ? "active"
                      : ""
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="earned-toggle">
              <input
                type="checkbox"
                checked={showEarnedOnly}
                onChange={(event) =>
                  setShowEarnedOnly(event.target.checked)
                }
              />
              <span className="toggle-check"></span>
              Show earned only
            </label>
          </section>

          {/* Achievement Grid */}
          <section className="achievement-section">
            <div className="achievement-section-heading">
              <div>
                <h2>Your Achievements</h2>
                <p>
                  {filteredAchievements.length} achievements
                  displayed
                </p>
              </div>
            </div>

            <div className="achievement-grid">
              {filteredAchievements.map((achievement) => {
                const progressPercentage =
                  achievement.progress && achievement.target
                    ? Math.min(
                        (achievement.progress /
                          achievement.target) *
                          100,
                        100
                      )
                    : 0;

                return (
                  <article
                    key={achievement.id}
                    className={`achievement-card ${
                      achievement.earned ? "earned-card" : "locked-card"
                    }`}
                  >
                    <div
                      className="achievement-icon"
                      style={{
                        background: `${achievement.color}18`,
                        borderColor: `${achievement.color}35`,
                      }}
                    >
                      {achievement.icon}
                    </div>

                    {!achievement.earned && (
                      <div className="locked-badge">🔒 Locked</div>
                    )}

                    {achievement.earned && (
                      <div className="earned-badge">✓ Earned</div>
                    )}

                    <div className="achievement-card-content">
                      <span className="achievement-category">
                        {achievement.category}
                      </span>

                      <h3>{achievement.title}</h3>

                      <p>{achievement.description}</p>

                      {achievement.earned ? (
                        <div className="achievement-earned-date">
                          <span>✓</span>
                          Earned {achievement.earnedDate}
                        </div>
                      ) : (
                        <div className="achievement-progress">
                          <div className="progress-info">
                            <span>Progress</span>
                            <strong>
                              {achievement.progress} /{" "}
                              {achievement.target}
                            </strong>
                          </div>

                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${progressPercentage}%`,
                                background: achievement.color,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="achievement-empty">
                <div>🏆</div>
                <h3>No achievements found</h3>
                <p>
                  Try changing the category or turning off the
                  earned-only filter.
                </p>
              </div>
            )}
          </section>

          {/* Motivation */}
          <section className="achievement-motivation">
            <div className="motivation-icon">🚀</div>
            <div className="motivation-content">
              <span>KEEP GOING!</span>
              <h2>You're doing great, {firstName}!</h2>
              <p>
                You're only 2 courses away from unlocking your
                Course Collector achievement.
              </p>
            </div>
            <Link to="/courses" className="motivation-button">
              Continue Learning →
            </Link>
          </section>
        </div>

        <footer className="achievements-footer">
          <div>
            <strong>LearnHub</strong>
            <span>Learn. Grow. Achieve.</span>
          </div>

          <p>© 2026 LearnHub. All rights reserved.</p>

          <div className="footer-links">
            <Link to="/help">Help</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Achievements;
