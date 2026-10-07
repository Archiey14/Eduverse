import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
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
    description: "Build modern, scalable web applications using React and TypeScript.",
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
    description: "Learn Python from the basics and build real-world data applications.",
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
    description: "Master JavaScript fundamentals and advanced concepts through practical projects.",
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
    description: "Learn user-centered design principles and create beautiful digital experiences.",
  },
  {
    id: "5",
    title: "Node.js & Express Backend Development",
    instructor: "James Anderson",
    category: "Backend Development",
    level: "Intermediate",
    duration: "16h 20m",
    lessons: 38,
    students: 1456,
    rating: 4.8,
    reviews: 341,
    price: 44,
    originalPrice: 72,
    imageClass: "course-image-teal",
    icon: "🟢",
    description: "Build powerful REST APIs and server-side applications with Node.js and Express.",
    newCourse: true,
  },
  {
    id: "6",
    title: "MongoDB Database Essentials",
    instructor: "Daniel Martinez",
    category: "Database",
    level: "Intermediate",
    duration: "10h 35m",
    lessons: 28,
    students: 876,
    rating: 4.7,
    reviews: 194,
    price: 32,
    originalPrice: 55,
    imageClass: "course-image-dark-green",
    icon: "🍃",
    description: "Understand MongoDB, database design, queries, indexes, and application integration.",
  },
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

