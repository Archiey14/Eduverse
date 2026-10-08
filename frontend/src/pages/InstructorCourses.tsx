
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./InstructorCourses.css";

interface Course {
  id: string | number;
  title: string;
  category: string;
  description: string;
  students: number;
  lessons: number;
  rating: number;
  status: "Published" | "Draft";
  updated: string;
  image: string;
}

const initialCourses: Course[] = [
  {
    id: 1,
    title: "Complete React & TypeScript",
    category: "Web Development",
    description:
      "Learn React and TypeScript from the fundamentals to building professional modern applications.",
    students: 248,
    lessons: 32,
    rating: 4.9,
    status: "Published",
    updated: "2 days ago",
    image: "⚛️",
  },
  {
    id: 2,
    title: "JavaScript Fundamentals",
    category: "Programming",
    description:
      "Master JavaScript fundamentals, modern syntax, functions, objects, arrays, and asynchronous programming.",
    students: 186,
    lessons: 28,
    rating: 4.8,
    status: "Published",
    updated: "5 days ago",
    image: "🟨",
  },
  {
    id: 3,
    title: "Modern CSS Masterclass",
    category: "Web Design",
    description:
      "Build beautiful responsive websites using modern CSS, Flexbox, Grid, animations, and responsive design.",
    students: 124,
    lessons: 24,
    rating: 4.7,
    status: "Published",
    updated: "1 week ago",
    image: "🎨",
  },
  {
    id: 4,
    title: "Node.js & Express",
    category: "Backend Development",
    description:
      "Learn how to build scalable backend applications and REST APIs using Node.js and Express.",
    students: 0,
    lessons: 18,
    rating: 0,
    status: "Draft",
    updated: "3 days ago",
    image: "🟢",
  },
  {
    id: 5,
    title: "MongoDB for Developers",
    category: "Database",
    description:
      "Understand MongoDB, collections, queries, aggregation, indexing, and database design.",
    students: 76,
    lessons: 20,
    rating: 4.6,
    status: "Published",
    updated: "2 weeks ago",
    image: "🍃",
  },
  {
    id: 6,
    title: "Full Stack Web Development",
    category: "Web Development",
    description:
      "Learn how frontend and backend technologies work together to create complete full-stack applications.",
    students: 0,
    lessons: 12,
    rating: 0,
    status: "Draft",
    updated: "Yesterday",
    image: "💻",
  },
];

