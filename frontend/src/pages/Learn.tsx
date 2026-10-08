import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import { EmptyState, Loading, Notice } from "../components/Notice";
import { getYouTubeEmbedUrl } from "../utils/format";
import "./Learn.css";

type Selection = { type: "lesson" | "quiz"; id: string } | null;

function QuizRunner({
  quizId,
  onFinished,
}: {
  quizId: string;
  onFinished: () => void;
}) {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});
    try {
      const res = await api.learn.getQuiz(quizId);
      setQuiz(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load this quiz."));
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!quiz) return;
    const unanswered = quiz.questions.filter((q: any) => answers[q._id] === undefined);
    if (unanswered.length > 0) {
      setError(`Please answer all questions (${unanswered.length} left).`);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = quiz.questions.map((q: any) => ({
        questionId: q._id,
        selectedIndex: answers[q._id],
      }));
      const res = await api.learn.submitQuiz(quizId, payload);
      setResult(res.data);
      onFinished();
    } catch (err) {
      setError(getErrorMessage(err, "Could not submit the quiz."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading label="Loading quiz..." />;
  if (!quiz) return <Notice message={error || "Quiz not available."} onRetry={load} />;

  if (result) {
    const canRetry = result.attemptsLeft === null || result.attemptsLeft > 0;
    return (
      <div className="learn-quiz">
        <div className={`learn-result ${result.passed ? "passed" : "failed"}`}>
          <strong>{result.scorePercent}%</strong>
          <span>
            {result.passed ? "Passed" : "Not passed"} · {result.correctCount}/
            {result.total} correct · pass mark {result.passPercent}%
          </span>
        </div>

        {result.questions.map((q: any, idx: number) => (
          <div className="learn-question" key={q.questionId}>
            <h4>
              {idx + 1}. {q.text}
            </h4>
            {q.options.map((opt: string, oi: number) => {
              const isUser = q.userSelectedIndex === oi;
              const isCorrect = q.correctIndex === oi;
              return (
                <div
                  key={oi}
                  className={`learn-option static ${
                    isCorrect ? "correct" : isUser ? "wrong" : ""
                  }`}
                >
                  {opt}
                  {isUser && " (your answer)"}
                </div>
              );
            })}
            {q.explanation && <p className="learn-explain">💡 {q.explanation}</p>}
          </div>
        ))}

        <div className="learn-actions">
          {canRetry && !result.passed && (
            <button type="button" className="ev-btn" onClick={load}>
              Try again
              {result.attemptsLeft !== null && ` (${result.attemptsLeft} left)`}
            </button>
          )}
        </div>
      </div>
    );
  }

  const outOfAttempts = quiz.attemptsLeft !== null && quiz.attemptsLeft <= 0;

  return (
    <div className="learn-quiz">
      <p className="learn-muted">
        {quiz.instructions || "Answer all questions and submit."} Pass mark:{" "}
        {quiz.passPercent}%.
        {quiz.attemptsLeft !== null && ` Attempts left: ${quiz.attemptsLeft}.`}
      </p>

      {outOfAttempts && (
        <Notice message="You have used all attempts for this quiz." />
      )}
      {error && <Notice message={error} />}

      {quiz.questions.map((q: any, idx: number) => (
        <div className="learn-question" key={q._id}>
          <h4>
            {idx + 1}. {q.text}
          </h4>
          {q.options.map((opt: string, oi: number) => (
            <label
              key={oi}
              className={`learn-option ${answers[q._id] === oi ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={q._id}
                checked={answers[q._id] === oi}
                onChange={() => setAnswers((a) => ({ ...a, [q._id]: oi }))}
                disabled={outOfAttempts}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      <div className="learn-actions">
        <button
          type="button"
          className="ev-btn"
          onClick={submit}
          disabled={submitting || outOfAttempts}
        >
          {submitting ? "Submitting..." : "Submit quiz"}
        </button>
      </div>
    </div>
  );
}

function Learn() {
  const params = useParams<{ courseId?: string; id?: string }>();
  const courseId = params.courseId || params.id;
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [selected, setSelected] = useState<Selection>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(
    async (keepSelection = false) => {
      if (!courseId) return;
      if (!keepSelection) setLoading(true);
      setError("");
      try {
        const res = await api.learn.getCourseView(courseId);
        setData(res.data);
        setForbidden(false);
        if (!keepSelection) {
          const resume = res.data.resumeLessonId;
          const first = res.data.lessons?.[0]?._id;
          const lessonId = resume || first;
          setSelected(lessonId ? { type: "lesson", id: String(lessonId) } : null);
        }
      } catch (err: any) {
        if (err?.status === 403) setForbidden(true);
        else setError(getErrorMessage(err, "Could not load this course."));
      } finally {
        setLoading(false);
      }
    },
    [courseId]
  );

  useEffect(() => {
    if (!courseId) {
      api.dashboard
        .getStudentDashboard()
        .then((res) => {
          const first = res.data?.activeEnrollments?.[0]?.course?._id;
          if (first) {
            navigate(`/learn/${first}`, { replace: true });
          } else {
            navigate("/student/courses", { replace: true });
          }
        })
        .catch(() => {
          navigate("/courses", { replace: true });
        });
    } else {
      load();
    }
  }, [courseId, load, navigate]);

  const sections = useMemo(() => {
    if (!data) return [];
    const secs = [...(data.course.sections || [])].sort(
      (a: any, b: any) => (a.order || 0) - (b.order || 0)
    );
    return secs
      .map((s: any) => ({
        ...s,
        lessons: data.lessons.filter((l: any) => l.sectionId === s._id),
        quizzes: data.quizzes.filter((q: any) => q.sectionId === s._id),
      }))
      .filter((s: any) => s.lessons.length + s.quizzes.length > 0);
  }, [data]);

  const currentLesson =
    selected?.type === "lesson"
      ? data?.lessons.find((l: any) => l._id === selected.id)
      : null;
  const currentQuiz =
    selected?.type === "quiz"
      ? data?.quizzes.find((q: any) => q._id === selected.id)
      : null;

  const toggleComplete = async () => {
    if (!currentLesson) return;
    setBusy(true);
    setActionError("");
    try {
      if (currentLesson.isCompleted) {
        await api.learn.uncompleteLesson(currentLesson._id);
      } else {
        await api.learn.completeLesson(currentLesson._id);
      }
      await load(true);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update progress."));
    } finally {
      setBusy(false);
    }
  };

  const goNext = () => {
    if (!data || !currentLesson) return;
    const idx = data.lessons.findIndex((l: any) => l._id === currentLesson._id);
    const next = data.lessons[idx + 1];
    if (next) setSelected({ type: "lesson", id: next._id });
  };

  if (loading) {
    return (
      <div className="learn-page">
        <Loading label="Loading your course..." />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="learn-page learn-center">
        <EmptyState
          icon="🔒"
          title="You're not enrolled in this course"
          message="Enroll first to open the learning space."
        >
          <button
            className="ev-btn"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            View course
          </button>
        </EmptyState>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="learn-page learn-center">
        <Notice message={error || "Course not available."} onRetry={() => load()} />
      </div>
    );
  }

  const enrollment = data.enrollment;
  const progress = enrollment.progressPercent || 0;
  const embed = currentLesson ? getYouTubeEmbedUrl(currentLesson.videoUrl) : null;
  const hasNext =
    currentLesson &&
    data.lessons.findIndex((l: any) => l._id === currentLesson._id) <
      data.lessons.length - 1;

  return (
    <div className="learn-page">
      <header className="learn-topbar">
        <Link to="/student/dashboard" className="learn-back">
          ← Dashboard
        </Link>
        <strong className="learn-title">{data.course.title}</strong>
        <div className="learn-progress">
          <div className="learn-progress-track">
            <div style={{ width: `${progress}%` }}></div>
          </div>
          <span>{progress}%</span>
        </div>
      </header>

      <div className="learn-body">
        <aside className="learn-sidebar">
          {sections.map((section: any) => (
            <div key={section._id} className="learn-section">
              <h3>{section.title}</h3>
              {section.lessons.map((lesson: any) => (
                <button
                  key={lesson._id}
                  type="button"
                  className={`learn-item ${
                    selected?.id === lesson._id ? "active" : ""
                  }`}
                  onClick={() => setSelected({ type: "lesson", id: lesson._id })}
                >
                  <span className={`learn-dot ${lesson.isCompleted ? "done" : ""}`}>
                    {lesson.isCompleted ? "✓" : ""}
                  </span>
                  <span>{lesson.title}</span>
                  <small>{lesson.durationMin ? `${lesson.durationMin}m` : ""}</small>
                </button>
              ))}
              {section.quizzes.map((quiz: any) => (
                <button
                  key={quiz._id}
                  type="button"
                  className={`learn-item ${
                    selected?.id === quiz._id ? "active" : ""
                  }`}
                  onClick={() => setSelected({ type: "quiz", id: quiz._id })}
                >
                  <span className={`learn-dot ${quiz.isPassed ? "done" : ""}`}>
                    {quiz.isPassed ? "✓" : "?"}
                  </span>
                  <span>📝 {quiz.title}</span>
                </button>
              ))}
            </div>
          ))}
          {sections.length === 0 && (
            <p className="learn-muted">No published lessons yet.</p>
          )}
        </aside>

        <main className="learn-content">
          {enrollment.status === "completed" && (
            <Notice
              kind="success"
              title="🎉 Course completed!"
              message={
                enrollment.certificateCode
                  ? `Certificate code: ${enrollment.certificateCode}`
                  : "Congratulations on finishing this course."
              }
            />
          )}

          {actionError && <Notice message={actionError} />}

          {currentLesson && (
            <>
              <h1>{currentLesson.title}</h1>
              {embed && (
                <iframe
                  className="learn-video"
                  title={currentLesson.title}
                  src={embed}
                  allowFullScreen
                />
              )}
              {!embed && currentLesson.videoUrl && (
                <p>
                  <a href={currentLesson.videoUrl} target="_blank" rel="noreferrer">
                    Open video ↗
                  </a>
                </p>
              )}
              {currentLesson.content && (
                <div className="learn-text">{currentLesson.content}</div>
              )}
              {currentLesson.resources?.length > 0 && (
                <ul className="learn-resources">
                  {currentLesson.resources.map((r: any, i: number) => (
                    <li key={i}>
                      <a href={r.url || r} target="_blank" rel="noreferrer">
                        {r.title || r.url || String(r)}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <div className="learn-actions">
                <button
                  type="button"
                  className={`ev-btn ${currentLesson.isCompleted ? "ev-btn-outline" : ""}`}
                  onClick={toggleComplete}
                  disabled={busy || enrollment.status === "mentor_or_admin"}
                >
                  {currentLesson.isCompleted ? "✓ Completed (undo)" : "Mark as complete"}
                </button>
                {hasNext && (
                  <button type="button" className="ev-btn ev-btn-outline" onClick={goNext}>
                    Next lesson →
                  </button>
                )}
              </div>
            </>
          )}

          {currentQuiz && (
            <>
              <h1>📝 {currentQuiz.title}</h1>
              <QuizRunner
                key={currentQuiz._id}
                quizId={currentQuiz._id}
                onFinished={() => load(true)}
              />
            </>
          )}

          {!currentLesson && !currentQuiz && (
            <EmptyState
              icon="📚"
              title="Nothing to study yet"
              message="The instructor hasn't published any lessons for this course."
            />
          )}

          {progress >= 25 && (
            <p className="learn-muted learn-review-hint">
              Enjoying the course?{" "}
              <Link to={`/courses/${data.course._id}#reviews`}>Leave a review</Link>
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export default Learn;
