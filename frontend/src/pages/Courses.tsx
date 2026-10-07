import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import "./Courses.css";

interface Course {
  id: string | number;
  title: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviews: number;
  price: number | string;
  originalPrice?: number;
  imageClass: string;
  icon: string;
  description: string;
  bestseller?: boolean;
  newCourse?: boolean;
}

interface EnrolledCourse {
  id: string;
  courseId: string;
  title: string;
  instructor: string;
  category: string;
  progressPercent: number;
  lastLessonTitle?: string;
  completedLessonsCount: number;
  totalLessons: number;
  duration: string;
  icon: string;
  colorClass: string;
}

const defaultCourses: Course[] = [
  {
    id: "1",
    title: "Complete React & TypeScript Development",
    instructor: "Sarah Johnson",
    category: "Web Development",
    level: "Intermediate",
    duration: "18h 30m",
    lessons: 42,
    students: 1248,
    rating: 4.9,
    reviews: 326,
    price: 49,
    originalPrice: 79,
    imageClass: "course-image-blue",
    icon: "⚛️",
    description:
      "Build modern, scalable web applications using React and TypeScript.",
    bestseller: true,
  },
  {
    id: "2",
    title: "Python for Data Science & Machine Learning",
    instructor: "David Wilson",
    category: "Data Science",
    level: "Beginner",
    duration: "24h 10m",
    lessons: 64,
    students: 3421,
    rating: 4.9,
    reviews: 784,
    price: 45,
    originalPrice: 75,
    imageClass: "course-image-green",
    icon: "🐍",
    description:
      "Learn Python from the basics and build real-world data applications.",
    bestseller: true,
  },
  {
    id: "3",
    title: "JavaScript From Beginner to Advanced",
    instructor: "Michael Brown",
    category: "Web Development",
    level: "Beginner",
    duration: "21h 15m",
    lessons: 56,
    students: 2156,
    rating: 4.8,
    reviews: 512,
    price: 39,
    originalPrice: 69,
    imageClass: "course-image-yellow",
    icon: "JS",
    description:
      "Master JavaScript fundamentals and advanced concepts through practical projects.",
    bestseller: true,
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    instructor: "Emily Carter",
    category: "Design",
    level: "Beginner",
    duration: "12h 45m",
    lessons: 31,
    students: 987,
    rating: 4.7,
    reviews: 218,
    price: 35,
    originalPrice: 59,
    imageClass: "course-image-purple",
    icon: "🎨",
    description:
      "Learn user-centered design principles and create beautiful digital experiences.",
  },
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

function Courses() {
  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<EnrolledCourse[]>([]);
  const [currentTab, setCurrentTab] = useState<"all" | "enrolled">("all");
  const [categories, setCategories] = useState<string[]>([
    "All Courses",
    "Web Development",
    "Data Science",
    "Design",
    "Backend Development",
    "Database",
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All Courses");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<(string | number)[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const [catsRes, coursesRes, enrollmentsRes] = await Promise.all([
          api.categories.getAll(),
          api.courses.getAll(),
          api.enrollments.getMyEnrollments().catch(() => ({ data: [] })),
        ]);

        if (catsRes.data && catsRes.data.length > 0) {
          setCategories(["All Courses", ...catsRes.data.map((c: any) => c.name)]);
        }

        if (coursesRes.data && coursesRes.data.length > 0) {
          const mapped = coursesRes.data.map((c: any, idx: number) => ({
            id: c._id || c.slug,
            title: c.title,
            instructor: c.mentor?.name || "Lead Instructor",
            category: c.category?.name || "Web Development",
            level: c.level
              ? c.level.charAt(0).toUpperCase() + c.level.slice(1)
              : "Beginner",
            duration: `${c.stats?.totalDurationMin || 45}m`,
            lessons: c.stats?.lessonCount || 10,
            students: c.stats?.enrollmentCount || 120,
            rating: c.stats?.ratingAvg || 4.9,
            reviews: c.stats?.ratingCount || 15,
            price: 49,
            originalPrice: 79,
            imageClass:
              idx % 3 === 0
                ? "course-image-blue"
                : idx % 3 === 1
                ? "course-image-green"
                : "course-image-purple",
            icon: idx % 2 === 0 ? "⚛️" : "🐍",
            description: c.description,
            bestseller: true,
          }));
          setDbCourses(mapped);
        }

        if (enrollmentsRes.data && Array.isArray(enrollmentsRes.data)) {
          const mappedEnr = enrollmentsRes.data.map(
            (enr: any, idx: number) => ({
              id: enr._id,
              courseId: enr.course?._id || enr.course?.slug || enr._id,
              title: enr.course?.title || "Course",
              instructor: enr.course?.mentor?.name || "Instructor",
              category: (
                enr.course?.category?.name || "Web Development"
              ).toUpperCase(),
              progressPercent: enr.progressPercent || 0,
              lastLessonTitle: enr.lastLesson?.title || "Next Lesson",
              completedLessonsCount: enr.completedLessons?.length || 0,
              totalLessons: enr.course?.stats?.lessonCount || 8,
              duration: `${enr.course?.stats?.totalDurationMin || 45}m`,
              icon: idx % 2 === 0 ? "💻" : "🐍",
              colorClass:
                idx % 3 === 0
                  ? "course-blue"
                  : idx % 3 === 1
                  ? "course-purple"
                  : "course-green",
            })
          );
          setMyEnrollments(mappedEnr);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };

    loadCourses();
  }, []);

  const coursesToFilter = dbCourses.length > 0 ? dbCourses : defaultCourses;

  const filteredCourses = useMemo(() => {
    let filtered = coursesToFilter.filter((course) => {
      const matchesCategory =
        selectedCategory === "All Courses" ||
        course.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLevel =
        selectedLevel === "All Levels" ||
        course.level.toLowerCase() === selectedLevel.toLowerCase();

      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !search ||
        course.title.toLowerCase().includes(search) ||
        course.instructor.toLowerCase().includes(search) ||
        course.category.toLowerCase().includes(search);

      return matchesCategory && matchesLevel && matchesSearch;
    });

    if (sortBy === "rating") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === "newest") {
      filtered = [...filtered].sort(
        (a, b) => Number(b.newCourse) - Number(a.newCourse)
      );
    }

    return filtered;
  }, [coursesToFilter, selectedCategory, selectedLevel, searchQuery, sortBy]);

  const toggleWishlist = (courseId: string | number) => {
    setWishlist((curr) =>
      curr.includes(courseId)
        ? curr.filter((id) => id !== courseId)
        : [...curr, courseId]
    );
  };

  const resetFilters = () => {
    setSelectedCategory("All Courses");
    setSelectedLevel("All Levels");
    setSearchQuery("");
    setSortBy("popular");
  };

  return (
    <div className="landing-page">
      <Navbar />
      <main className="landing-container" style={{ padding: "40px 0" }}>
        <div className="courses-content" style={{ padding: "0" }}>
        {/* Page Header */}
        <section className="courses-page-header">
          <div className="courses-header-left">
            <span className="courses-eyebrow">COURSES DIRECTORY</span>
            <h1>Course Hub</h1>
            <p>
              Explore high-quality courses, build in-demand skills, or resume your
              enrolled courses.
            </p>

            {/* Tab selection */}
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
              <button
                type="button"
                onClick={() => setCurrentTab("all")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  background: currentTab === "all" ? "#ffffff" : "transparent",
                  color: currentTab === "all" ? "#4f46e5" : "#64748b",
                  boxShadow:
                    currentTab === "all"
                      ? "0 2px 8px rgba(0, 0, 0, 0.06)"
                      : "none",
                  transition: "all 0.2s ease",
                }}
              >
                Explore All Courses ({filteredCourses.length})
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab("enrolled")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  background: currentTab === "enrolled" ? "#ffffff" : "transparent",
                  color: currentTab === "enrolled" ? "#4f46e5" : "#64748b",
                  boxShadow:
                    currentTab === "enrolled"
                      ? "0 2px 8px rgba(0, 0, 0, 0.06)"
                      : "none",
                  transition: "all 0.2s ease",
                }}
              >
                My Enrolled Courses ({myEnrollments.length})
              </button>
            </div>
          </div>

          <div className="courses-header-stat">
            <span className="header-stat-icon">📚</span>
            <div>
              <strong>{filteredCourses.length}+</strong>
              <span>Courses available</span>
            </div>
          </div>
        </section>

        {/* Tab 1: My Enrolled Courses */}
        {currentTab === "enrolled" && (
          <div style={{ padding: "0 0 32px" }}>
            {myEnrollments.length > 0 ? (
              <div className="courses-grid" style={{ marginTop: "16px" }}>
                {myEnrollments.map((enr) => (
                  <article className="course-card" key={enr.id}>
                    <div className="course-card-image course-image-blue">
                      <div className="course-image-pattern"></div>
                      <span className="course-main-icon">{enr.icon}</span>
                      <span className="course-badge bestseller">
                        {enr.progressPercent}% Complete
                      </span>
                    </div>

                    <div className="course-card-body">
                      <div className="course-category-row">
                        <span>{enr.category}</span>
                        <span className="course-level">Enrolled</span>
                      </div>

                      <h3>{enr.title}</h3>
                      <p className="course-description">
                        Current: <strong>{enr.lastLessonTitle}</strong> (
                        {enr.completedLessonsCount} of {enr.totalLessons} lessons
                        completed)
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
                          Resume Learning →
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
                  You haven't enrolled in any courses yet. Explore our curated
                  courses catalog below to start learning right now.
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

        {/* Tab 2: All Courses Catalog */}
        {currentTab === "all" && (
          <div>
            {/* Search and filter controls */}
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
                className={`mobile-filter-button ${
                  showFilters ? "active" : ""
                }`}
                onClick={() => setShowFilters((value) => !value)}
              >
                ☷ <span>Filters</span>
              </button>
            </section>

            <div className="courses-layout">
              {/* Filter Sidebar */}
              <aside
                className={`courses-filters ${
                  showFilters ? "filters-visible" : ""
                }`}
              >
                <div className="filters-header">
                  <h2>Filters</h2>
                  <button type="button" onClick={resetFilters}>
                    Reset
                  </button>
                </div>

                {/* Categories */}
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

                {/* Levels */}
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

              {/* Course Results */}
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
                    {filteredCourses.map((course) => (
                      <article className="course-card" key={course.id}>
                        <div
                          className={`course-card-image ${course.imageClass}`}
                        >
                          <div className="course-image-pattern"></div>
                          <span className="course-main-icon">{course.icon}</span>

                          {course.bestseller && (
                            <span className="course-badge bestseller">
                              Bestseller
                            </span>
                          )}

                          <button
                            type="button"
                            className={`course-wishlist ${
                              wishlist.includes(course.id) ? "saved" : ""
                            }`}
                            onClick={() => toggleWishlist(course.id)}
                            aria-label={`Wishlist ${course.title}`}
                          >
                            {wishlist.includes(course.id) ? "♥" : "♡"}
                          </button>
                        </div>

                        <div className="course-card-body">
                          <div className="course-category-row">
                            <span>{course.category}</span>
                            <span className="course-level">{course.level}</span>
                          </div>

                          <h3>{course.title}</h3>
                          <p className="course-description">
                            {course.description}
                          </p>

                          <div className="course-instructor">
                            <span className="instructor-avatar">
                              {course.instructor.charAt(0)}
                            </span>
                            <span>{course.instructor}</span>
                          </div>

                          <div className="course-rating-row">
                            <strong>{course.rating}</strong>
                            <span className="stars">★★★★★</span>
                            <span className="review-count">
                              ({course.reviews})
                            </span>
                          </div>

                          <div className="course-meta-row">
                            <span>◷ {course.duration}</span>
                            <span>▤ {course.lessons} lessons</span>
                            <span>♙ {course.students.toLocaleString()}</span>
                          </div>

                          <div className="course-card-footer">
                            <div className="course-price">
                              <strong>${course.price}</strong>
                              {course.originalPrice && (
                                <del>${course.originalPrice}</del>
                              )}
                            </div>

                            <Link
                              to={`/courses/${course.id}`}
                              className="course-view-button"
                            >
                              View Course
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="no-courses">
                    <span>🔎</span>
                    <h3>No courses found</h3>
                    <p>
                      We couldn't find any courses matching your search and
                      filters.
                    </p>
                    <button type="button" onClick={resetFilters}>
                      Clear Filters
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="courses-footer">
          <span>© 2026 LearnHub. Keep learning, keep growing.</span>
          <div>
            <Link to="/courses">Courses</Link>
            <Link to="/student/dashboard">Dashboard</Link>
          </div>
        </footer>
      </div>
      </main>
    </div>
  );
}

export default Courses;