function InstructorCourses() {
  const navigate = useNavigate();

  const { logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.mentor.getMyCourses({ limit: 50 });
        if (res.data && res.data.length > 0) {
          const mapped: Course[] = res.data.map((c: any) => ({
            id: c._id,
            title: c.title,
            category: c.category?.name || "General",
            description: c.description || "",
            students: c.stats?.enrollmentCount || 0,
            lessons: c.stats?.lessonCount || 0,
            rating: c.stats?.ratingAvg || 0,
            status: c.status === "published" ? "Published" : "Draft",
            updated: c.updatedAt
              ? new Date(c.updatedAt).toLocaleDateString()
              : "Recently",
            image: "📚",
          }));
          setCourses(mapped);
        }
      } catch (err) {
        console.warn("Could not load backend courses:", err);
      }
    };
    loadCourses();
  }, []);

  /* ============================================
     DERIVED DATA
  ============================================ */

  const publishedCount = useMemo(
    () =>
      courses.filter((course) => course.status === "Published")
        .length,
    [courses]
  );

  const draftCount = useMemo(
    () =>
      courses.filter((course) => course.status === "Draft").length,
    [courses]
  );

  const totalStudents = useMemo(
    () =>
      courses.reduce(
        (total, course) => total + course.students,
        0
      ),
    [courses]
  );

  const categories = useMemo(() => {
    return Array.from(
      new Set(courses.map((course) => course.category))
    );
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        course.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        course.category
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        course.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        course.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    courses,
    searchTerm,
    statusFilter,
    categoryFilter,
  ]);

  /* ============================================
     HANDLERS
  ============================================ */

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    const course = courses.find(
      (item) => item.id === courseId
    );

    if (!course) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"?`
    );

    if (!confirmed) {
      return;
    }

    if (typeof courseId === "string" && courseId.length === 24) {
      try {
        await api.mentor.deleteCourse(courseId);
      } catch (err) {
        alert(getErrorMessage(err, "Failed to delete course."));
        return;
      }
    }

    setCourses((currentCourses) =>
      currentCourses.filter(
        (item) => item.id !== courseId
      )
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCategoryFilter("All");
  };

  return (
    <div className="instructor-courses-page">
      {/* ============================================
          SIDEBAR
      ============================================ */}

      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <div className="instructor-brand-icon">L</div>

          <div className="instructor-brand-text">
            <span className="instructor-brand-title">
              LearnHub
            </span>

            <span className="instructor-brand-subtitle">
              Instructor Portal
            </span>
          </div>
        </div>

        <nav className="instructor-navigation">
          <div className="instructor-nav-section">
            <span className="instructor-nav-label">
              MAIN
            </span>

            <Link
              to="/instructor/dashboard"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                📊
              </span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/instructor/courses"
              className="instructor-nav-link active"
            >
              <span className="instructor-nav-icon">
                📚
              </span>
              <span>My Courses</span>
            </Link>

            <Link
              to="/instructor/courses/create"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                ➕
              </span>
              <span>Create Course</span>
            </Link>

            <Link
              to="/instructor/students"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                👥
              </span>
              <span>My Students</span>
            </Link>
          </div>

          <div className="instructor-nav-section">
            <span className="instructor-nav-label">
              MANAGEMENT
            </span>

            <Link
              to="/instructor/quizzes"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                📝
              </span>
              <span>Quizzes</span>
            </Link>

            <Link
              to="/instructor/analytics"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                📈
              </span>
              <span>Analytics</span>
            </Link>

            <Link
              to="/instructor/reviews"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                ⭐
              </span>
              <span>Reviews</span>
            </Link>
          </div>

          <div className="instructor-nav-section">
            <span className="instructor-nav-label">
              ACCOUNT
            </span>

            <Link
              to="/profile"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                👤
              </span>
              <span>Profile</span>
            </Link>

            <Link
              to="/settings"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                ⚙️
              </span>
              <span>Settings</span>
            </Link>

            <Link
              to="/help"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                ❓
              </span>
              <span>Help & Support</span>
            </Link>
          </div>
        </nav>

        <div className="instructor-sidebar-bottom">
          <div className="instructor-support-card">
            <div className="instructor-support-icon">
              💬
            </div>

            <div>
              <strong>Need Help?</strong>
              <span>Contact our support team</span>
            </div>
          </div>

          <button
            type="button"
            className="instructor-logout"
            onClick={handleLogout}
          >
            <span className="instructor-nav-icon">
              🚪
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ============================================
          MAIN
      ============================================ */}

      <main className="instructor-courses-main">
        {/* TOPBAR */}

        <header className="instructor-courses-topbar">
          <div className="instructor-courses-breadcrumb">
            <span>Instructor</span>
            <span className="breadcrumb-separator">
              /
            </span>
            <strong>My Courses</strong>
          </div>

          <div className="instructor-courses-topbar-right">
            <button
              type="button"
              className="instructor-courses-notification"
              aria-label="Notifications"
              onClick={() =>
                navigate("/notifications")
              }
            >
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="instructor-courses-profile-wrapper">
              <button
                type="button"
                className="instructor-courses-profile-button"
                onClick={() =>
                  setShowProfileMenu(
                    (previous) => !previous
                  )
                }
              >
                <div className="instructor-courses-avatar">
                  AY
                </div>

                <div className="instructor-courses-user-info">
                  <strong>Archie Yadav</strong>
                  <span>Instructor</span>
                </div>

                <span className="instructor-courses-profile-chevron">
                  {showProfileMenu ? "▲" : "▼"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="instructor-courses-profile-menu">
                  <Link
                    to="/profile"
                    onClick={() =>
                      setShowProfileMenu(false)
                    }
                  >
                    View Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() =>
                      setShowProfileMenu(false)
                    }
                  >
                    Settings
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <section className="instructor-courses-content">
          {/* HEADER */}

          <div className="instructor-courses-header">
            <div className="instructor-courses-header-text">
              <span>COURSE MANAGEMENT</span>

              <h1>My Courses</h1>

              <p>
                Create, manage, and monitor all your courses
                from one place. Keep your content organized
                and provide your students with a great
                learning experience.
              </p>
            </div>

            <Link
              to="/instructor/courses/create"
              className="create-course-button"
            >
              <span>＋</span>
              Create New Course
            </Link>
          </div>

          {/* STATISTICS */}

          <section className="instructor-courses-stats">
            <div className="instructor-courses-stat-card">
              <div className="instructor-courses-stat-icon total">
                📚
              </div>

              <div className="instructor-courses-stat-content">
                <span>Total Courses</span>
                <strong>{courses.length}</strong>
                <small>All your courses</small>
              </div>
            </div>

            <div className="instructor-courses-stat-card">
              <div className="instructor-courses-stat-icon published">
                ✓
              </div>

              <div className="instructor-courses-stat-content">
                <span>Published</span>
                <strong>{publishedCount}</strong>
                <small>Live courses</small>
              </div>
            </div>

            <div className="instructor-courses-stat-card">
              <div className="instructor-courses-stat-icon draft">
                📝
              </div>

              <div className="instructor-courses-stat-content">
                <span>Drafts</span>
                <strong>{draftCount}</strong>
                <small>Courses in progress</small>
              </div>
            </div>

            <div className="instructor-courses-stat-card">
              <div className="instructor-courses-stat-icon students">
                👥
              </div>

              <div className="instructor-courses-stat-content">
                <span>Total Students</span>
                <strong>{totalStudents}</strong>
                <small>Across published courses</small>
              </div>
            </div>
          </section>

          {/* SEARCH + FILTER */}

          <div className="instructor-courses-toolbar">
            <div className="instructor-courses-search">
              <span className="instructor-courses-search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search courses by title, category, or description..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <select
              className="instructor-courses-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter courses by status"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>

            <select
              className="instructor-courses-filter"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              aria-label="Filter courses by category"
            >
              <option value="All">All Categories</option>

              {categories.map((category) => (
                <option
                  value={category}
                  key={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* COURSE GRID */}

          <div className="instructor-courses-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <article
                  className="instructor-course-card"
                  key={course.id}
                >
                  {/* IMAGE */}

                  <div className="instructor-course-image">
                    <span>{course.image}</span>

                    <span
                      className={`instructor-course-status ${
                        course.status === "Published"
                          ? "published"
                          : "draft"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  {/* CONTENT */}

                  <div className="instructor-course-card-content">
                    <span className="instructor-course-category">
                      {course.category}
                    </span>

                    <h2>{course.title}</h2>

                    <p className="instructor-course-description">
                      {course.description}
                    </p>

                    {/* META */}

                    <div className="instructor-course-meta">
                      <div className="instructor-course-meta-item">
                        <span>Students</span>
                        <strong>
                          {course.students}
                        </strong>
                      </div>

                      <div className="instructor-course-meta-item">
                        <span>Lessons</span>
                        <strong>
                          {course.lessons}
                        </strong>
                      </div>

                      <div className="instructor-course-meta-item">
                        <span>Rating</span>
                        <strong>
                          {course.rating > 0
                            ? `⭐ ${course.rating}`
                            : "Not rated"}
                        </strong>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="instructor-course-actions">
                      <Link
                        to={`/courses/${course.id}`}
                        className="instructor-course-view"
                      >
                        View Course
                      </Link>

                      <Link
                        to={`/instructor/courses/edit/${course.id}`}
                        className="instructor-course-edit"
                        aria-label={`Edit ${course.title}`}
                        title="Edit course"
                      >
                        ✏️
                      </Link>

                      <button
                        type="button"
                        className="instructor-course-delete"
                        aria-label={`Delete ${course.title}`}
                        title="Delete course"
                        onClick={() =>
                          handleDeleteCourse(course.id)
                        }
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="instructor-courses-empty">
                <div className="instructor-courses-empty-icon">
                  🔍
                </div>

                <h2>No courses found</h2>

                <p>
                  We couldn't find any courses matching your
                  current search or filters. Try changing
                  your search criteria.
                </p>

                <button
                  type="button"
                  className="create-course-button"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* CTA */}

          <section className="instructor-courses-cta">
            <div className="instructor-courses-cta-icon">
              🚀
            </div>

            <div className="instructor-courses-cta-content">
              <span className="panel-label">
                KEEP TEACHING
              </span>

              <h2>
                Ready to share your next great course?
              </h2>

              <p>
                Create a new course and help more students
                learn valuable skills.
              </p>
            </div>

            <Link
              to="/instructor/courses/create"
              className="create-course-button"
            >
              Create Course →
            </Link>
          </section>
        </section>

        {/* FOOTER */}

        <footer className="instructor-courses-footer">
          <div>
            <strong>LearnHub</strong>

            <span>
              © 2026 LearnHub. All rights reserved.
            </span>
          </div>

          <div className="instructor-courses-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default InstructorCourses;
