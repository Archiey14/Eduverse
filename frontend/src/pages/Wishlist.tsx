import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import { Loading, Notice } from "../components/Notice";
import { formatDuration, PRICE_LABEL } from "../utils/format";
import "./Wishlist.css";

const IMAGE_CLASSES = [
  "wishlist-react",
  "wishlist-python",
  "wishlist-node",
  "wishlist-dsa",
];
const ICONS = ["⚛️", "🐍", "🟢", "🧠"];

function Wishlist() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.wishlist.getAll();
      setCourses(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your wishlist."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(courses.map((c) => c.category?.name).filter(Boolean))
      ),
    ],
    [courses]
  ) as string[];

  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return courses.filter((course) => {
      const matchesSearch =
        !query ||
        (course.title || "").toLowerCase().includes(query) ||
        (course.mentor?.name || "").toLowerCase().includes(query);
      const matchesCategory =
        category === "All" || course.category?.name === category;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, category]);

  const removeFromWishlist = async (courseId: string) => {
    setError("");
    const previous = courses;
    setCourses((current) => current.filter((c) => c._id !== courseId));
    try {
      await api.wishlist.remove(courseId);
    } catch (err) {
      setCourses(previous);
      setError(getErrorMessage(err, "Could not remove this course."));
    }
  };

  const rated = courses.filter((c) => (c.stats?.ratingCount || 0) > 0);
  const averageRating =
    rated.length > 0
      ? (
          rated.reduce((sum, c) => sum + (c.stats?.ratingAvg || 0), 0) /
          rated.length
        ).toFixed(1)
      : "—";
  const totalLessons = courses.reduce(
    (sum, c) => sum + (c.stats?.lessonCount || 0),
    0
  );

  return (
    <StudentLayout
      activeItem="wishlist"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search your wishlist..."
    >
      <section className="wishlist-header">
        <div>
          <span className="wishlist-eyebrow">YOUR COLLECTION</span>
          <h1>My Wishlist ❤️</h1>
          <p>
            Keep track of courses you want to learn and come back to them
            anytime.
          </p>
        </div>

        <Link to="/courses" className="wishlist-browse-button">
          Browse Courses
          <span>→</span>
        </Link>
      </section>

      {error && <Notice message={error} onRetry={load} />}

      {loading ? (
        <Loading label="Loading your wishlist..." />
      ) : (
        <>
          <section className="wishlist-stats">
            <div className="wishlist-stat-card">
              <div className="wishlist-stat-icon">❤️</div>
              <div>
                <span>Saved Courses</span>
                <strong>{courses.length}</strong>
              </div>
            </div>

            <div className="wishlist-stat-card">
              <div className="wishlist-stat-icon">📚</div>
              <div>
                <span>Categories</span>
                <strong>{categories.length - 1}</strong>
              </div>
            </div>

            <div className="wishlist-stat-card">
              <div className="wishlist-stat-icon">⭐</div>
              <div>
                <span>Average Rating</span>
                <strong>{averageRating}</strong>
              </div>
            </div>

            <div className="wishlist-stat-card">
              <div className="wishlist-stat-icon">📖</div>
              <div>
                <span>Total Lessons</span>
                <strong>{totalLessons}</strong>
              </div>
            </div>
          </section>

          {courses.length > 0 && (
            <section className="wishlist-toolbar">
              <div className="wishlist-results">
                <strong>{filteredCourses.length}</strong>{" "}
                {filteredCourses.length === 1 ? "course" : "courses"} saved
              </div>

              <div className="wishlist-categories">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      category === item
                        ? "wishlist-category active"
                        : "wishlist-category"
                    }
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>
          )}

          {filteredCourses.length > 0 ? (
            <section className="wishlist-grid">
              {filteredCourses.map((course, index) => {
                const stats = course.stats || {};
                const hasRatings = (stats.ratingCount || 0) > 0;

                return (
                  <article className="wishlist-course-card" key={course._id}>
                    <div
                      className={`wishlist-course-image ${
                        IMAGE_CLASSES[index % IMAGE_CLASSES.length]
                      }`}
                    >
                      <span className="wishlist-course-icon">
                        {ICONS[index % ICONS.length]}
                      </span>

                      <button
                        type="button"
                        className="wishlist-remove-button"
                        onClick={() => removeFromWishlist(course._id)}
                        title="Remove from wishlist"
                        aria-label={`Remove ${course.title} from wishlist`}
                      >
                        ♥
                      </button>

                      <span className="wishlist-saved-label">Saved</span>
                    </div>

                    <div className="wishlist-course-content">
                      <div className="wishlist-course-meta">
                        <span>{course.category?.name || "Uncategorised"}</span>
                        <span>
                          {course.level
                            ? course.level.charAt(0).toUpperCase() +
                              course.level.slice(1)
                            : "Beginner"}
                        </span>
                      </div>

                      <Link
                        to={`/courses/${course.slug || course._id}`}
                        className="wishlist-course-title"
                      >
                        {course.title}
                      </Link>

                      {course.subtitle && (
                        <p className="wishlist-course-description">
                          {course.subtitle}
                        </p>
                      )}

                      <p className="wishlist-instructor">
                        By <strong>{course.mentor?.name || "Instructor"}</strong>
                      </p>

                      <div className="wishlist-course-rating">
                        {hasRatings ? (
                          <>
                            <strong>{stats.ratingAvg}</strong>
                            <span className="stars">★★★★★</span>
                            <span>({stats.ratingCount})</span>
                          </>
                        ) : (
                          <strong>New</strong>
                        )}
                      </div>

                      <div className="wishlist-course-details">
                        <span>⏱ {formatDuration(stats.totalDurationMin)}</span>
                        <span>📖 {stats.lessonCount || 0} lessons</span>
                      </div>

                      <div className="wishlist-course-footer">
                        <div className="wishlist-price">
                          <strong>{PRICE_LABEL}</strong>
                        </div>

                        <Link
                          to={`/courses/${course.slug || course._id}`}
                          className="wishlist-view-button"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="wishlist-empty">
              <div className="wishlist-empty-icon">💔</div>
              <h2>
                {courses.length === 0
                  ? "Your wishlist is empty"
                  : "No saved courses match"}
              </h2>
              <p>
                {courses.length === 0
                  ? "Tap the heart on any course to save it here for later."
                  : "Try a different search or category."}
              </p>
              <Link to="/courses" className="wishlist-empty-button">
                Explore Courses
              </Link>
            </section>
          )}
        </>
      )}
    </StudentLayout>
  );
}

export default Wishlist;
