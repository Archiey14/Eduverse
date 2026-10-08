import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import InstructorLayout from "../components/InstructorLayout";

interface Analytics {
  totals: {
    students: number;
    completions: number;
    completionRate: number;
    avgRating: number;
    ratingCount: number;
  };
  courses: {
    _id: string;
    title: string;
    status: string;
    students: number;
    completed: number;
    completionRate: number;
    avgProgress: number;
    rating: number;
    ratingCount: number;
  }[];
  quizzes: {
    _id: string;
    title: string;
    course: string;
    attempts: number;
    avgScore: number;
    passRate: number;
  }[];
  monthly: { label: string; count: number }[];
}

function InstructorAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.mentor
      .getAnalytics()
      .then((res) => {
        if (!cancelled) setData(res.data || null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load analytics."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const maxMonthly = data ? Math.max(1, ...data.monthly.map((m) => m.count)) : 1;

  return (
    <InstructorLayout active="analytics" title="Analytics">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">PERFORMANCE OVERVIEW</span>
          <h1>Analytics</h1>
          <p>Track your courses, students and quizzes using live data.</p>
        </div>
      </div>

      {error && <div className="il-alert il-alert-error">{error}</div>}

      {loading ? (
        <div className="il-loading">Loading analytics...</div>
      ) : !data ? null : data.courses.length === 0 ? (
        <div className="il-card">
          <div className="il-empty">
            <span>📊</span>
            <h3>No data yet</h3>
            <p>Create and publish a course to start seeing analytics.</p>
            <Link to="/instructor/courses/create" className="il-btn">
              Create a course
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="il-stats">
            <div className="il-stat">
              <span>Total Students</span>
              <strong>{data.totals.students}</strong>
              <small>Enrollments across all courses</small>
            </div>
            <div className="il-stat">
              <span>Completions</span>
              <strong>{data.totals.completions}</strong>
              <small>{data.totals.completionRate}% completion rate</small>
            </div>
            <div className="il-stat">
              <span>Average Rating</span>
              <strong>{data.totals.ratingCount > 0 ? data.totals.avgRating.toFixed(1) : "—"}</strong>
              <small>
                {data.totals.ratingCount > 0
                  ? `From ${data.totals.ratingCount} review${data.totals.ratingCount === 1 ? "" : "s"}`
                  : "No reviews yet"}
              </small>
            </div>
            <div className="il-stat">
              <span>Courses</span>
              <strong>{data.courses.length}</strong>
              <small>{data.quizzes.length} quizzes</small>
            </div>
          </section>

          <section className="il-card">
            <h2>New enrollments</h2>
            <p className="il-card-sub">Last 6 months</p>
            <div className="il-bars">
              {data.monthly.map((m) => (
                <div className="il-bar-col" key={m.label}>
                  <strong>{m.count}</strong>
                  <div className="il-bar" style={{ height: `${(m.count / maxMonthly) * 100}%` }}></div>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="il-card">
            <h2>Course performance</h2>
            <p className="il-card-sub">Students, progress and ratings per course.</p>
            <div className="il-table-wrap">
              <table className="il-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Students</th>
                    <th>Avg. progress</th>
                    <th>Completion</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <strong>{course.title}</strong>
                        <div>
                          <span className={`il-badge il-badge-${course.status}`}>{course.status}</span>
                        </div>
                      </td>
                      <td>{course.students}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="il-progress">
                            <div style={{ width: `${course.avgProgress}%` }}></div>
                          </div>
                          <span>{course.avgProgress}%</span>
                        </div>
                      </td>
                      <td>
                        {course.completed} / {course.students} ({course.completionRate}%)
                      </td>
                      <td>{course.ratingCount > 0 ? `⭐ ${course.rating}` : "No ratings"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="il-card">
            <h2>Quiz performance</h2>
            <p className="il-card-sub">Attempts, average score and pass rate.</p>
            {data.quizzes.length === 0 ? (
              <div className="il-empty" style={{ padding: "20px 10px" }}>
                <span>📝</span>
                <p>No quizzes created yet.</p>
              </div>
            ) : (
              <div className="il-table-wrap">
                <table className="il-table">
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Course</th>
                      <th>Attempts</th>
                      <th>Avg. score</th>
                      <th>Pass rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.quizzes.map((quiz) => (
                      <tr key={quiz._id}>
                        <td>
                          <strong>{quiz.title}</strong>
                        </td>
                        <td>{quiz.course || "—"}</td>
                        <td>{quiz.attempts}</td>
                        <td>{quiz.attempts > 0 ? `${quiz.avgScore}%` : "—"}</td>
                        <td>{quiz.attempts > 0 ? `${quiz.passRate}%` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </InstructorLayout>
  );
}

export default InstructorAnalytics;
