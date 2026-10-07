import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Quizzes.css";

interface Quiz {
  id: string | number;
  title: string;
  course: string;
  courseColor: string;
  questions: number;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  date: string;
  dateLabel: string;
  status: "upcoming" | "completed";
  score?: number;
  icon: string;
}

const defaultQuizzes: Quiz[] = [
  {
    id: 1,
    title: "React Fundamentals Quiz",
    course: "Complete React & TypeScript Development",
    courseColor: "quiz-blue",
    questions: 20,
    duration: "25 min",
    difficulty: "Medium",
    date: "Today",
    dateLabel: "Today, 4:00 PM",
    status: "upcoming",
    icon: "⚛️",
  },
  {
    id: 2,
    title: "JavaScript Basics Assessment",
    course: "JavaScript From Beginner to Advanced",
    courseColor: "quiz-yellow",
    questions: 15,
    duration: "20 min",
    difficulty: "Easy",
    date: "Tomorrow",
    dateLabel: "Tomorrow, 10:00 AM",
    status: "upcoming",
    icon: "JS",
  },
  {
    id: 3,
    title: "TypeScript Advanced Concepts",
    course: "Complete React & TypeScript Development",
    courseColor: "quiz-purple",
    questions: 25,
    duration: "30 min",
    difficulty: "Hard",
    date: "Oct 10",
    dateLabel: "Oct 10, 2:00 PM",
    status: "upcoming",
    icon: "TS",
  },
  {
    id: 4,
    title: "Python Programming Basics",
    course: "Python Programming Masterclass",
    courseColor: "quiz-green",
    questions: 20,
    duration: "25 min",
    difficulty: "Easy",
    date: "Completed",
    dateLabel: "Oct 4, 2026",
    status: "completed",
    score: 92,
    icon: "🐍",
  },
  {
    id: 5,
    title: "HTML & CSS Assessment",
    course: "Modern CSS & Responsive Web Design",
    courseColor: "quiz-orange",
    questions: 18,
    duration: "20 min",
    difficulty: "Medium",
    date: "Completed",
    dateLabel: "Oct 2, 2026",
    status: "completed",
    score: 86,
    icon: "🎯",
  },
  {
    id: 6,
    title: "Web Development Concepts",
    course: "Complete React & TypeScript Development",
    courseColor: "quiz-teal",
    questions: 30,
    duration: "35 min",
    difficulty: "Hard",
    date: "Completed",
    dateLabel: "Sep 28, 2026",
    status: "completed",
    score: 78,
    icon: "💻",
  },
];

