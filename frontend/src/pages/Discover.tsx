
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Discover.css";

interface DiscoverCourse {
  id: number;
  title: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  students: number;
  price: number;
  imageClass: string;
  icon: string;
  badge?: string;
}

interface Instructor {
  id: number;
  name: string;
  role: string;
  students: string;
  courses: number;
  avatar: string;
  colorClass: string;
}

const discoverCourses: DiscoverCourse[] = [
  {
    id: 1,
    title: "Complete React & TypeScript Development",
    instructor: "Sarah Johnson",
    category: "Web Development",
    level: "Intermediate",
    duration: "18h 30m",
    rating: 4.9,
    students: 1248,
    price: 49,
    imageClass: "discover-blue",
    icon: "⚛️",
    badge: "Bestseller",
  },
  {
    id: 2,
    title: "JavaScript From Beginner to Advanced",
    instructor: "Michael Brown",
    category: "Web Development",
    level: "Beginner",
    duration: "21h 15m",
    rating: 4.8,
    students: 2156,
    price: 39,
    imageClass: "discover-yellow",
    icon: "JS",
    badge: "Popular",
  },
  {
    id: 3,
    title: "Python Programming Masterclass",
    instructor: "David Wilson",
    category: "Programming",
    level: "Beginner",
    duration: "24h 10m",
    rating: 4.9,
    students: 3421,
    price: 45,
    imageClass: "discover-green",
    icon: "🐍",
    badge: "Top Rated",
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    instructor: "Emily Carter",
    category: "Design",
    level: "Beginner",
    duration: "12h 45m",
    rating: 4.7,
    students: 987,
    price: 35,
    imageClass: "discover-purple",
    icon: "🎨",
  },
  {
    id: 5,
    title: "Node.js & Express Backend Development",
    instructor: "James Anderson",
    category: "Backend Development",
    level: "Intermediate",
    duration: "16h 20m",
    rating: 4.8,
    students: 1456,
    price: 44,
    imageClass: "discover-teal",
    icon: "🟢",
    badge: "New",
  },
  {
    id: 6,
    title: "MongoDB Database Essentials",
    instructor: "Daniel Martinez",
    category: "Database",
    level: "Intermediate",
    duration: "10h 35m",
    rating: 4.7,
    students: 876,
    price: 32,
    imageClass: "discover-dark-green",
    icon: "🍃",
  },
];

const instructors: Instructor[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Senior Frontend Developer",
    students: "12.4K",
    courses: 8,
    avatar: "SJ",
    colorClass: "instructor-indigo",
  },
  {
    id: 2,
    name: "David Wilson",
    role: "Python & Data Educator",
    students: "18.7K",
    courses: 11,
    avatar: "DW",
    colorClass: "instructor-green",
  },
  {
    id: 3,
    name: "Emily Carter",
    role: "UI/UX Designer",
    students: "9.2K",
    courses: 6,
    avatar: "EC",
    colorClass: "instructor-purple",
  },
  {
    id: 4,
    name: "Michael Brown",
    role: "JavaScript Developer",
    students: "15.8K",
    courses: 9,
    avatar: "MB",
    colorClass: "instructor-orange",
  },
];

const categories = [
  {
    name: "Web Development",
    icon: "💻",
    courses: "120+ Courses",
    className: "category-web",
  },
  {
    name: "Programming",
    icon: "⌨️",
    courses: "95+ Courses",
    className: "category-programming",
  },
  {
    name: "Design",
    icon: "🎨",
    courses: "70+ Courses",
    className: "category-design",
  },
  {
    name: "Data Science",
    icon: "📊",
    courses: "65+ Courses",
    className: "category-data",
  },
  {
    name: "Business",
    icon: "💼",
    courses: "55+ Courses",
    className: "category-business",
  },
  {
    name: "Marketing",
    icon: "📣",
    courses: "45+ Courses",
    className: "category-marketing",
  },
];

