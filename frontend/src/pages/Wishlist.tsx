
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Wishlist.css";

interface WishlistCourse {
  id: number;
  title: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  rating: number;
  students: number;
  price: number;
  originalPrice: number;
  imageClass: string;
  icon: string;
  description: string;
}

const wishlistCourses: WishlistCourse[] = [
  {
    id: 1,
    title: "React & TypeScript Development",
    instructor: "Alex Johnson",
    category: "Web Development",
    level: "Intermediate",
    duration: "12 hours",
    lessons: 48,
    rating: 4.9,
    students: 12450,
    price: 49,
    originalPrice: 89,
    imageClass: "wishlist-react",
    icon: "⚛️",
    description:
      "Build modern, scalable web applications using React and TypeScript.",
  },
  {
    id: 3,
    title: "Python Programming Masterclass",
    instructor: "Sarah Williams",
    category: "Programming",
    level: "Beginner",
    duration: "18 hours",
    lessons: 72,
    rating: 4.8,
    students: 18920,
    price: 59,
    originalPrice: 99,
    imageClass: "wishlist-python",
    icon: "🐍",
    description:
      "Learn Python from the basics and build real-world applications.",
  },
  {
    id: 5,
    title: "Node.js & Express Backend Development",
    instructor: "Michael Brown",
    category: "Backend Development",
    level: "Intermediate",
    duration: "14 hours",
    lessons: 55,
    rating: 4.7,
    students: 9870,
    price: 54,
    originalPrice: 94,
    imageClass: "wishlist-node",
    icon: "🟢",
    description:
      "Create powerful backend applications and REST APIs with Node.js.",
  },
  {
    id: 7,
    title: "Data Structures & Algorithms",
    instructor: "David Wilson",
    category: "Computer Science",
    level: "Advanced",
    duration: "20 hours",
    lessons: 85,
    rating: 4.9,
    students: 7650,
    price: 64,
    originalPrice: 109,
    imageClass: "wishlist-dsa",
    icon: "🧠",
    description:
      "Master important data structures and algorithms for technical interviews.",
  },
];