function Quizzes() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quizzesList, setQuizzesList] = useState<Quiz[]>(defaultQuizzes);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const res = await api.dashboard.getStudentDashboard();
        if (res.data?.quizAttempts && res.data.quizAttempts.length > 0) {
          const completedFromDb: Quiz[] = res.data.quizAttempts.map(
            (attempt: any, idx: number) => ({
              id: attempt._id,
              title: attempt.quiz?.title || "Course Assessment",
              course: attempt.course?.title || "Complete Course",
              courseColor: idx % 2 === 0 ? "quiz-green" : "quiz-teal",
              questions: attempt.total || 10,
              duration: "20 min",
              difficulty: "Medium",
              date: "Completed",
              dateLabel: new Date(attempt.submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              status: "completed",
              score: attempt.scorePercent,
              icon: idx % 2 === 0 ? "🐍" : "⚛️",
            })
          );
          // Combine with upcoming items
          const upcomingItems = defaultQuizzes.filter((q) => q.status === "upcoming");
          setQuizzesList([...upcomingItems, ...completedFromDb]);
        }
      } catch (err) {
        console.warn("Using preset quizzes list:", err);
      }
    };
    loadQuizData();
  }, []);

  const filteredQuizzes = useMemo(() => {
    return quizzesList.filter((quiz) => {
      const matchesTab = activeTab === "all" || quiz.status === activeTab;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        quiz.title.toLowerCase().includes(query) ||
        quiz.course.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [quizzesList, activeTab, searchQuery]);

  const upcomingQuizzes = quizzesList.filter((quiz) => quiz.status === "upcoming");
  const completedQuizzes = quizzesList.filter((quiz) => quiz.status === "completed");

  const averageScore =
    completedQuizzes.length > 0
      ? Math.round(
          completedQuizzes.reduce((total, quiz) => total + (quiz.score || 0), 0) /
            completedQuizzes.length
        )
      : 85;

  return (
    <div className="quizzes-page">
      {/* Sidebar */}
      <aside className="quizzes-sidebar">
        <Link to="/" className="quizzes-brand">
          <span className="quizzes-brand-icon">L</span>
          <span>LearnHub</span>
        </Link>

        <nav className="quizzes-navigation">
          <div className="quizzes-nav-section">
            <p className="quizzes-nav-title">LEARNING</p>

            <Link to="/student/dashboard" className="quizzes-nav-item">
              <span>▦</span>
              Dashboard
            </Link>

            <Link to="/courses" className="quizzes-nav-item">
              <span>▤</span>
              Courses
            </Link>

            <Link to="/discover" className="quizzes-nav-item">
              <span>✦</span>
              Discover
            </Link>

            <Link to="/quizzes" className="quizzes-nav-item active">
              <span>✓</span>
              Quizzes
            </Link>

            <Link to="/progress" className="quizzes-nav-item">
              <span>◔</span>
              Progress
            </Link>
          </div>

          <div className="quizzes-nav-section">
            <p className="quizzes-nav-title">MY LEARNING</p>

            <Link to="/activities" className="quizzes-nav-item">
              <span>◷</span>
              Activities
            </Link>

            <Link to="/courses" className="quizzes-nav-item">
              <span>🏆</span>
              Achievements
            </Link>

            <Link to="/courses" className="quizzes-nav-item">
              <span>♡</span>
              Wishlist
            </Link>
          </div>

          <div className="quizzes-nav-section">
            <p className="quizzes-nav-title">ACCOUNT</p>

            <Link to="/student/dashboard" className="quizzes-nav-item">
              <span>♙</span>
              Profile
            </Link>

            <Link to="/student/dashboard" className="quizzes-nav-item">
              <span>⚙</span>
              Settings
            </Link>
          </div>
        </nav>

        <div className="quizzes-help-card">
          <div className="quizzes-help-icon">?</div>
          <strong>Need help?</strong>
          <p>We're here to help you learn.</p>
          <Link to="/courses">Visit Help Center →</Link>
        </div>
      </aside>

      {/* Main */}
      <main className="quizzes-main">
        {/* Topbar */}
        <header className="quizzes-topbar">
          <div className="quizzes-breadcrumb">
            <Link to="/student/dashboard">Dashboard</Link>
            <span>/</span>
            <strong>Quizzes</strong>
          </div>

          <div className="quizzes-topbar-actions">
            <button
              className="quizzes-notification-button"
              aria-label="Notifications"
            >
              ♢
              <span className="quizzes-notification-dot"></span>
            </button>

            <Link to="/student/dashboard" className="quizzes-user">
              <span className="quizzes-avatar">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                  : "ST"}
              </span>
              <span className="quizzes-user-name">
                {user?.name || "Student"}
              </span>
              <span className="quizzes-user-arrow">⌄</span>
            </Link>
          </div>
        </header>

        <div className="quizzes-content">
          {/* Page Header */}
          <section className="quizzes-page-header">
            <div>
              <span className="quizzes-eyebrow">TEST YOUR KNOWLEDGE</span>
              <h1>Quizzes & Assessments</h1>
              <p>
                Test what you've learned and track your knowledge progress.
              </p>
            </div>

            <div className="quiz-header-illustration">
              <span>📝</span>
            </div>
          </section>

          {/* Stats */}
          <section className="quiz-stats-grid">
            <div className="quiz-stat-card">
              <div className="quiz-stat-icon blue">✓</div>
              <div>
                <span>Total Quizzes</span>
                <strong>{quizzesList.length}</strong>
              </div>
              <small>Available to you</small>
            </div>

            <div className="quiz-stat-card">
              <div className="quiz-stat-icon orange">◷</div>
              <div>
                <span>Upcoming</span>
                <strong>{upcomingQuizzes.length}</strong>
              </div>
              <small>Need your attention</small>
            </div>

            <div className="quiz-stat-card">
              <div className="quiz-stat-icon green">★</div>
              <div>
                <span>Avg. Score</span>
                <strong>{averageScore}%</strong>
              </div>
              <small>Your performance</small>
            </div>

            <div className="quiz-stat-card">
              <div className="quiz-stat-icon purple">🏆</div>
              <div>
                <span>Highest Score</span>
                <strong>92%</strong>
              </div>
              <small>Your highest result</small>
            </div>
          </section>

          {/* Search + Tabs */}
          <section className="quiz-toolbar">
            <div className="quiz-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="quiz-tabs">
              <button
                className={activeTab === "all" ? "active" : ""}
                onClick={() => setActiveTab("all")}
              >
                All Quizzes
                <span>{quizzesList.length}</span>
              </button>

              <button
                className={activeTab === "upcoming" ? "active" : ""}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming
                <span>{upcomingQuizzes.length}</span>
              </button>

              <button
                className={activeTab === "completed" ? "active" : ""}
                onClick={() => setActiveTab("completed")}
              >
                Completed
                <span>{completedQuizzes.length}</span>
              </button>
            </div>
          </section>

          {/* Quiz List */}
          <section className="quiz-list-section">
            <div className="quiz-list-header">
              <div>
                <h2>
                  {activeTab === "all"
                    ? "All Quizzes"
                    : activeTab === "upcoming"
                    ? "Upcoming Quizzes"
                    : "Completed Quizzes"}
                </h2>
                <p>
                  {filteredQuizzes.length} quiz
                  {filteredQuizzes.length !== 1 ? "zes" : ""} found
                </p>
              </div>
            </div>

            <div className="quiz-list">
              {filteredQuizzes.map((quiz) => (
                <article className="quiz-card" key={quiz.id}>
                  <div className={`quiz-card-icon ${quiz.courseColor}`}>
                    {quiz.icon}
                  </div>

                  <div className="quiz-card-main">
                    <div className="quiz-card-title-row">
                      <div>
                        <span className="quiz-card-course">{quiz.course}</span>
                        <h3>{quiz.title}</h3>
                      </div>

                      {quiz.status === "completed" ? (
                        <span className="quiz-completed-badge">✓ Completed</span>
                      ) : (
                        <span className="quiz-upcoming-badge">Upcoming</span>
                      )}
                    </div>

                    <div className="quiz-card-details">
                      <span>📝 {quiz.questions} Questions</span>
                      <span>◷ {quiz.duration}</span>
                      <span
                        className={`difficulty ${quiz.difficulty.toLowerCase()}`}
                      >
                        ● {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="quiz-card-date">
                    <span>
                      {quiz.status === "completed"
                        ? "Completed on"
                        : "Scheduled for"}
                    </span>
                    <strong>{quiz.dateLabel}</strong>
                  </div>

                  <div className="quiz-card-action">
                    {quiz.status === "completed" ? (
                      <>
                        <div className="quiz-score">
                          <strong>{quiz.score}%</strong>
                          <span>Score</span>
                        </div>

                        <button className="quiz-review-button">Review</button>
                      </>
                    ) : (
                      <Link to="/courses" className="quiz-start-button" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                        Start Quiz
                        <span>→</span>
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {filteredQuizzes.length === 0 && (
              <div className="quiz-empty-state">
                <span>🔎</span>
                <h3>No quizzes found</h3>
                <p>Try searching with a different keyword.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                  }}
                >
                  Show All Quizzes
                </button>
              </div>
            )}
          </section>

          {/* Upcoming Highlight */}
          {activeTab !== "completed" && (
            <section className="next-quiz-section">
              <div className="next-quiz-content">
                <span className="next-quiz-label">NEXT UP</span>
                <h2>React Fundamentals Quiz</h2>
                <p>
                  Make sure you're ready. Review the React fundamentals lessons
                  before taking this assessment.
                </p>

                <div className="next-quiz-info">
                  <span>📝 20 Questions</span>
                  <span>◷ 25 Minutes</span>
                  <span>● Medium</span>
                </div>

                <Link to="/courses" className="next-quiz-button" style={{ display: "inline-block", textDecoration: "none" }}>
                  Start Quiz →
                </Link>
              </div>

              <div className="next-quiz-visual">
                <div className="quiz-countdown-circle">
                  <strong>04</strong>
                  <span>Hours</span>
                </div>

                <div className="countdown-divider">:</div>

                <div className="quiz-countdown-circle">
                  <strong>32</strong>
                  <span>Minutes</span>
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="quizzes-footer">
            <div>
              <strong>LearnHub</strong>
              <p>Learn new skills. Build your future.</p>
            </div>

            <div className="quizzes-footer-links">
              <Link to="/courses">Help Center</Link>
              <Link to="/courses">Privacy</Link>
              <Link to="/courses">Terms</Link>
              <Link to="/courses">Courses</Link>
            </div>

            <p>© 2026 LearnHub. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Quizzes;
