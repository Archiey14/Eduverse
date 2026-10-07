import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import MentorLayout from "../components/MentorLayout";
import "./Mentor.css";

export default function MentorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.mentor.getDashboard();
        setData(res.data);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load your dashboard."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data?.stats;
  const enrollments: any[] = data?.recentEnrollments || [];
  const reviews: any[] = data?.recentReviews || [];

  return (
    <MentorLayout activeItem="dashboard">
      <div className="mt-page-header">
        <div>
          <span className="mt-eyebrow">INSTRUCTOR DASHBOARD</span>
          <h1>Welcome, {user?.name || "Instructor"} 👋</h1>
          <p>Here is how your courses are performing.</p>
        </div>
        <Link to="/mentor/courses/new" className="mt-btn mt-btn-primary">
          ➕ Create Course
        </Link>
      </div>

      {error && <div className="mt-alert mt-alert-error">{error}</div>}
      {loading && <p>Loading...</p>}

      {stats && (
        <section className="mt-stat-grid">
          <div className="mt-stat">
            <span>Total Courses</span>
            <strong>{stats.totalCourses}</strong>
            <small>
              {stats.publishedCourses} published · {stats.draftCourses} draft
            </small>
          </div>
          <div className="mt-stat">
            <span>Total Students</span>
            <strong>{stats.totalEnrollments}</strong>
            <small>Enrolled across all courses</small>
          </div>
          <div className="mt-stat">
            <span>Reviews</span>
            <strong>{stats.totalReviews}</strong>
            <small>From your students</small>
          </div>
          <div className="mt-stat">
            <span>Average Rating</span>
            <strong>{stats.overallRating ? `${stats.overallRating} ★` : "—"}</strong>
            <small>Across all reviews</small>
          </div>
        </section>
      )}

      <div className="mt-two-col">
        <section className="mt-card">
          <h2>Recent Enrollments</h2>
          <p className="mt-card-sub">Students who joined your courses lately.</p>
          {enrollments.length === 0 ? (
            <div className="mt-empty">
              <span>👥</span>No enrollments yet. Publish a course to get students.
            </div>
          ) : (
            enrollments.slice(0, 6).map((e) => (
              <div className="mt-list-item" key={e._id}>
                <div className="mt-user-chip">
                  <div className="mt-avatar-sm">
                    {(e.student?.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{e.student?.name || "Student"}</strong>
                    <small>{e.course?.title}</small>
                  </div>
                </div>
                <small>{e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : ""}</small>
              </div>
            ))
          )}
        </section>

        <section className="mt-card">
          <h2>Recent Reviews</h2>
          <p className="mt-card-sub">What students are saying.</p>
          {reviews.length === 0 ? (
            <div className="mt-empty">
              <span>⭐</span>No reviews yet.
            </div>
          ) : (
            reviews.map((r) => (
              <div className="mt-list-item" key={r._id}>
                <div>
                  <strong>
                    {r.student?.name || "Student"} · {"★".repeat(r.rating || 0)}
                  </strong>
                  <small>{r.comment || r.course?.title}</small>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="mt-card">
        <h2>Your Courses</h2>
        <p className="mt-card-sub">Quick overview of your catalog.</p>
        {(data?.courses || []).length === 0 && !loading ? (
          <div className="mt-empty">
            <span>📚</span>You have not created any course yet.
            <div style={{ marginTop: 12 }}>
              <Link to="/mentor/courses/new" className="mt-btn mt-btn-primary">
                Create your first course
              </Link>
            </div>
          </div>
        ) : (
          (data?.courses || []).slice(0, 5).map((c: any) => (
            <div className="mt-list-item" key={c._id}>
              <div>
                <strong>{c.title}</strong>
                <small>
                  {c.stats?.lessonCount || 0} lessons · {c.stats?.enrollmentCount || 0} students
                </small>
              </div>
              <div className="mt-actions">
                <span className={`mt-badge mt-badge-${c.status}`}>{c.status}</span>
                <Link to={`/mentor/courses/${c._id}/edit`} className="mt-btn mt-btn-outline mt-btn-sm">
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </section>
    </MentorLayout>
  );
}