function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("Trending");

  const filteredCourses = useMemo(() => {
    return discoverCourses.filter((course) => {
      const matchesSearch =
        course.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        course.instructor
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        course.category
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="discover-page">
      {/* Sidebar */}
      <aside className="discover-sidebar">
        <Link to="/" className="discover-brand">
          <span className="discover-brand-icon">L</span>
          <span>LearnHub</span>
        </Link>

        <nav className="discover-navigation">
          <div className="discover-nav-section">
            <p className="discover-nav-title">LEARNING</p>

            <Link
              to="/student/dashboard"
              className="discover-nav-item"
            >
              <span>▦</span>
              Dashboard
            </Link>

            <Link to="/courses" className="discover-nav-item">
              <span>▤</span>
              Courses
            </Link>

            <Link
              to="/discover"
              className="discover-nav-item active"
            >
              <span>✦</span>
              Discover
            </Link>

            <Link to="/quizzes" className="discover-nav-item">
              <span>✓</span>
              Quizzes
            </Link>

            <Link to="/progress" className="discover-nav-item">
              <span>◔</span>
              Progress
            </Link>
          </div>

          <div className="discover-nav-section">
            <p className="discover-nav-title">MY LEARNING</p>

            <Link to="/activities" className="discover-nav-item">
              <span>◷</span>
              Activities
            </Link>

            <Link
              to="/achievements"
              className="discover-nav-item"
            >
              <span>🏆</span>
              Achievements
            </Link>

            <Link to="/wishlist" className="discover-nav-item">
              <span>♡</span>
              Wishlist
            </Link>
          </div>

          <div className="discover-nav-section">
            <p className="discover-nav-title">ACCOUNT</p>

            <Link to="/profile" className="discover-nav-item">
              <span>♙</span>
              Profile
            </Link>

            <Link to="/settings" className="discover-nav-item">
              <span>⚙</span>
              Settings
            </Link>
          </div>
        </nav>

        <div className="discover-help-card">
          <div className="discover-help-icon">?</div>
          <strong>Need help?</strong>
          <p>We're here to help you learn.</p>
          <Link to="/help">Visit Help Center →</Link>
        </div>
      </aside>

      {/* Main */}
      <main className="discover-main">
        {/* Topbar */}
        <header className="discover-topbar">
          <div className="discover-breadcrumb">
            <Link to="/student/dashboard">Dashboard</Link>
            <span>/</span>
            <strong>Discover</strong>
          </div>

          <div className="discover-topbar-actions">
            <button
              className="discover-notification-button"
              aria-label="Notifications"
            >
              ♢
              <span className="discover-notification-dot"></span>
            </button>

            <Link to="/profile" className="discover-user">
              <span className="discover-avatar">SE</span>
              <span className="discover-user-name">
                Supriya
              </span>
              <span className="discover-user-arrow">⌄</span>
            </Link>
          </div>
        </header>

        <div className="discover-content">
          {/* Hero */}
          <section className="discover-hero">
            <div className="discover-hero-content">
              <span className="discover-eyebrow">
                ✦ EXPLORE & LEARN
              </span>

              <h1>
                Discover your next
                <span> learning adventure.</span>
              </h1>

              <p>
                Explore courses, discover new skills, and find
                instructors who can help you reach your goals.
              </p>

              <div className="discover-search">
                <span className="discover-search-icon">⌕</span>

                <input
                  type="text"
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                />

                <button>Search</button>
              </div>

              <div className="popular-searches">
                <span>Popular:</span>

                <button
                  onClick={() =>
                    setSearchQuery("React")
                  }
                >
                  React
                </button>

                <button
                  onClick={() =>
                    setSearchQuery("Python")
                  }
                >
                  Python
                </button>

                <button
                  onClick={() =>
                    setSearchQuery("JavaScript")
                  }
                >
                  JavaScript
                </button>

                <button
                  onClick={() =>
                    setSearchQuery("UI/UX")
                  }
                >
                  UI/UX
                </button>
              </div>
            </div>

            <div className="discover-hero-visual">
              <div className="discover-orbit orbit-one"></div>
              <div className="discover-orbit orbit-two"></div>

              <div className="discover-main-orb">
                <span>📚</span>
              </div>

              <div className="floating-discover-card card-one">
                <span>⚛️</span>
                <div>
                  <strong>React</strong>
                  <small>Trending skill</small>
                </div>
              </div>

              <div className="floating-discover-card card-two">
                <span>🐍</span>
                <div>
                  <strong>Python</strong>
                  <small>3.4K learners</small>
                </div>
              </div>

              <div className="floating-discover-card card-three">
                <span>🎨</span>
                <div>
                  <strong>Design</strong>
                  <small>Popular category</small>
                </div>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="discover-section">
            <div className="discover-section-header">
              <div>
                <span className="section-eyebrow">
                  EXPLORE BY TOPIC
                </span>
                <h2>Browse categories</h2>
              </div>

              <Link to="/courses">View all →</Link>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className={`discover-category-card ${category.className}`}
                  onClick={() =>
                    setSelectedCategory(category.name)
                  }
                >
                  <span className="category-icon">
                    {category.icon}
                  </span>

                  <strong>{category.name}</strong>

                  <span>{category.courses}</span>

                  <span className="category-arrow">→</span>
                </button>
              ))}
            </div>
          </section>

          {/* Recommended */}
          <section className="discover-section">
            <div className="discover-section-header">
              <div>
                <span className="section-eyebrow">
                  RECOMMENDED FOR YOU
                </span>
                <h2>Courses you'll love</h2>
              </div>

              <Link to="/courses">Browse all courses →</Link>
            </div>

            <div className="discover-tabs">
              {["Trending", "Popular", "Top Rated", "New"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={
                      activeTab === tab ? "active" : ""
                    }
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            <div className="discover-course-grid">
              {filteredCourses.slice(0, 4).map((course) => (
                <article
                  className="discover-course-card"
                  key={course.id}
                >
                  <div
                    className={`discover-course-image ${course.imageClass}`}
                  >
                    <span className="discover-course-icon">
                      {course.icon}
                    </span>

                    {course.badge && (
                      <span className="discover-course-badge">
                        {course.badge}
                      </span>
                    )}

                    <button
                      className="discover-course-wishlist"
                      aria-label="Add to wishlist"
                    >
                      ♡
                    </button>
                  </div>

                  <div className="discover-course-body">
                    <span className="discover-course-category">
                      {course.category}
                    </span>

                    <h3>{course.title}</h3>

                    <p className="discover-course-instructor">
                      {course.instructor}
                    </p>

                    <div className="discover-course-rating">
                      <strong>{course.rating}</strong>
                      <span>★★★★★</span>
                      <small>
                        ({course.students.toLocaleString()})
                      </small>
                    </div>

                    <div className="discover-course-meta">
                      <span>◷ {course.duration}</span>
                      <span>• {course.level}</span>
                    </div>

                    <div className="discover-course-footer">
                      <strong>${course.price}</strong>

                      <Link to={`/courses/${course.id}`}>
                        View Course →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="discover-no-results">
                <span>🔎</span>
                <h3>No courses found</h3>
                <p>
                  Try searching for another skill or category.
                </p>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear Search
                </button>
              </div>
            )}
          </section>

          {/* Learning Paths */}
          <section className="discover-section">
            <div className="discover-section-header">
              <div>
                <span className="section-eyebrow">
                  LEARN WITH PURPOSE
                </span>
                <h2>Popular learning paths</h2>
              </div>
            </div>

            <div className="learning-path-grid">
              <Link
                to="/courses"
                className="learning-path-card path-web"
              >
                <div className="path-icon">💻</div>

                <div className="path-content">
                  <span>CAREER PATH</span>
                  <h3>Full-Stack Developer</h3>
                  <p>
                    Master frontend, backend, databases and
                    deployment.
                  </p>

                  <div className="path-bottom">
                    <span>8 courses</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>

              <Link
                to="/courses"
                className="learning-path-card path-data"
              >
                <div className="path-icon">📊</div>

                <div className="path-content">
                  <span>CAREER PATH</span>
                  <h3>Data Scientist</h3>
                  <p>
                    Learn Python, data analysis, statistics and
                    machine learning.
                  </p>

                  <div className="path-bottom">
                    <span>10 courses</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>

              <Link
                to="/courses"
                className="learning-path-card path-design"
              >
                <div className="path-icon">🎨</div>

                <div className="path-content">
                  <span>CAREER PATH</span>
                  <h3>UI/UX Designer</h3>
                  <p>
                    Build beautiful interfaces and meaningful
                    user experiences.
                  </p>

                  <div className="path-bottom">
                    <span>7 courses</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Instructors */}
          <section className="discover-section">
            <div className="discover-section-header">
              <div>
                <span className="section-eyebrow">
                  LEARN FROM THE BEST
                </span>
                <h2>Featured instructors</h2>
              </div>

              <button className="view-instructors-button">
                Meet all instructors →
              </button>
            </div>

            <div className="instructor-grid">
              {instructors.map((instructor) => (
                <article
                  className="featured-instructor"
                  key={instructor.id}
                >
                  <div
                    className={`featured-instructor-avatar ${instructor.colorClass}`}
                  >
                    {instructor.avatar}
                  </div>

                  <h3>{instructor.name}</h3>

                  <p>{instructor.role}</p>

                  <div className="instructor-details">
                    <span>
                      ★ 4.9 Rating
                    </span>
                    <span>
                      👥 {instructor.students} Students
                    </span>
                    <span>
                      ▣ {instructor.courses} Courses
                    </span>
                  </div>

                  <button className="view-instructor-button">
                    View Profile
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="discover-stats">
            <div>
              <strong>500+</strong>
              <span>Courses</span>
            </div>

            <div>
              <strong>120+</strong>
              <span>Expert Instructors</span>
            </div>

            <div>
              <strong>25K+</strong>
              <span>Active Learners</span>
            </div>

            <div>
              <strong>95%</strong>
              <span>Student Satisfaction</span>
            </div>
          </section>

          {/* CTA */}
          <section className="discover-cta">
            <div>
              <span>READY TO START?</span>

              <h2>
                Your next skill is
                <br />
                waiting for you.
              </h2>

              <p>
                Explore our complete course library and start
                learning something new today.
              </p>

              <Link to="/courses" className="discover-cta-button">
                Explore All Courses →
              </Link>
            </div>

            <div className="cta-decoration">
              <span>🚀</span>
            </div>
          </section>

          {/* Footer */}
          <footer className="discover-footer">
            <div>
              <strong>LearnHub</strong>
              <p>
                Learn new skills. Build your future.
              </p>
            </div>

            <div className="discover-footer-links">
              <Link to="/help">Help Center</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/courses">Courses</Link>
            </div>

            <p>© 2026 LearnHub. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Discover;
