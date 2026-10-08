import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import InstructorLayout from "../components/InstructorLayout";

interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  totalReviews: number;
  overallRating: number;
}

const emptyStats: DashboardStats = {
  totalCourses: 0,
  publishedCourses: 0,
  draftCourses: 0,
  totalEnrollments: 0,
  totalReviews: 0,
  overallRating: 0,
};

function InstructorDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api.mentor
      .getDashboard()
      .then((res) => {
        if (cancelled || !res.data) return;
        setStats({ ...emptyStats, ...(res.data.stats || {}) });
        setCourses(res.data.courses || []);
        setEnrollments(res.data.recentEnrollments || []);
        setReviews(res.data.recentReviews || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Could not load your dashboard."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalLessons = courses.reduce(
    (total, course) => total + (course.stats?.lessonCount || 0),
    0
  );

  const firstName = (user?.name || "Instructor").split(" ")[0];

  return (
    <InstructorLayout active="dashboard" title="Dashboard">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">INSTRUCTOR DASHBOARD</span>
          <h1>Welcome back, {firstName}! 👋</h1>
          <p>
            Manage your courses, track your students, and keep creating great
            learning experiences.
          </p>
        </div>

        <Link to="/instructor/courses/create" className="il-btn">
          ＋ Create New Course
        </Link>
      </div>

      {error && <div className="il-alert il-alert-error">{error}</div>}

      {loading ? (
        <div className="il-loading">Loading your dashboard...</div>
      ) : (
        <>
          <section className="il-stats">
            <div className="il-stat">
              <span>Total Courses</span>
              <strong>{stats.totalCourses}</strong>
              <small>
                {stats.publishedCourses} published · {stats.draftCourses} draft
              </small>
            </div>

            <div className="il-stat">
              <span>Total Enrollments</span>
              <strong>{stats.totalEnrollments}</strong>
              <small>Across all your courses</small>
            </div>

            <div className="il-stat">
              <span>Total Lessons</span>
              <strong>{totalLessons}</strong>
              <small>Across all your courses</small>
            </div>

            <div className="il-stat">
              <span>Average Rating</span>
              <strong>
                {stats.totalReviews > 0 ? stats.overallRating.toFixed(1) : "—"}
              </strong>
              <small>
                {stats.totalReviews > 0
                  ? `From ${stats.totalReviews} review${stats.totalReviews === 1 ? "" : "s"}`
                  : "No reviews yet"}
              </small>
            </div>
          </section>

          <div className="il-grid-2">
            <section className="il-card">
              <div className="il-page-header" style={{ marginBottom: 12 }}>
                <div>
                  <h2>Your Courses</h2>
                  <p className="il-card-sub" style={{ margin: 0 }}>
                    Most recently updated first.
                  </p>
                </div>
                <Link to="/instructor/courses" className="il-btn il-btn-outline il-btn-sm">
                  View all →
                </Link>
              </div>

              {courses.length === 0 ? (
                <div className="il-empty">
                  <span>📚</span>
                  <h3>No courses yet</h3>
                  <p>Create your first course to start teaching.</p>
                  <Link to="/instructor/courses/create" className="il-btn">
                    Create a course
                  </Link>
                </div>
              ) : (
                courses.slice(0, 5).map((course) => (
                  <div className="il-list-item" key={course._id}>
                    <div>
                      <strong>{course.title}</strong>
                      <small>
                        {course.category?.name || "Uncategorised"} ·{" "}
                        {course.stats?.enrollmentCount || 0} students ·{" "}
                        {course.stats?.lessonCount || 0} lessons
                        {course.stats?.ratingCount > 0
                          ? ` · ⭐ ${course.stats.ratingAvg}`
                          : ""}
                      </small>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span className={`il-badge il-badge-${course.status}`}>
                        {course.status}
                      </span>
                      <Link
                        to={`/instructor/courses/edit/${course._id}`}
                        className="il-btn il-btn-outline il-btn-sm"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="il-card">
              <h2>Recent Enrollments</h2>
              <p className="il-card-sub">Latest students to join your courses.</p>

              {enrollments.length === 0 ? (
                <div className="il-empty" style={{ padding: "24px 10px" }}>
                  <span>👥</span>
                  <p>No enrollments yet.</p>
                </div>
              ) : (
                enrollments.slice(0, 6).map((enrollment) => (
                  <div className="il-list-item" key={enrollment._id}>
                    <div>
                      <strong>{enrollment.student?.name || "A learner"}</strong>
                      <small>
                        {enrollment.course?.title || "Course"} ·{" "}
                        {enrollment.enrolledAt
                          ? new Date(enrollment.enrolledAt).toLocaleDateString()
                          : "Recently"}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>

          <div className="il-grid-2">
            <section className="il-card">
              <h2>Recent Reviews</h2>
              <p className="il-card-sub">What students are saying.</p>

              {reviews.length === 0 ? (
                <div className="il-empty" style={{ padding: "24px 10px" }}>
                  <span>⭐</span>
                  <p>No reviews yet.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div className="il-list-item" key={review._id}>
                    <div>
                      <strong>
                        {review.student?.name || "A learner"} · {"★".repeat(review.rating || 0)}
                      </strong>
                      <small>
                        {review.course?.title || "Course"}
                        {review.comment ? ` — ${review.comment}` : ""}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="il-card">
              <h2>Quick Actions</h2>
              <p className="il-card-sub">Shortcuts to common tasks.</p>

              <div className="il-list-item">
                <div>
                  <strong>Create a course</strong>
                  <small>Start building a new course</small>
                </div>
                <Link to="/instructor/courses/create" className="il-btn il-btn-outline il-btn-sm">
                  Open
                </Link>
              </div>

              <div className="il-list-item">
                <div>
                  <strong>Manage lessons</strong>
                  <small>Add and organise course lessons</small>
                </div>
                <Link to="/instructor/lessons" className="il-btn il-btn-outline il-btn-sm">
                  Open
                </Link>
              </div>

              <div className="il-list-item">
                <div>
                  <strong>Manage quizzes</strong>
                  <small>Create and review quizzes</small>
                </div>
                <Link to="/instructor/quizzes" className="il-btn il-btn-outline il-btn-sm">
                  Open
                </Link>
              </div>

              <div className="il-list-item">
                <div>
                  <strong>View students</strong>
                  <small>Track your learners' progress</small>
                </div>
                <Link to="/instructor/students" className="il-btn il-btn-outline il-btn-sm">
                  Open
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </InstructorLayout>
  );
}

export default InstructorDashboard;
