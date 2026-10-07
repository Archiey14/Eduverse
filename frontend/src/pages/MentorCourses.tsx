import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import MentorLayout from "../components/MentorLayout";
import "./Mentor.css";

export default function MentorCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.mentor.getMyCourses({ limit: 50 });
      setCourses(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your courses."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (id: string, action: () => Promise<any>, okMsg: string) => {
    setError("");
    setSuccess("");
    setBusyId(id);
    try {
      const res = await action();
      setSuccess(res?.message || okMsg);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Action failed."));
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = (c: any) => {
    if (!window.confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
    run(c._id, () => api.mentor.deleteCourse(c._id), "Course deleted.");
  };

  return (
    <MentorLayout activeItem="courses">
      <div className="mt-page-header">
        <div>
          <span className="mt-eyebrow">INSTRUCTOR STUDIO</span>
          <h1>My Courses</h1>
          <p>Create, publish and manage your courses.</p>
        </div>
        <Link to="/mentor/courses/new" className="mt-btn mt-btn-primary">
          ➕ Create Course
        </Link>
      </div>

      {error && <div className="mt-alert mt-alert-error">{error}</div>}
      {success && <div className="mt-alert mt-alert-success">{success}</div>}

      <section className="mt-card">
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <div className="mt-empty">
            <span>📚</span>No courses yet. Create your first one!
          </div>
        ) : (
          <div className="mt-table-wrap">
            <table className="mt-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Lessons</th>
                  <th>Students</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <strong>{c.title}</strong>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {c.category?.name || "Uncategorized"}
                      </div>
                    </td>
                    <td>
                      <span className={`mt-badge mt-badge-${c.status}`}>{c.status}</span>
                    </td>
                    <td>{c.stats?.lessonCount || 0}</td>
                    <td>{c.stats?.enrollmentCount || 0}</td>
                    <td>{c.stats?.ratingAvg ? `${c.stats.ratingAvg} ★` : "—"}</td>
                    <td>
                      <div className="mt-actions">
                        <Link
                          to={`/mentor/courses/${c._id}/edit`}
                          className="mt-btn mt-btn-outline mt-btn-sm"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/mentor/courses/${c._id}/students`}
                          className="mt-btn mt-btn-outline mt-btn-sm"
                        >
                          Students
                        </Link>
                        {c.status === "published" ? (
                          <button
                            className="mt-btn mt-btn-outline mt-btn-sm"
                            disabled={busyId === c._id}
                            onClick={() =>
                              run(c._id, () => api.mentor.unpublishCourse(c._id), "Unpublished.")
                            }
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            className="mt-btn mt-btn-success mt-btn-sm"
                            disabled={busyId === c._id}
                            onClick={() =>
                              run(c._id, () => api.mentor.publishCourse(c._id), "Published!")
                            }
                          >
                            Publish
                          </button>
                        )}
                        <button
                          className="mt-btn mt-btn-danger mt-btn-sm"
                          disabled={busyId === c._id}
                          onClick={() => handleDelete(c)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </MentorLayout>
  );
}
