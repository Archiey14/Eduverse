
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import "./Quizzes.css";

interface Quiz {
  id: string | number;
  title: string;
  course: string;
  courseId?: string;
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

function Quizzes() {
  const [activeTab, setActiveTab] = useState<
    "all" | "upcoming" | "completed"
  >("all");

  const [searchQuery, setSearchQuery] = useState("");

  const [quizzesList, setQuizzesList] = useState<Quiz[]>([]);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const res = await api.dashboard.getStudentDashboard();
        const loaded: Quiz[] = [];

        if (
          res.data?.recentQuizAttempts &&
          res.data.recentQuizAttempts.length > 0
        ) {
          res.data.recentQuizAttempts.forEach((attempt: any, idx: number) => {
            loaded.push({
              id: attempt._id,
              title: attempt.quiz?.title || "Course Assessment",
              course: attempt.course?.title || "Complete Course",
              courseId: attempt.course?._id,
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
              score: attempt.scorePercent || 0,
              icon: idx % 2 === 0 ? "🐍" : "⚛️",
            });
          });
        }

        if (res.data?.activeEnrollments && res.data.activeEnrollments.length > 0) {
          for (const enr of res.data.activeEnrollments.slice(0, 3)) {
            const cId = enr.course?._id;
            if (!cId) continue;
            try {
              const cView = await api.learn.getCourseView(cId);
              if (cView.data?.quizzes && cView.data.quizzes.length > 0) {
                cView.data.quizzes.forEach((q: any, qIdx: number) => {
                  const alreadyExists = loaded.some(
                    (item) => item.title === q.title && item.course === (enr.course?.title || "")
                  );
                  if (!alreadyExists) {
                    loaded.push({
                      id: q._id,
                      title: q.title || "Knowledge Check",
                      course: enr.course?.title || "Enrolled Course",
                      courseId: cId,
                      courseColor: qIdx % 2 === 0 ? "quiz-blue" : "quiz-purple",
                      questions: q.questions?.length || 5,
                      duration: "15 min",
                      difficulty: "Medium",
                      date: "Upcoming",
                      dateLabel: q.isPassed ? "Completed" : "Available Now",
                      status: q.isPassed ? "completed" : "upcoming",
                      score: q.isPassed ? 100 : undefined,
                      icon: "📝",
                    });
                  }
                });
              }
            } catch {
              // Ignore individual learning view fetch errors
            }
          }
        }

        if (loaded.length === 0) {
          // Provide interactive default assessment cards
          loaded.push(
            {
              id: "def-1",
              title: "React & TypeScript Foundations",
              course: "Web Development",
              courseColor: "quiz-blue",
              questions: 10,
              duration: "15 min",
              difficulty: "Medium",
              date: "Upcoming",
              dateLabel: "Available Now",
              status: "upcoming",
              icon: "⚛️",
            },
            {
              id: "def-2",
              title: "JavaScript ES6+ Knowledge Assessment",
              course: "Programming",
              courseColor: "quiz-teal",
              questions: 8,
              duration: "12 min",
              difficulty: "Easy",
              date: "Upcoming",
              dateLabel: "Available Now",
              status: "upcoming",
              icon: "🟨",
            }
          );
        }

        setQuizzesList(loaded);
      } catch (err) {
        console.warn("Failed to load quizzes:", err);
        setQuizzesList([]);
      }
    };

    loadQuizData();
  }, []);

  const filteredQuizzes = useMemo(() => {
    return quizzesList.filter((quiz) => {
      const matchesTab =
        activeTab === "all" ||
        quiz.status === activeTab;

      const query =
        searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        quiz.title
          .toLowerCase()
          .includes(query) ||
        quiz.course
          .toLowerCase()
          .includes(query);

      return matchesTab && matchesSearch;
    });
  }, [quizzesList, activeTab, searchQuery]);

  const completedQuizzes = quizzesList.filter(
    (quiz) => quiz.status === "completed"
  );

  const averageScore =
    completedQuizzes.length > 0
      ? Math.round(
          completedQuizzes.reduce(
            (total, quiz) =>
              total + (quiz.score || 0),
            0
          ) / completedQuizzes.length
        )
      : 0;

  return (
    <StudentLayout
      activeItem="quizzes"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search quizzes or courses..."
    >
      <div
        className="quizzes-content"
        style={{ padding: "0" }}
      >
        {/* Page Header */}
        <section className="quizzes-page-header">
          <div>
            <span className="quizzes-eyebrow">
              TEST YOUR KNOWLEDGE
            </span>

            <h1>Quizzes & Assessments</h1>

            <p>
              Test what you've learned and track
              your knowledge progress.
            </p>
          </div>

          <div className="quiz-header-illustration">
            <span>📝</span>
          </div>
        </section>

        {/* Stats */}
        <section className="quiz-stats-grid">
          <div className="quiz-stat-card">
            <div className="quiz-stat-icon blue">
              ✓
            </div>

            <div>
              <span>Total Quizzes</span>

              <strong>
                {quizzesList.length}
              </strong>
            </div>

            <small>Available to you</small>
          </div>

          <div className="quiz-stat-card">
            <div className="quiz-stat-icon green">
              ★
            </div>

            <div>
              <span>Avg. Score</span>

              <strong>
                {averageScore}%
              </strong>
            </div>

            <small>Your performance</small>
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
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />
          </div>

          <div className="quiz-tabs">
            <button
              className={
                activeTab === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("all")
              }
            >
              All Quizzes

              <span>
                {quizzesList.length}
              </span>
            </button>

            <button
              className={
                activeTab === "completed"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("completed")
              }
            >
              Completed

              <span>
                {completedQuizzes.length}
              </span>
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
                {filteredQuizzes.length !== 1
                  ? "zes"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          <div className="quiz-list">
            {filteredQuizzes.map((quiz) => (
              <article
                className="quiz-card"
                key={quiz.id}
              >
                <div
                  className={`quiz-card-icon ${quiz.courseColor}`}
                >
                  {quiz.icon}
                </div>

                <div className="quiz-card-main">
                  <div className="quiz-card-title-row">
                    <div>
                      <span className="quiz-card-course">
                        {quiz.course}
                      </span>

                      <h3>{quiz.title}</h3>
                    </div>

                    {quiz.status ===
                    "completed" ? (
                      <span className="quiz-completed-badge">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="quiz-upcoming-badge">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <div className="quiz-card-details">
                    <span>
                      📝 {quiz.questions} Questions
                    </span>

                    <span>
                      ◷ {quiz.duration}
                    </span>

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

                  <strong>
                    {quiz.dateLabel}
                  </strong>
                </div>

                  <div className="quiz-card-action">
                    {quiz.status === "completed" ? (
                      <>
                        <div className="quiz-score">
                          <strong>{quiz.score || 0}%</strong>
                          <span>Score</span>
                        </div>
                        {quiz.courseId ? (
                          <Link
                            to={`/learn/${quiz.courseId}`}
                            className="quiz-review-button"
                            style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
                          >
                            Review
                          </Link>
                        ) : (
                          <button className="quiz-review-button">Review</button>
                        )}
                      </>
                    ) : (
                      <Link
                        to={quiz.courseId ? `/learn/${quiz.courseId}` : "/courses"}
                        className="quiz-start-button"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          textDecoration: "none",
                        }}
                      >
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

              <p>
                Try searching with a different
                keyword.
              </p>

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

        {/* Footer */}
        <footer className="quizzes-footer">
          <div>
            <strong>LearnHub</strong>

            <p>
              Learn new skills. Build your
              future.
            </p>
          </div>

          <div className="quizzes-footer-links">
            <Link to="/courses">
              Help Center
            </Link>

            <Link to="/courses">
              Privacy
            </Link>

            <Link to="/courses">
              Terms
            </Link>

            <Link to="/courses">
              Courses
            </Link>
          </div>

          <p>
            © 2026 LearnHub. All rights reserved.
          </p>
        </footer>
      </div>
    </StudentLayout>
  );
}

export default Quizzes;
