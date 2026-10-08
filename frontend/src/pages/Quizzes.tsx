import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import { Loading, Notice } from "../components/Notice";
import "./Quizzes.css";

type QuizStatus = "upcoming" | "failed" | "passed";
type Tab = "all" | "upcoming" | "completed";

interface Quiz {
  id: string;
  title: string;
  course: string;
  courseId?: string;
  courseColor: string;
  questions: number;
  passPercent: number;
  attempts: number;
  maxAttempts: number | null;
  status: QuizStatus;
  bestScore: number | null;
  lastScore: number | null;
  lastAttemptAt: string | null;
}

const COLORS = ["quiz-blue", "quiz-green", "quiz-purple", "quiz-teal"];

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

function Quizzes() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api.dashboard
      .getStudentQuizzes()
      .then((res) => {
        if (cancelled) return;
        setQuizzes(
          (res.data || []).map((q: any, idx: number) => ({
            id: q._id,
            title: q.title || "Quiz",
            course: q.course?.title || "Course",
            courseId: q.course?._id,
            courseColor: COLORS[idx % COLORS.length],
            questions: q.questionCount || 0,
            passPercent: q.passPercent || 0,
            attempts: q.attempts || 0,
            maxAttempts: q.maxAttempts ?? null,
            status: q.status as QuizStatus,
            bestScore: q.bestScore,
            lastScore: q.lastScore,
            lastAttemptAt: q.lastAttemptAt,
          }))
        );
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load your quizzes."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // "Upcoming" = still to do (never attempted, or attempted but not passed yet)
  const todoQuizzes = quizzes.filter((q) => q.status !== "passed");
  const completedQuizzes = quizzes.filter((q) => q.status === "passed");
  const attemptedQuizzes = quizzes.filter((q) => q.bestScore !== null);

  const averageScore =
    attemptedQuizzes.length > 0
      ? Math.round(
          attemptedQuizzes.reduce((t, q) => t + (q.bestScore || 0), 0) /
            attemptedQuizzes.length
        )
      : 0;

  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return quizzes.filter((quiz) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "upcoming" && quiz.status !== "passed") ||
        (activeTab === "completed" && quiz.status === "passed");

      const matchesSearch =
        !query ||
        quiz.title.toLowerCase().includes(query) ||
        quiz.course.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [quizzes, activeTab, searchQuery]);

  const heading =
    activeTab === "all"
      ? "All Quizzes"
      : activeTab === "upcoming"
      ? "Upcoming Quizzes"
      : "Completed Quizzes";

  return (
    <StudentLayout
      activeItem="quizzes"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search quizzes or courses..."
    >
      <div className="quizzes-content" style={{ padding: "0" }}>
        <section className="quizzes-page-header">
          <div>
            <span className="quizzes-eyebrow">TEST YOUR KNOWLEDGE</span>
            <h1>Quizzes & Assessments</h1>
            <p>Test what you've learned and track your knowledge progress.</p>
          </div>

          <div className="quiz-header-illustration">
            <span>📝</span>
          </div>
        </section>

        {error && <Notice message={error} />}

        {loading ? (
          <Loading label="Loading your quizzes..." />
        ) : (
          <>
            <section className="quiz-stats-grid">
              <div className="quiz-stat-card">
                <div className="quiz-stat-icon blue">✓</div>
                <div>
                  <span>Total Quizzes</span>
                  <strong>{quizzes.length}</strong>
                </div>
                <small>In your enrolled courses</small>
              </div>

              <div className="quiz-stat-card">
                <div className="quiz-stat-icon green">★</div>
                <div>
                  <span>Avg. Best Score</span>
                  <strong>{attemptedQuizzes.length > 0 ? `${averageScore}%` : "—"}</strong>
                </div>
                <small>
                  {attemptedQuizzes.length > 0
                    ? `Across ${attemptedQuizzes.length} attempted quiz${
                        attemptedQuizzes.length === 1 ? "" : "zes"
                      }`
                    : "No attempts yet"}
                </small>
              </div>
            </section>

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
                  type="button"
                  className={activeTab === "all" ? "active" : ""}
                  onClick={() => setActiveTab("all")}
                >
                  All Quizzes
                  <span>{quizzes.length}</span>
                </button>

                <button
                  type="button"
                  className={activeTab === "upcoming" ? "active" : ""}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming
                  <span>{todoQuizzes.length}</span>
                </button>

                <button
                  type="button"
                  className={activeTab === "completed" ? "active" : ""}
                  onClick={() => setActiveTab("completed")}
                >
                  Completed
                  <span>{completedQuizzes.length}</span>
                </button>
              </div>
            </section>

            <section className="quiz-list-section">
              <div className="quiz-list-header">
                <div>
                  <h2>{heading}</h2>
                  <p>
                    {filteredQuizzes.length} quiz
                    {filteredQuizzes.length !== 1 ? "zes" : ""} found
                  </p>
                </div>
              </div>

              <div className="quiz-list">
                {filteredQuizzes.map((quiz) => {
                  const outOfAttempts =
                    quiz.maxAttempts !== null && quiz.attempts >= quiz.maxAttempts;
                  const courseLink = quiz.courseId ? `/learn/${quiz.courseId}` : "/student/courses";

                  return (
                    <article className="quiz-card" key={quiz.id}>
                      <div className={`quiz-card-icon ${quiz.courseColor}`}>
                        {quiz.status === "passed" ? "✅" : quiz.status === "failed" ? "🔁" : "📝"}
                      </div>

                      <div className="quiz-card-main">
                        <div className="quiz-card-title-row">
                          <div>
                            <span className="quiz-card-course">{quiz.course}</span>
                            <h3>{quiz.title}</h3>
                          </div>

                          {quiz.status === "passed" ? (
                            <span className="quiz-completed-badge">✓ Passed</span>
                          ) : quiz.status === "failed" ? (
                            <span className="quiz-upcoming-badge">Not passed yet</span>
                          ) : (
                            <span className="quiz-upcoming-badge">Upcoming</span>
                          )}
                        </div>

                        <div className="quiz-card-details">
                          <span>📝 {quiz.questions} Questions</span>
                          <span>🎯 Pass mark {quiz.passPercent}%</span>
                          <span>
                            🔁 {quiz.attempts} attempt{quiz.attempts === 1 ? "" : "s"}
                            {quiz.maxAttempts !== null ? ` of ${quiz.maxAttempts}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="quiz-card-date">
                        <span>{quiz.attempts > 0 ? "Last attempt" : "Status"}</span>
                        <strong>
                          {quiz.attempts > 0 ? formatDate(quiz.lastAttemptAt) : "Not attempted yet"}
                        </strong>
                      </div>

                      <div className="quiz-card-action">
                        {quiz.status === "passed" ? (
                          <>
                            <div className="quiz-score">
                              <strong>{quiz.bestScore ?? 0}%</strong>
                              <span>Best score</span>
                            </div>
                            <Link
                              to={courseLink}
                              className="quiz-review-button"
                              style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
                            >
                              Review
                            </Link>
                          </>
                        ) : quiz.status === "failed" ? (
                          <>
                            <div className="quiz-score">
                              <strong>{quiz.bestScore ?? 0}%</strong>
                              <span>Best score</span>
                            </div>
                            <Link
                              to={courseLink}
                              className="quiz-start-button"
                              style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
                            >
                              {outOfAttempts ? "Review" : "Retry"}
                              <span>→</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to={courseLink}
                            className="quiz-start-button"
                            style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
                          >
                            Start Quiz
                            <span>→</span>
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredQuizzes.length === 0 && (
                <div className="quiz-empty-state">
                  <span>{quizzes.length === 0 ? "📝" : "🔎"}</span>

                  <h3>{quizzes.length === 0 ? "No quizzes yet" : "No quizzes found"}</h3>

                  <p>
                    {quizzes.length === 0
                      ? "Quizzes from the courses you enroll in will appear here."
                      : "Try a different keyword or tab."}
                  </p>

                  {quizzes.length === 0 ? (
                    <Link to="/courses" className="quiz-start-button" style={{ textDecoration: "none" }}>
                      Browse Courses
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveTab("all");
                      }}
                    >
                      Show All Quizzes
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="quizzes-footer">
          <div>
            <strong>Eduverse</strong>
            <p>Learn new skills. Build your future.</p>
          </div>

          <div className="quizzes-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/courses">Courses</Link>
          </div>

          <p>© 2026 Eduverse. All rights reserved.</p>
        </footer>
      </div>
    </StudentLayout>
  );
}

export default Quizzes;
