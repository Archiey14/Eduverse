import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Megaphone, Users } from "lucide-react";
import { api, getErrorMessage } from "../services/api";
import InstructorLayout from "../components/InstructorLayout";

function InstructorStudents() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementSending, setAnnouncementSending] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState("");

  // Course selected via ?course=<id>; falls back to the first course
  const requestedCourse = searchParams.get("course");
  const selectedCourse = useMemo(() => {
    if (courses.length === 0) return null;
    return courses.find((c) => c._id === requestedCourse) || courses[0];
  }, [courses, requestedCourse]);
  const selectedCourseId: string | null = selectedCourse?._id || null;

  useEffect(() => {
    api.mentor
      .getMyCourses({ limit: 50 })
      .then((res) => setCourses(res.data || []))
      .catch((err) => setError(getErrorMessage(err, "Could not load your courses.")))
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    let cancelled = false;
    setStudentsLoading(true);
    setError("");

    api.mentor
      .getCourseStudents(selectedCourseId, page)
      .then((res) => {
        if (cancelled) return;
        setStudents(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load students."));
      })
      .finally(() => {
        if (!cancelled) setStudentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCourseId, page]);

  const handleCourseChange = (courseId: string) => {
    setPage(1);
    setSearch("");
    setAnnouncementSuccess("");
    setAnnouncementMessage("");
    setSearchParams({ course: courseId });
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !announcementMessage.trim()) return;
    setAnnouncementSending(true);
    setAnnouncementSuccess("");
    setError("");
    
    try {
      const res = await api.mentor.sendAnnouncement(selectedCourseId, announcementMessage);
      setAnnouncementSuccess(res.message || "Announcement sent successfully!");
      setAnnouncementMessage("");
      setTimeout(() => setAnnouncementSuccess(""), 5000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send announcement."));
    } finally {
      setAnnouncementSending(false);
    }
  };

  const visible = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return students;
    return students.filter(
      (enrollment) =>
        (enrollment.student?.name || "").toLowerCase().includes(query) ||
        (enrollment.student?.email || "").toLowerCase().includes(query)
    );
  }, [students, search]);

  const totalLessons = selectedCourse?.stats?.lessonCount || 0;

  return (
    <InstructorLayout active="students" title="Students">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">STUDENT MANAGEMENT</span>
          <h1>Students</h1>
          <p>See who is enrolled in each of your courses and how far they have got.</p>
        </div>
      </div>

      {error && <div className="il-alert il-alert-error">{error}</div>}

      {coursesLoading ? (
        <div className="il-loading">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="il-card">
          <div className="il-empty">
            <span>👥</span>
            <h3>No courses yet</h3>
            <p>Create and publish a course to start getting students.</p>
            <Link to="/instructor/courses/create" className="il-btn">
              Create a course
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="il-stats">
            <div className="il-stat">
              <span>Enrolled in this course</span>
              <strong>{total}</strong>
              <small>{selectedCourse?.title}</small>
            </div>
            <div className="il-stat">
              <span>Lessons in this course</span>
              <strong>{totalLessons}</strong>
              <small>Published lessons</small>
            </div>
          </section>

          <div className="il-toolbar">
            <select
              className="il-select"
              value={selectedCourseId || ""}
              onChange={(e) => handleCourseChange(e.target.value)}
              aria-label="Select course"
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>

            <input
              className="il-input"
              type="text"
              placeholder="Search students on this page by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <section className="il-card" style={{ marginBottom: 24, padding: "20px" }}>
            <h3 style={{ marginTop: 0, color: "#111827", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Megaphone size={18} /> Broadcast Announcement
            </h3>
            <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "16px" }}>
              Send a notification to all {total} students enrolled in {selectedCourse?.title}.
            </p>
            {announcementSuccess && (
              <div className="il-alert il-alert-success" style={{ marginBottom: "16px", padding: "10px", fontSize: "13px" }}>
                {announcementSuccess}
              </div>
            )}
            <form onSubmit={handleSendAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <textarea
                className="il-input"
                rows={3}
                placeholder="Write your announcement here..."
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                required
                style={{ resize: "vertical" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="il-btn"
                  disabled={announcementSending || !announcementMessage.trim() || total === 0}
                >
                  {announcementSending ? "Sending..." : "Send Announcement"}
                </button>
              </div>
            </form>
          </section>

          <section className="il-card">
            {studentsLoading ? (
              <div className="il-loading">Loading students...</div>
            ) : visible.length === 0 ? (
              <div className="il-empty">
                <Users size={48} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
                <h3>{students.length === 0 ? "No students yet" : "No matches"}</h3>
                <p>
                  {students.length === 0
                    ? "Nobody has enrolled in this course yet."
                    : "Try a different search."}
                </p>
              </div>
            ) : (
              <div className="il-table-wrap">
                <table className="il-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Enrolled</th>
                      <th>Progress</th>
                      <th>Lessons done</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((enrollment) => (
                      <tr key={enrollment._id}>
                        <td>
                          <strong>{enrollment.student?.name || "Unknown"}</strong>
                          <div style={{ color: "#8b91a3", fontSize: 12 }}>
                            {enrollment.student?.email}
                          </div>
                        </td>
                        <td>
                          {enrollment.enrolledAt
                            ? new Date(enrollment.enrolledAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="il-progress">
                              <div style={{ width: `${enrollment.progressPercent || 0}%` }}></div>
                            </div>
                            <span>{enrollment.progressPercent || 0}%</span>
                          </div>
                        </td>
                        <td>
                          {enrollment.completedLessons?.length || 0}
                          {totalLessons > 0 ? ` / ${totalLessons}` : ""}
                        </td>
                        <td>
                          <span className={`il-badge il-badge-${enrollment.status}`}>
                            {enrollment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {totalPages > 1 && (
            <div className="il-toolbar" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="il-btn il-btn-outline il-btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span style={{ alignSelf: "center", fontSize: 13 }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="il-btn il-btn-outline il-btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </InstructorLayout>
  );
}

export default InstructorStudents;