function Courses() {
  const { user } = useAuth();

  const [dbCourses, setDbCourses] = useState<Course[]>([]);
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
        const [catsRes, coursesRes] = await Promise.all([
          api.categories.getAll(),
          api.courses.getAll(),
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
            level: c.level ? c.level.charAt(0).toUpperCase() + c.level.slice(1) : "Beginner",
            duration: `${c.stats?.totalDurationMin || 45}m`,
            lessons: c.stats?.lessonCount || 10,
            students: c.stats?.enrollmentCount || 120,
            rating: c.stats?.ratingAvg || 4.9,
            reviews: c.stats?.ratingCount || 15,
            price: 49,
            originalPrice: 79,
            imageClass: idx % 3 === 0 ? "course-image-blue" : idx % 3 === 1 ? "course-image-green" : "course-image-purple",
            icon: idx % 2 === 0 ? "⚛️" : "🐍",
            description: c.description,
            bestseller: true,
          }));
          setDbCourses(mapped);
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
      filtered = [...filtered].sort((a, b) => Number(b.newCourse) - Number(a.newCourse));
    }

    return filtered;
  }, [coursesToFilter, selectedCategory, selectedLevel, searchQuery, sortBy]);

  const toggleWishlist = (courseId: string | number) => {
    setWishlist((curr) =>
      curr.includes(courseId) ? curr.filter((id) => id !== courseId) : [...curr, courseId]
    );
  };

  const resetFilters = () => {
    setSelectedCategory("All Courses");
    setSelectedLevel("All Levels");
    setSearchQuery("");
    setSortBy("popular");
  };

  const displayName = user?.name || "Alex Rivera";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="courses-page">
      {/* ================================
          SIDEBAR
          ================================= */}

      <aside className="courses-sidebar">
        <div className="courses-brand">
          <Link to="/student/dashboard" className="courses-brand-link">
            <span className="courses-brand-icon">L</span>
            <span className="courses-brand-text">LearnHub</span>
          </Link>
        </div>

        <nav className="courses-navigation">
          <p className="courses-nav-title">MAIN MENU</p>

          <Link to="/student/dashboard" className="courses-nav-item">
            <span className="courses-nav-icon">▦</span>
            <span>Dashboard</span>
          </Link>

          <Link to="/courses" className="courses-nav-item active">
            <span className="courses-nav-icon">▤</span>
            <span>Courses</span>
          </Link>

          <Link to="/discover" className="courses-nav-item">
            <span className="courses-nav-icon">⌕</span>
            <span>Discover</span>
          </Link>

          <Link to="/quizzes" className="courses-nav-item">
            <span className="courses-nav-icon">✓</span>
            <span>Quizzes</span>
          </Link>

          <Link to="/progress" className="courses-nav-item">
            <span className="courses-nav-icon">◔</span>
            <span>My Progress</span>
          </Link>

          <p className="courses-nav-title second-title">LEARNING</p>

          <Link to="/activities" className="courses-nav-item">
            <span className="courses-nav-icon">◷</span>
            <span>Activities</span>
          </Link>

          <Link to="/progress" className="courses-nav-item">
            <span className="courses-nav-icon">♛</span>
            <span>Achievements</span>
          </Link>
        </nav>

        <div className="courses-sidebar-bottom">
          <Link to="/student/dashboard" className="courses-profile-link">
            <span className="courses-avatar">{userInitial}</span>
            <span>
              <strong>{displayName}</strong>
              <small>Student</small>
            </span>
          </Link>
        </div>
      </aside>

      {/* ================================
          MAIN CONTENT
          ================================= */}

      <main className="courses-main">
        {/* Topbar */}
        <header className="courses-topbar">
          <div className="courses-breadcrumb">
            <Link to="/student/dashboard">Dashboard</Link>
            <span>/</span>
            <strong>Courses</strong>
          </div>
        </header>

        <div className="courses-content">
          {/* Header */}
          <section className="courses-page-header">
            <div className="courses-header-left">
              <span className="courses-eyebrow">EXPLORE COURSES</span>
              <h1>Find Your Next Course</h1>
              <p>Explore high-quality courses and build your skills step by step.</p>
            </div>

            <div className="courses-header-stat">
              <span className="header-stat-icon">📚</span>
              <div>
                <strong>{filteredCourses.length}+</strong>
                <span>Courses available</span>
              </div>
            </div>
          </section>

          {/* Search */}
          <section className="course-search-section">
            <div className="course-search-box">
              <span className="course-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search for courses, topics or instructors..."
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
            {/* Filter Sidebar */}
            <aside className={`courses-filters ${showFilters ? "filters-visible" : ""}`}>
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
                      className={`filter-option ${selectedCategory === category ? "selected" : ""}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <span className={`filter-radio ${selectedCategory === category ? "checked" : ""}`}></span>
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
                      className={`filter-option ${selectedLevel === level ? "selected" : ""}`}
                      onClick={() => setSelectedLevel(level)}
                    >
                      <span className={`filter-radio ${selectedLevel === level ? "checked" : ""}`}></span>
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
                      <div className={`course-card-image ${course.imageClass}`}>
                        <div className="course-image-pattern"></div>
                        <span className="course-main-icon">{course.icon}</span>

                        {course.bestseller && (
                          <span className="course-badge bestseller">Bestseller</span>
                        )}

                        <button
                          type="button"
                          className={`course-wishlist ${wishlist.includes(course.id) ? "saved" : ""}`}
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
                        <p className="course-description">{course.description}</p>

                        <div className="course-instructor">
                          <span className="instructor-avatar">
                            {course.instructor.charAt(0)}
                          </span>
                          <span>{course.instructor}</span>
                        </div>

                        <div className="course-rating-row">
                          <strong>{course.rating}</strong>
                          <span className="stars">★★★★★</span>
                          <span className="review-count">({course.reviews})</span>
                        </div>

                        <div className="course-meta-row">
                          <span>◷ {course.duration}</span>
                          <span>▤ {course.lessons} lessons</span>
                          <span>♙ {course.students.toLocaleString()}</span>
                        </div>

                        <div className="course-card-footer">
                          <div className="course-price">
                            <strong>${course.price}</strong>
                            {course.originalPrice && <del>${course.originalPrice}</del>}
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
                  <p>We couldn't find any courses matching your search and filters.</p>
                  <button type="button" onClick={resetFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="courses-footer">
          <span>© 2026 LearnHub. Keep learning, keep growing.</span>
          <div>
            <Link to="/courses">Courses</Link>
            <Link to="/student/dashboard">Dashboard</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Courses;