function Wishlist() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [courses, setCourses] = useState(wishlistCourses);
  const displayName = user?.name || "Student";
  const initials = displayName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const categories = [
    "All",
    ...Array.from(new Set(wishlistCourses.map((course) => course.category))),
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        category === "All" || course.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, category]);

  const removeFromWishlist = (id: number) => {
    setCourses((currentCourses) =>
      currentCourses.filter((course) => course.id !== id)
    );
  };

  

  return (
    <div className="wishlist-page">
      {/* Sidebar */}
      <aside className="wishlist-sidebar">
        <div className="wishlist-brand">
          <div className="wishlist-brand-icon">L</div>
          <span>LearnHub</span>
        </div>

        <nav className="wishlist-navigation">
          <p className="wishlist-nav-label">LEARNING</p>

          <Link to="/student/dashboard" className="wishlist-nav-item">
            <span>📊</span>
            Dashboard
          </Link>

          <Link to="/courses" className="wishlist-nav-item">
            <span>📚</span>
            My Courses
          </Link>

          <Link to="/discover" className="wishlist-nav-item">
            <span>🔍</span>
            Discover
          </Link>

          <Link to="/quizzes" className="wishlist-nav-item">
            <span>📝</span>
            Quizzes
          </Link>

          <Link to="/progress" className="wishlist-nav-item">
            <span>📈</span>
            Progress
          </Link>

          <Link to="/activities" className="wishlist-nav-item">
            <span>🕒</span>
            Activities
          </Link>

          <Link to="/achievements" className="wishlist-nav-item">
            <span>🏆</span>
            Achievements
          </Link>

          <Link
            to="/wishlist"
            className="wishlist-nav-item wishlist-nav-active"
          >
            <span>❤️</span>
            Wishlist
          </Link>

          <p className="wishlist-nav-label wishlist-account-label">
            ACCOUNT
          </p>

          <Link to="/profile" className="wishlist-nav-item">
            <span>👤</span>
            Profile
          </Link>

          <Link to="/settings" className="wishlist-nav-item">
            <span>⚙️</span>
            Settings
          </Link>
        </nav>

        <div className="wishlist-sidebar-bottom">
          <div className="wishlist-help-card">
            <div className="wishlist-help-icon">?</div>
            <div>
              <strong>Need help?</strong>
              <p>We're here for you.</p>
            </div>
          </div>

          <Link to="/login" className="wishlist-logout">
            <span>↪</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="wishlist-main">
        {/* Top Bar */}
        <header className="wishlist-topbar">
          <div className="wishlist-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="wishlist-topbar-actions">
            <button className="wishlist-icon-button" title="Help">
              ?
            </button>

            <button className="wishlist-icon-button notification-button">
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="wishlist-user">
              <div className="wishlist-avatar">{initials || "S"}</div>
              <div className="wishlist-user-info">
                <strong>{displayName}</strong>
                <span>Student</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Header */}
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

        {/* Stats */}
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
              <strong>
                {courses.length
                  ? (
                      courses.reduce((sum, course) => sum + course.rating, 0) /
                      courses.length
                    ).toFixed(1)
                  : "0.0"}
              </strong>
            </div>
          </div>

          <div className="wishlist-stat-card">
            <div className="wishlist-stat-icon">💰</div>
            <div>
              <span>Potential Savings</span>
              <strong>
                $
                {courses.reduce(
                  (sum, course) => sum + (course.originalPrice - course.price),
                  0
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="wishlist-toolbar">
          <div className="wishlist-results">
            <strong>{filteredCourses.length}</strong>{" "}
            {filteredCourses.length === 1 ? "course" : "courses"} saved
          </div>

          <div className="wishlist-categories">
            {categories.map((item) => (
              <button
                key={item}
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

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <section className="wishlist-grid">
            {filteredCourses.map((course) => (
              <article className="wishlist-course-card" key={course.id}>
                <div className={`wishlist-course-image ${course.imageClass}`}>
                  <span className="wishlist-course-icon">{course.icon}</span>

                  <button
                    className="wishlist-remove-button"
                    onClick={() => removeFromWishlist(course.id)}
                    title="Remove from wishlist"
                  >
                    ♥
                  </button>

                  <span className="wishlist-saved-label">Saved</span>
                </div>

                <div className="wishlist-course-content">
                  <div className="wishlist-course-meta">
                    <span>{course.category}</span>
                    <span>{course.level}</span>
                  </div>

                  <Link
                    to={`/courses/${course.id}`}
                    className="wishlist-course-title"
                  >
                    {course.title}
                  </Link>

                  <p className="wishlist-course-description">
                    {course.description}
                  </p>

                  <p className="wishlist-instructor">
                    By <strong>{course.instructor}</strong>
                  </p>

                  <div className="wishlist-course-rating">
                    <strong>{course.rating}</strong>
                    <span className="stars">★★★★★</span>
                    <span>({course.students.toLocaleString()})</span>
                  </div>

                  <div className="wishlist-course-details">
                    <span>⏱ {course.duration}</span>
                    <span>📖 {course.lessons} lessons</span>
                  </div>

                  <div className="wishlist-course-footer">
                    <div className="wishlist-price">
                      <strong>${course.price}</strong>
                      <del>${course.originalPrice}</del>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="wishlist-view-button"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="wishlist-empty">
            <div className="wishlist-empty-icon">💔</div>
            <h2>Your wishlist is empty</h2>
            <p>
              {searchQuery
                ? "No saved courses match your search."
                : "Start exploring courses and save the ones you want to learn later."}
            </p>
            <Link to="/courses" className="wishlist-empty-button">
              Explore Courses
            </Link>
          </section>
        )}

        {/* Motivation Section */}
        <section className="wishlist-motivation">
          <div className="wishlist-motivation-icon">🎯</div>

          <div className="wishlist-motivation-content">
            <span>KEEP LEARNING</span>
            <h2>Turn your wishlist into progress.</h2>
            <p>
              Pick a course from your wishlist and take the next step toward
              your learning goals.
            </p>
          </div>

          <Link to="/courses" className="wishlist-motivation-button">
            Find Your Next Course
            <span>→</span>
          </Link>
        </section>

        {/* Footer */}
        <footer className="wishlist-footer">
          <div>
            <strong>LearnHub</strong>
            <span>Learn. Grow. Succeed.</span>
          </div>

          <div className="wishlist-footer-links">
            <Link to="/courses">Courses</Link>
            <Link to="/discover">Discover</Link>
            <Link to="/progress">Progress</Link>
            <Link to="/profile">Profile</Link>
          </div>

          <p>© 2026 LearnHub. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default Wishlist;
