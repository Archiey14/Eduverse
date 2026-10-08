import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, Search, Users, Star, Edit2, Trash2 } from "lucide-react";
import { api, getErrorMessage } from "../services/api";
import InstructorLayout from "../components/InstructorLayout";

function InstructorCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadCourses = useCallback(async () => {
    setError("");
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
    loadCourses();
  }, [loadCourses]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(courses.map((c) => c.category?.name).filter(Boolean))
      ) as string[],
    [courses]
  );

  const filtered = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return courses.filter((course) => {
      const matchesSearch =
        !query ||
        (course.title || "").toLowerCase().includes(query) ||
        (course.description || "").toLowerCase().includes(query) ||
        (course.category?.name || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || course.category?.name === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [courses, searchTerm, statusFilter, categoryFilter]);

  const count = (status: string) => courses.filter((c) => c.status === status).length;
  const totalStudents = courses.reduce(
    (total, c) => total + (c.stats?.enrollmentCount || 0),
    0
  );

  const handleDelete = async (course: any) => {
    if (!window.confirm(`Delete "${course.title}"?`)) return;

    setError("");
    setNotice("");
    try {
      const res = await api.mentor.deleteCourse(course._id);
      if (res.status === "archived") {
        // The backend archives courses that have enrolled students
        setCourses((current) =>
          current.map((c) => (c._id === course._id ? { ...c, status: "archived" } : c))
        );
        setNotice(
          `"${course.title}" has enrolled students, so it was archived instead of deleted.`
        );
      } else {
        setCourses((current) => current.filter((c) => c._id !== course._id));
        setNotice(`"${course.title}" was deleted.`);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete the course."));
    }
  };

  return (
    <InstructorLayout active="courses" title="My Courses">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">COURSE MANAGEMENT</span>
          <h1>My Courses</h1>
          <p>Create, manage and monitor all your courses from one place.</p>
        </div>

        <Link to="/instructor/courses/create" className="il-btn">
          <Plus size={16} /> Create New Course
        </Link>
      </div>

      {error && <div className="il-alert il-alert-error">{error}</div>}
      {notice && <div className="il-alert il-alert-info">{notice}</div>}

      <section className="il-stats">
        <div className="il-stat">
          <span>Total Courses</span>
          <strong>{courses.length}</strong>
          <small>All your courses</small>
        </div>
        <div className="il-stat">
          <span>Published</span>
          <strong>{count("published")}</strong>
          <small>Live in the catalog</small>
        </div>
        <div className="il-stat">
          <span>Drafts</span>
          <strong>{count("draft")}</strong>
          <small>Still in progress</small>
        </div>
        <div className="il-stat">
          <span>Total Students</span>
          <strong>{totalStudents}</strong>
          <small>Across all courses</small>
        </div>
      </section>

      <div className="il-toolbar">
        <input
          className="il-input"
          type="text"
          placeholder="Search by title, category or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="il-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className="il-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="il-loading">Loading your courses...</div>
      ) : filtered.length === 0 ? (
        <div className="il-card">
          <div className="il-empty">
            {courses.length === 0 ? <BookOpen size={48} color="#9ca3af" style={{ margin: "0 auto 12px" }} /> : <Search size={48} color="#9ca3af" style={{ margin: "0 auto 12px" }} />}
            <h3>{courses.length === 0 ? "No courses yet" : "No courses found"}</h3>
            <p>
              {courses.length === 0
                ? "Create your first course to start teaching."
                : "Try changing your search or filters."}
            </p>
            {courses.length === 0 ? (
              <Link to="/instructor/courses/create" className="il-btn">
                Create a course
              </Link>
            ) : (
              <button
                type="button"
                className="il-btn il-btn-outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="il-course-grid">
          {filtered.map((course) => (
            <article className="il-course-card" key={course._id}>
              <div
                className="il-course-thumb"
                style={
                  course.thumbnailUrl
                    ? { backgroundImage: `url(${course.thumbnailUrl})` }
                    : undefined
                }
              >
                {!course.thumbnailUrl && <BookOpen size={36} color="#9ca3af" />}
                <span className={`il-badge il-badge-${course.status}`}>{course.status}</span>
              </div>

              <div className="il-course-body">
                <span className="il-course-cat">{course.category?.name || "Uncategorised"}</span>
                <h3>{course.title}</h3>

                <div className="il-course-meta" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={14} color="#6b7280" /> {course.stats?.enrollmentCount || 0} students</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={14} color="#6b7280" /> {course.stats?.lessonCount || 0} lessons</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {course.stats?.ratingCount > 0
                      ? <><Star size={14} color="#f59e0b" fill="#f59e0b" /> {course.stats.ratingAvg}</>
                      : "Not rated"}
                  </span>
                </div>

                <div className="il-course-actions">
                  {course.status === "published" && (
                    <Link
                      to={`/courses/${course.slug || course._id}`}
                      className="il-btn il-btn-outline il-btn-sm"
                    >
                      View
                    </Link>
                  )}

                  <Link
                    to={`/instructor/courses/edit/${course._id}`}
                    className="il-btn il-btn-outline il-btn-sm"
                  >
                    <Edit2 size={14} /> Edit
                  </Link>

                  {course.status !== "archived" && (
                    <button
                      type="button"
                      className="il-btn il-btn-danger il-btn-sm"
                      onClick={() => handleDelete(course)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </InstructorLayout>
  );
}

export default InstructorCourses;
