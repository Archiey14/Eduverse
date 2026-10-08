import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import InstructorLayout from "../components/InstructorLayout";

function InstructorQuizzes() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requested = searchParams.get("course");
  const selectedId: string | null =
    courses.find((c) => c._id === requested)?._id || courses[0]?._id || null;

  useEffect(() => {
    api.mentor
      .getMyCourses({ limit: 50 })
      .then((res) => setCourses(res.data || []))
      .catch((err) => setError(getErrorMessage(err, "Could not load your courses.")))
      .finally(() => setCoursesLoading(false));
  }, []);

  const loadQuizzes = useCallback(async (courseId: string) => {
    setQuizzesLoading(true);
    try {
      const res = await api.mentor.getCourse(courseId);
      setQuizzes(res.data?.quizzes || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load quizzes."));
    } finally {
      setQuizzesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadQuizzes(selectedId);
  }, [selectedId, loadQuizzes]);

  const handleDelete = async (quiz: any) => {
    if (!selectedId) return;
    if (!window.confirm(`Delete "${quiz.title}"?`)) return;

    setError("");
    setSuccess("");
    try {
      await api.mentor.deleteQuiz(quiz._id);
      await loadQuizzes(selectedId);
      setSuccess("Quiz deleted.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete the quiz."));
    }
  };

  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);

  return (
    <InstructorLayout active="quizzes" title="Quizzes">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">ASSESSMENTS</span>
          <h1>Quizzes</h1>
          <p>Review the quizzes attached to each of your courses.</p>
        </div>

        {selectedId && (
          <Link
            to={`/instructor/courses/edit/${selectedId}?tab=quizzes`}
            className="il-btn"
          >
            ＋ Create quiz
          </Link>
        )}
      </div>

      {error && <div className="il-alert il-alert-error">{error}</div>}
      {success && <div className="il-alert il-alert-success">{success}</div>}

      {coursesLoading ? (
        <div className="il-loading">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="il-card">
          <div className="il-empty">
            <span>📝</span>
            <h3>No courses yet</h3>
            <p>Create a course first, then add quizzes to it.</p>
            <Link to="/instructor/courses/create" className="il-btn">
              Create a course
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="il-toolbar">
            <select
              className="il-select"
              value={selectedId || ""}
              onChange={(e) => setSearchParams({ course: e.target.value })}
              aria-label="Select course"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <section className="il-stats">
            <div className="il-stat">
              <span>Quizzes</span>
              <strong>{quizzes.length}</strong>
              <small>In this course</small>
            </div>
            <div className="il-stat">
              <span>Total Questions</span>
              <strong>{totalQuestions}</strong>
              <small>Across all quizzes</small>
            </div>
          </section>

          <section className="il-card">
            {quizzesLoading ? (
              <div className="il-loading">Loading quizzes...</div>
            ) : quizzes.length === 0 ? (
              <div className="il-empty">
                <span>📝</span>
                <h3>No quizzes yet</h3>
                <p>Add a quiz to test what your students have learned.</p>
                <Link
                  to={`/instructor/courses/edit/${selectedId}?tab=quizzes`}
                  className="il-btn"
                >
                  Create a quiz
                </Link>
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div className="il-list-item" key={quiz._id} style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <strong>{quiz.title}</strong>
                    <small>
                      {quiz.questions?.length || 0} questions · pass at {quiz.passPercent}%
                    </small>

                    <details style={{ marginTop: 8 }}>
                      <summary style={{ cursor: "pointer", fontSize: 12, color: "#5b5ce2" }}>
                        View questions
                      </summary>
                      <ol style={{ margin: "8px 0 0", paddingLeft: 20, fontSize: 13 }}>
                        {(quiz.questions || []).map((q: any, index: number) => (
                          <li key={q._id || index} style={{ marginBottom: 8 }}>
                            {q.text}
                            <ul style={{ margin: "4px 0 0", paddingLeft: 18, color: "#73798c" }}>
                              {(q.options || []).map((option: string, i: number) => (
                                <li
                                  key={i}
                                  style={
                                    i === q.correctIndex
                                      ? { color: "#18804a", fontWeight: 700 }
                                      : undefined
                                  }
                                >
                                  {option}
                                  {i === q.correctIndex ? " ✓" : ""}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </div>

                  <button
                    type="button"
                    className="il-btn il-btn-danger il-btn-sm"
                    onClick={() => handleDelete(quiz)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </InstructorLayout>
  );
}

export default InstructorQuizzes;
