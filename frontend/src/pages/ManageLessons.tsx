import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import InstructorLayout from "../components/InstructorLayout";

const emptyLesson = {
  title: "",
  type: "video",
  videoUrl: "",
  content: "",
  durationMin: "10",
};

function ManageLessons() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [course, setCourse] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(false);

  const [addingTo, setAddingTo] = useState("");
  const [form, setForm] = useState(emptyLesson);
  const [busy, setBusy] = useState(false);
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

  const loadCourse = useCallback(async (courseId: string) => {
    setCourseLoading(true);
    try {
      const res = await api.mentor.getCourse(courseId);
      setCourse(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load this course."));
    } finally {
      setCourseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadCourse(selectedId);
  }, [selectedId, loadCourse]);

  const flash = (type: "error" | "success", text: string) => {
    setError(type === "error" ? text : "");
    setSuccess(type === "success" ? text : "");
  };

  const sections: any[] = course?.sections || [];
  const lessons: any[] = course?.lessons || [];
  const publishedCount = lessons.filter((l) => l.isPublished).length;
  const totalMinutes = lessons.reduce((sum, l) => sum + (l.durationMin || 0), 0);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !addingTo) return;

    if (!form.title.trim()) {
      flash("error", "Lesson title is required.");
      return;
    }

    setBusy(true);
    try {
      await api.mentor.addLesson(selectedId, {
        sectionId: addingTo,
        title: form.title.trim(),
        type: form.type,
        videoUrl: form.videoUrl.trim(),
        content: form.content,
        durationMin: Number(form.durationMin) || 0,
      });
      setForm(emptyLesson);
      setAddingTo("");
      await loadCourse(selectedId);
      flash("success", "Lesson added.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not add the lesson."));
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async (lesson: any) => {
    if (!selectedId) return;
    try {
      await api.mentor.updateLesson(lesson._id, { isPublished: !lesson.isPublished });
      await loadCourse(selectedId);
      flash("success", lesson.isPublished ? "Lesson moved to draft." : "Lesson published.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not update the lesson."));
    }
  };

  const handleDelete = async (lesson: any) => {
    if (!selectedId) return;
    if (!window.confirm(`Delete "${lesson.title}"?`)) return;
    try {
      await api.mentor.deleteLesson(lesson._id);
      await loadCourse(selectedId);
      flash("success", "Lesson deleted.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not delete the lesson."));
    }
  };

  return (
    <InstructorLayout active="lessons" title="Manage Lessons">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">COURSE MANAGEMENT</span>
          <h1>Manage Lessons</h1>
          <p>Add, publish and remove the lessons inside your courses.</p>
        </div>

        {selectedId && (
          <Link
            to={`/instructor/courses/edit/${selectedId}`}
            className="il-btn il-btn-outline"
          >
            Open full course editor →
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
            <span>📖</span>
            <h3>No courses yet</h3>
            <p>Create a course first, then add lessons to it.</p>
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
              onChange={(e) => {
                setAddingTo("");
                setSearchParams({ course: e.target.value });
              }}
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
              <span>Total Lessons</span>
              <strong>{lessons.length}</strong>
              <small>In this course</small>
            </div>
            <div className="il-stat">
              <span>Published</span>
              <strong>{publishedCount}</strong>
              <small>Visible to students</small>
            </div>
            <div className="il-stat">
              <span>Drafts</span>
              <strong>{lessons.length - publishedCount}</strong>
              <small>Hidden from students</small>
            </div>
            <div className="il-stat">
              <span>Total Duration</span>
              <strong>{totalMinutes}m</strong>
              <small>Across all lessons</small>
            </div>
          </section>

          {courseLoading ? (
            <div className="il-loading">Loading lessons...</div>
          ) : sections.length === 0 ? (
            <div className="il-card">
              <div className="il-empty">
                <span>🗂️</span>
                <h3>No sections yet</h3>
                <p>Add a section in the course editor, then come back to add lessons.</p>
                <Link to={`/instructor/courses/edit/${selectedId}`} className="il-btn">
                  Open course editor
                </Link>
              </div>
            </div>
          ) : (
            sections.map((section) => {
              const sectionLessons = lessons.filter(
                (l) => String(l.sectionId) === String(section._id)
              );

              return (
                <section className="il-card" key={section._id}>
                  <div className="il-page-header" style={{ marginBottom: 8 }}>
                    <div>
                      <h2>{section.title}</h2>
                      <p className="il-card-sub" style={{ margin: 0 }}>
                        {sectionLessons.length} lesson{sectionLessons.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="il-btn il-btn-outline il-btn-sm"
                      onClick={() => {
                        setAddingTo(addingTo === section._id ? "" : section._id);
                        setForm(emptyLesson);
                      }}
                    >
                      {addingTo === section._id ? "Cancel" : "＋ Add lesson"}
                    </button>
                  </div>

                  {sectionLessons.length === 0 && addingTo !== section._id && (
                    <p className="il-card-sub">No lessons in this section yet.</p>
                  )}

                  {sectionLessons.map((lesson, index) => (
                    <div className="il-list-item" key={lesson._id}>
                      <div>
                        <strong>
                          {index + 1}. {lesson.type === "text" ? "📄" : "🎬"} {lesson.title}
                        </strong>
                        <small>
                          {lesson.type} · {lesson.durationMin || 0} min
                        </small>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span
                          className={`il-badge il-badge-${lesson.isPublished ? "published" : "draft"}`}
                        >
                          {lesson.isPublished ? "published" : "draft"}
                        </span>
                        <button
                          type="button"
                          className="il-btn il-btn-outline il-btn-sm"
                          onClick={() => togglePublished(lesson)}
                        >
                          {lesson.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          className="il-btn il-btn-danger il-btn-sm"
                          onClick={() => handleDelete(lesson)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {addingTo === section._id && (
                    <form onSubmit={handleAdd} style={{ marginTop: 18 }}>
                      <div className="il-form-grid">
                        <div className="il-field full">
                          <label>Lesson title *</label>
                          <input
                            className="il-input"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                          />
                        </div>

                        <div className="il-field">
                          <label>Type</label>
                          <select
                            className="il-select"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                          >
                            <option value="video">Video</option>
                            <option value="text">Text</option>
                          </select>
                        </div>

                        <div className="il-field">
                          <label>Duration (minutes)</label>
                          <input
                            className="il-input"
                            type="number"
                            min="0"
                            value={form.durationMin}
                            onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                          />
                        </div>

                        {form.type === "video" ? (
                          <div className="il-field full">
                            <label>Video URL</label>
                            <input
                              className="il-input"
                              placeholder="https://www.youtube.com/embed/..."
                              value={form.videoUrl}
                              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                            />
                          </div>
                        ) : (
                          <div className="il-field full">
                            <label>Lesson content</label>
                            <textarea
                              className="il-textarea"
                              value={form.content}
                              onChange={(e) => setForm({ ...form, content: e.target.value })}
                            />
                          </div>
                        )}
                      </div>

                      <button type="submit" className="il-btn" disabled={busy}>
                        {busy ? "Saving..." : "Save lesson"}
                      </button>
                    </form>
                  )}
                </section>
              );
            })
          )}
        </>
      )}
    </InstructorLayout>
  );
}

export default ManageLessons;
