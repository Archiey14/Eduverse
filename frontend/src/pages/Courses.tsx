import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import StudentLayout from "../components/StudentLayout";
import { Loading, Notice } from "../components/Notice";
import { useWishlist } from "../hooks/useWishlist";
import { capitalize, formatDuration, PRICE_LABEL } from "../utils/format";
import "./Courses.css";

interface Course {
  id: string;
  slug: string;
  title: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviews: number;
  imageClass: string;
  icon: string;
  description: string;
  createdAt: number;
}

interface EnrolledCourse {
  id: string;
  courseId: string;
  title: string;
  category: string;
  progressPercent: number;
  completed: boolean;
  lastLessonTitle: string;
  completedLessonsCount: number;
  totalLessons: number;
  icon: string;
}

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const IMAGE_CLASSES = ["course-image-blue", "course-image-green", "course-image-purple"];
const ICONS = ["⚛️", "🐍", "🎨"];

function Courses() {
  const { isAuthenticated } = useAuth();
  const wishlist = useWishlist();

  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<EnrolledCourse[]>([]);
  const [currentTab, setCurrentTab] = useState<"all" | "enrolled">("all");
  const [categories, setCategories] = useState<string[]>(["All Courses"]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All Courses");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [catsRes, coursesRes, enrollmentsRes] = await Promise.all([
          api.categories.getAll(),
          api.courses.getAll({ limit: 50 }),
          isAuthenticated
            ? api.enrollments.getMyEnrollments().catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);

        if (cancelled) return;

        setCategories([
          "All Courses",
          ...(catsRes.data || []).map((c: any) => c.name),
        ]);

        setDbCourses(
          (coursesRes.data || []).map((c: any, idx: number): Course => ({
            id: c._id,
            slug: c.slug || c._id,
            title: c.title,
            instructor: c.mentor?.name || "Instructor",
            category: c.category?.name || "Uncategorised",
            level: capitalize(c.level) || "Beginner",
            duration: formatDuration(c.stats?.totalDurationMin),
            lessons: c.stats?.lessonCount || 0,
            students: c.stats?.enrollmentCount || 0,
            rating: c.stats?.ratingAvg || 0,
            reviews: c.stats?.ratingCount || 0,
            imageClass: IMAGE_CLASSES[idx % IMAGE_CLASSES.length],
            icon: ICONS[idx % ICONS.length],
            description: c.subtitle || c.description || "",
            createdAt: c.createdAt ? new Date(c.createdAt).getTime() : 0,
          }))
        );

        setMyEnrollments(
          (enrollmentsRes.data || [])
            .filter((enr: any) => enr.course)
            .map(
              (enr: any, idx: number): EnrolledCourse => ({
                id: enr._id,
                courseId: enr.course._id,
                title: enr.course.title || "Course",
                category: (enr.course.category?.name || "Uncategorised").toUpperCase(),
                progressPercent: enr.progressPercent || 0,
                completed: enr.status === "completed",
                lastLessonTitle: enr.lastLesson?.title || "Not started yet",
                completedLessonsCount: enr.completedLessons?.length || 0,
                totalLessons: enr.course.stats?.lessonCount || 0,
                icon: idx % 2 === 0 ? "💻" : "🐍",
              })
            )
        );
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err, "Could not load courses."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const filteredCourses = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();

    const filtered = dbCourses.filter((course) => {
      const matchesCategory =
        selectedCategory === "All Courses" ||
        course.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLevel =
        selectedLevel === "All Levels" ||
        course.level.toLowerCase() === selectedLevel.toLowerCase();

      const matchesSearch =
        !search ||
        course.title.toLowerCase().includes(search) ||
        course.instructor.toLowerCase().includes(search) ||
        course.category.toLowerCase().includes(search);

      return matchesCategory && matchesLevel && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating || b.reviews - a.reviews;
      if (sortBy === "newest") return b.createdAt - a.createdAt;
      return b.students - a.students; // popular
    });
  }, [dbCourses, selectedCategory, selectedLevel, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("All Courses");
    setSelectedLevel("All Levels");
    setSearchQuery("");
    setSortBy("popular");
  };

  const content = (
    <div
      className={isAuthenticated ? "courses-page in-dashboard" : "landing-page"}
      style={isAuthenticated ? {} : { minHeight: "100vh" }}
    >
      {!isAuthenticated && <Navbar />}
      <main
        className={isAuthenticated ? "" : "landing-container"}
        style={isAuthenticated ? { padding: "0px" } : { padding: "40px 0" }}
      >
        <div className="courses-content" style={{ padding: "0" }}>
          {/* Page Header */}
          <section className="courses-page-header">
            <div className="courses-header-left">
              <span className="courses-eyebrow">COURSES DIRECTORY</span>
              <h1>Course Hub</h1>
              <p>
                Explore high-quality courses, build in-demand skills
                {isAuthenticated ? ", or resume your enrolled courses." : "."}
              </p>

              {isAuthenticated && (
                <div
                  style={{
                    display: "inline-flex",
                    gap: "8px",
                    marginTop: "16px",
                    background: "#f1f5f9",
                    padding: "4px",
                    borderRadius: "10px",
                  }}
                >
                  {(
                    [
                      ["all", `Explore All Courses (${filteredCourses.length})`],
                      ["enrolled", `My Enrolled Courses (${myEnrollments.length})`],
                    ] as const
                  ).map(([tab, label]) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCurrentTab(tab)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "13.5px",
                        cursor: "pointer",
                        background: currentTab === tab ? "#ffffff" : "transparent",
                        color: currentTab === tab ? "#4f46e5" : "#64748b",
                        boxShadow:
                          currentTab === tab ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="courses-header-stat">
              <span className="header-stat-icon">📚</span>
              <div>
                <strong>{dbCourses.length}</strong>
                <span>Courses available</span>
              </div>
            </div>
          </section>

          {loadError && <Notice message={loadError} onRetry={() => window.location.reload()} />}
          {wishlist.error && <Notice message={wishlist.error} />}

          {loading ? (
            <Loading label="Loading courses..." />
          ) : (
            <>
              {/* Tab: My Enrolled Courses */}
              {isAuthenticated && currentTab === "enrolled" && (
                <div style={{ padding: "0 0 32px" }}>
                  {myEnrollments.length > 0 ? (
                    <div className="courses-grid" style={{ marginTop: "16px" }}>
                      {myEnrollments.map((enr) => (
                        <article className="course-card" key={enr.id}>
                          <div className="course-card-image course-image-blue">
                            <div className="course-image-pattern"></div>
                            <span className="course-main-icon">{enr.icon}</span>
                            <span className="course-badge bestseller">
                              {enr.completed ? "Completed" : `${enr.progressPercent}% Complete`}
                            </span>
                          </div>

                          <div className="course-card-body">
                            <div className="course-category-row">
                              <span>{enr.category}</span>
                              <span className="course-level">Enrolled</span>
                            </div>

                            <h3>{enr.title}</h3>
                            <p className="course-description">
                              Current: <strong>{enr.lastLessonTitle}</strong>
                              {enr.totalLessons > 0 &&
                                ` (${enr.completedLessonsCount} of ${enr.totalLessons} lessons completed)`}
                            </p>

                            <div style={{ margin: "14px 0" }}>
                              <div
                                style={{
                                  height: "6px",
                                  background: "#e5e7eb",
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${enr.progressPercent}%`,
                                    background: "#4f46e5",
                                    borderRadius: "10px",
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="course-card-footer">
                              <Link
                                to={`/learn/${enr.courseId}`}
                                className="course-view-button"
                                style={{ width: "100%", textAlign: "center" }}
                              >
                                {enr.completed ? "Review Course →" : "Resume Learning →"}
                              </Link>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="dashboard-empty-state"
                      style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "50px 20px",
                        border: "1px solid #e5e7eb",
                        marginTop: "16px",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: "42px", marginBottom: "12px", display: "block" }}>
                        🎓
                      </span>
                      <strong style={{ fontSize: "18px", color: "#1f2937", display: "block" }}>
                        No enrolled courses yet
                      </strong>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          margin: "8px auto 20px",
                          maxWidth: "420px",
                        }}
                      >
                        You haven't enrolled in any courses yet. Explore the catalog to start
                        learning right now.
                      </p>
                      <button
                        type="button"
                        className="dashboard-primary-button"
                        onClick={() => setCurrentTab("all")}
                        style={{ display: "inline-flex", margin: "0 auto" }}
                      >
                        Browse All Courses →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: All Courses Catalog */}
              {(!isAuthenticated || currentTab === "all") && (
                <div>
                  <section className="course-search-section">
                    <div className="course-search-box">
                      <span className="course-search-icon">⌕</span>
                      <input
                        type="text"
                        placeholder="Filter by keyword, topic or instructor..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          className="clear-search"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`mobile-filter-button ${showFilters ? "active" : ""}`}
                      onClick={() => setShowFilters((value) => !value)}
                    >
                      ☷ <span>Filters</span>
                    </button>
                  </section>

                  <div className="courses-layout">
                    <aside className={`courses-filters ${showFilters ? "filters-visible" : ""}`}>
                      <div className="filters-header">
                        <h2>Filters</h2>
                        <button type="button" onClick={resetFilters}>
                          Reset
                        </button>
                      </div>

                      <div className="filter-group">
                        <h3>Categories</h3>
                        <div className="filter-options">
                          {categories.map((category) => (
                            <button
                              type="button"
                              key={category}
                              className={`filter-option ${
                                selectedCategory === category ? "selected" : ""
                              }`}
                              onClick={() => setSelectedCategory(category)}
                            >
                              <span
                                className={`filter-radio ${
                                  selectedCategory === category ? "checked" : ""
                                }`}
                              ></span>
                              <span>{category}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="filter-group">
                        <h3>Level</h3>
                        <div className="filter-options">
                          {levels.map((level) => (
                            <button
                              type="button"
                              key={level}
                              className={`filter-option ${
                                selectedLevel === level ? "selected" : ""
                              }`}
                              onClick={() => setSelectedLevel(level)}
                            >
                              <span
                                className={`filter-radio ${
                                  selectedLevel === level ? "checked" : ""
                                }`}
                              ></span>
                              <span>{level}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </aside>

                    <section className="course-results">
                      <div className="course-results-header">
                        <div>
                          <h2>All Courses</h2>
                          <p>
                            Showing <strong>{filteredCourses.length}</strong> courses
                          </p>
                        </div>

                        <div className="sort-wrapper">
                          <label htmlFor="course-sort">Sort by</label>
                          <select
                            id="course-sort"
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value)}
                          >
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="newest">Newest</option>
                          </select>
                        </div>
                      </div>

                      {filteredCourses.length > 0 ? (
                        <div className="courses-grid">
                          {filteredCourses.map((course) => {
                            const saved = wishlist.has(course.id);
                            return (
                              <article className="course-card" key={course.id}>
                                <div className={`course-card-image ${course.imageClass}`}>
                                  <div className="course-image-pattern"></div>
                                  <span className="course-main-icon">{course.icon}</span>

                                  <button
                                    type="button"
                                    className={`course-wishlist ${saved ? "saved" : ""}`}
                                    onClick={() => wishlist.toggle(course.id)}
                                    aria-label={
                                      saved
                                        ? `Remove ${course.title} from wishlist`
                                        : `Save ${course.title} to wishlist`
                                    }
                                    aria-pressed={saved}
                                  >
                                    {saved ? "♥" : "♡"}
                                  </button>
                                </div>

                                <div className="course-card-body">
                                  <div className="course-category-row">
                                    <span>{course.category}</span>
                                    <span className="course-level">{course.level}</span>
                                  </div>

                                  <h3>{course.title}</h3>
                                  <p className="course-description">{course.description}</p>

                                  <div className="course-instructor">
                                    <span className="instructor-avatar">
                                      {course.instructor.charAt(0)}
                                    </span>
                                    <span>{course.instructor}</span>
                                  </div>

                                  <div className="course-rating-row">
                                    {course.reviews > 0 ? (
                                      <>
                                        <strong>{course.rating}</strong>
                                        <span className="stars">★★★★★</span>
                                        <span className="review-count">({course.reviews})</span>
                                      </>
                                    ) : (
                                      <span className="review-count">No ratings yet</span>
                                    )}
                                  </div>

                                  <div className="course-meta-row">
                                    <span>◷ {course.duration}</span>
                                    <span>▤ {course.lessons} lessons</span>
                                    <span>♙ {course.students.toLocaleString()}</span>
                                  </div>

                                  <div className="course-card-footer">
                                    <div className="course-price">
                                      <strong>{PRICE_LABEL}</strong>
                                    </div>

                                    <Link
                                      to={`/courses/${course.slug}`}
                                      className="course-view-button"
                                    >
                                      View Course
                                    </Link>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="no-courses">
                          <span>🔎</span>
                          <h3>{dbCourses.length === 0 ? "No courses yet" : "No courses found"}</h3>
                          <p>
                            {dbCourses.length === 0
                              ? "No courses have been published yet. Please check back soon."
                              : "We couldn't find any courses matching your search and filters."}
                          </p>
                          {dbCourses.length > 0 && (
                            <button type="button" onClick={resetFilters}>
                              Clear Filters
                            </button>
                          )}
                        </div>
                      )}
                    </section>
                  </div>
                </div>
              )}
            </>
          )}

          <footer className="courses-footer">
            <span>© 2026 Eduverse. Keep learning, keep growing.</span>
            <div>
              <Link to="/courses">Courses</Link>
              <Link to="/student/dashboard">Dashboard</Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );

  return isAuthenticated ? (
    <StudentLayout activeItem="catalog">{content}</StudentLayout>
  ) : (
    content
  );
}

export default Courses;
