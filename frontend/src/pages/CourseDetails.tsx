
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./CourseDetails.css";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  preview?: boolean;
}

interface CourseDetail {
  id: number;
  title: string;
  instructor: string;
  instructorRole: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  imageClass: string;
  icon: string;
  description: string;
  bestseller?: boolean;
  newCourse?: boolean;
  lastUpdated: string;
  language: string;
  certificate: boolean;
  whatYouLearn: string[];
  requirements: string[];
  lessonsList: Lesson[];
  instructorBio: string;
}

const courses: CourseDetail[] = [
  {
    id: 1,
    title: "Complete React & TypeScript Development",
    instructor: "Sarah Johnson",
    instructorRole: "Senior Frontend Developer",
    category: "Web Development",
    level: "Intermediate",
    duration: "18h 30m",
    lessons: 42,
    students: 1248,
    rating: 4.9,
    reviews: 326,
    price: 49,
    originalPrice: 79,
    imageClass: "detail-blue",
    icon: "⚛️",
    description:
      "Master modern React and TypeScript by building real-world applications from scratch. Learn component architecture, hooks, state management, TypeScript fundamentals, API integration, and professional frontend development practices.",
    bestseller: true,
    lastUpdated: "September 2026",
    language: "English",
    certificate: true,
    whatYouLearn: [
      "Build modern React applications with TypeScript",
      "Understand React components, props, state, and hooks",
      "Create reusable and scalable frontend architectures",
      "Work with APIs and asynchronous data",
      "Implement forms and advanced validation",
      "Use TypeScript effectively in React projects",
      "Build responsive and professional user interfaces",
      "Follow modern frontend development best practices",
    ],
    requirements: [
      "Basic understanding of HTML and CSS",
      "Basic JavaScript knowledge",
      "A computer with a modern web browser",
      "No previous React experience is required",
    ],
    lessonsList: [
      {
        id: 1,
        title: "Introduction to React & TypeScript",
        duration: "18 min",
        preview: true,
      },
      {
        id: 2,
        title: "Setting Up Your Development Environment",
        duration: "24 min",
        preview: true,
      },
      {
        id: 3,
        title: "React Components & JSX",
        duration: "32 min",
      },
      {
        id: 4,
        title: "Props and Component Communication",
        duration: "28 min",
      },
      {
        id: 5,
        title: "Understanding React State",
        duration: "35 min",
      },
      {
        id: 6,
        title: "React Hooks Fundamentals",
        duration: "42 min",
      },
      {
        id: 7,
        title: "Working with TypeScript",
        duration: "38 min",
      },
      {
        id: 8,
        title: "Forms and User Input",
        duration: "31 min",
      },
      {
        id: 9,
        title: "API Integration",
        duration: "45 min",
      },
      {
        id: 10,
        title: "Building the Final Project",
        duration: "58 min",
      },
    ],
    instructorBio:
      "Sarah Johnson is a senior frontend developer and educator with years of experience building scalable web applications. She enjoys helping developers learn practical skills through real-world projects.",
  },
  {
    id: 2,
    title: "JavaScript From Beginner to Advanced",
    instructor: "Michael Brown",
    instructorRole: "JavaScript Developer & Instructor",
    category: "Web Development",
    level: "Beginner",
    duration: "21h 15m",
    lessons: 56,
    students: 2156,
    rating: 4.8,
    reviews: 512,
    price: 39,
    originalPrice: 69,
    imageClass: "detail-yellow",
    icon: "JS",
    bestseller: true,
    description:
      "Learn JavaScript from the fundamentals to advanced concepts through practical examples and projects.",
    lastUpdated: "August 2026",
    language: "English",
    certificate: true,
    whatYouLearn: [
      "Understand JavaScript fundamentals",
      "Work with functions, arrays, and objects",
      "Understand asynchronous JavaScript",
      "Work with APIs and JSON",
      "Build interactive web applications",
      "Use modern ES6+ features",
    ],
    requirements: [
      "Basic computer knowledge",
      "A modern web browser",
      "No programming experience required",
    ],
    lessonsList: [
      {
        id: 1,
        title: "Introduction to JavaScript",
        duration: "22 min",
        preview: true,
      },
      {
        id: 2,
        title: "Variables and Data Types",
        duration: "28 min",
      },
      {
        id: 3,
        title: "Functions and Scope",
        duration: "35 min",
      },
      {
        id: 4,
        title: "Arrays and Objects",
        duration: "41 min",
      },
      {
        id: 5,
        title: "DOM Manipulation",
        duration: "46 min",
      },
      {
        id: 6,
        title: "Asynchronous JavaScript",
        duration: "52 min",
      },
    ],
    instructorBio:
      "Michael Brown is a JavaScript developer and instructor focused on teaching programming concepts in a simple and practical way.",
  },
  {
    id: 3,
    title: "Python Programming Masterclass",
    instructor: "David Wilson",
    instructorRole: "Python Developer & Data Educator",
    category: "Programming",
    level: "Beginner",
    duration: "24h 10m",
    lessons: 64,
    students: 3421,
    rating: 4.9,
    reviews: 784,
    price: 45,
    originalPrice: 75,
    imageClass: "detail-green",
    icon: "🐍",
    bestseller: true,
    description:
      "Build a strong Python foundation and learn how to create practical applications using modern Python programming techniques.",
    lastUpdated: "September 2026",
    language: "English",
    certificate: true,
    whatYouLearn: [
      "Master Python syntax and fundamentals",
      "Work with functions and modules",
      "Understand object-oriented programming",
      "Work with files and data",
      "Handle errors and exceptions",
      "Build practical Python applications",
    ],
    requirements: [
      "Basic computer knowledge",
      "No previous programming experience required",
    ],
    lessonsList: [
      {
        id: 1,
        title: "Getting Started with Python",
        duration: "25 min",
        preview: true,
      },
      {
        id: 2,
        title: "Variables and Data Types",
        duration: "31 min",
      },
      {
        id: 3,
        title: "Conditional Statements",
        duration: "28 min",
      },
      {
        id: 4,
        title: "Loops and Iteration",
        duration: "36 min",
      },
      {
        id: 5,
        title: "Functions",
        duration: "42 min",
      },
      {
        id: 6,
        title: "Object-Oriented Programming",
        duration: "51 min",
      },
    ],
    instructorBio:
      "David Wilson teaches Python and programming fundamentals with a focus on practical projects and easy-to-understand explanations.",
  },
];

function CourseDetails() {
  const { id } = useParams();
  const [openSection, setOpenSection] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const course =
    courses.find((item) => item.id === Number(id)) || courses[0];

  const handleEnroll = () => {
    setEnrolled(true);
  };

  const toggleWishlist = () => {
    setIsWishlisted((current) => !current);
  };

  return (
    <div className="course-details-page">
      {/* Sidebar */}
      <aside className="details-sidebar">
        <Link to="/" className="details-brand">
          <span className="details-brand-icon">L</span>
          <span>LearnHub</span>
        </Link>

        <nav className="details-navigation">
          <div className="details-nav-section">
            <p className="details-nav-title">LEARNING</p>

            <Link to="/student/dashboard" className="details-nav-item">
              <span>▦</span>
              Dashboard
            </Link>

            <Link
              to="/courses"
              className="details-nav-item active"
            >
              <span>▤</span>
              Courses
            </Link>

            <Link to="/discover" className="details-nav-item">
              <span>✦</span>
              Discover
            </Link>

            <Link to="/quizzes" className="details-nav-item">
              <span>✓</span>
              Quizzes
            </Link>

            <Link to="/progress" className="details-nav-item">
              <span>◔</span>
              Progress
            </Link>
          </div>

          <div className="details-nav-section">
            <p className="details-nav-title">MY LEARNING</p>

            <Link to="/activities" className="details-nav-item">
              <span>◷</span>
              Activities
            </Link>

            <Link to="/achievements" className="details-nav-item">
              <span>🏆</span>
              Achievements
            </Link>

            <Link to="/wishlist" className="details-nav-item">
              <span>♡</span>
              Wishlist
            </Link>
          </div>

          <div className="details-nav-section">
            <p className="details-nav-title">ACCOUNT</p>

            <Link to="/profile" className="details-nav-item">
              <span>♙</span>
              Profile
            </Link>

            <Link to="/settings" className="details-nav-item">
              <span>⚙</span>
              Settings
            </Link>
          </div>
        </nav>

        <div className="details-sidebar-help">
          <div className="help-icon">?</div>
          <strong>Need help?</strong>
          <p>We're here to help you learn.</p>
          <Link to="/help">Visit Help Center →</Link>
        </div>
      </aside>

      {/* Main */}
      <main className="course-details-main">
        {/* Topbar */}
        <header className="details-topbar">
          <div className="details-breadcrumb">
            <Link to="/courses">Courses</Link>
            <span>/</span>
            <span>{course.category}</span>
            <span>/</span>
            <strong>Course Details</strong>
          </div>

          <div className="details-topbar-right">
            <button
              className="details-icon-button"
              aria-label="Notifications"
            >
              ♢
              <span className="details-notification-dot"></span>
            </button>

            <Link to="/profile" className="details-user">
              <span className="details-avatar">SE</span>
              <span className="details-user-name">Supriya</span>
              <span className="details-user-arrow">⌄</span>
            </Link>
          </div>
        </header>

        {/* Course Hero */}
        <section className="course-detail-hero">
          <div className="course-detail-hero-content">
            <div className="course-detail-badges">
              {course.bestseller && (
                <span className="detail-badge bestseller">
                  Bestseller
                </span>
              )}

              {course.newCourse && (
                <span className="detail-badge new">New</span>
              )}

              <span className="detail-badge category">
                {course.category}
              </span>
            </div>

            <h1>{course.title}</h1>

            <p className="course-detail-description">
              {course.description}
            </p>

            <div className="course-detail-rating">
              <strong>{course.rating}</strong>

              <span className="rating-stars">★★★★★</span>

              <a href="#reviews">
                {course.reviews.toLocaleString()} reviews
              </a>

              <span>•</span>

              <span>
                {course.students.toLocaleString()} students
              </span>
            </div>

            <div className="course-detail-instructor">
              <div className="instructor-avatar">SJ</div>

              <div>
                <span>Created by</span>
                <strong>{course.instructor}</strong>
              </div>
            </div>

            <div className="course-detail-meta">
              <span>◷ {course.duration}</span>
              <span>▣ {course.lessons} lessons</span>
              <span>◉ {course.level}</span>
              <span>🌐 {course.language}</span>
              <span>↻ Updated {course.lastUpdated}</span>
            </div>
          </div>

          <div className="course-preview-card">
            <div className={`course-preview-image ${course.imageClass}`}>
              <span>{course.icon}</span>

              <button className="preview-play-button">
                ▶
              </button>

              <div className="preview-label">Course Preview</div>
            </div>

            <div className="course-purchase-content">
              <div className="course-price-row">
                <strong>${course.price}</strong>
                <span>${course.originalPrice}</span>
                <small>
                  {Math.round(
                    ((course.originalPrice - course.price) /
                      course.originalPrice) *
                      100
                  )}
                  % off
                </small>
              </div>

              <p className="price-note">
                Limited-time offer
              </p>

              <button
                className={`enroll-button ${
                  enrolled ? "enrolled" : ""
                }`}
                onClick={handleEnroll}
              >
                {enrolled ? "✓ Enrolled" : "Enroll Now"}
              </button>

              <button
                className={`wishlist-button ${
                  isWishlisted ? "wishlisted" : ""
                }`}
                onClick={toggleWishlist}
              >
                {isWishlisted ? "♥" : "♡"}
                {isWishlisted
                  ? " Added to Wishlist"
                  : " Add to Wishlist"}
              </button>

              <p className="purchase-note">
                30-day money-back guarantee
              </p>

              <div className="course-includes">
                <strong>This course includes:</strong>

                <span>◷ {course.duration} on-demand video</span>
                <span>▣ {course.lessons} lessons</span>
                <span>📱 Access on mobile and desktop</span>

                {course.certificate && (
                  <span>🏆 Certificate of completion</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="course-detail-content">
          <div className="course-detail-left">
            {/* What You'll Learn */}
            <section className="detail-content-card">
              <h2>What you'll learn</h2>

              <div className="learning-points">
                {course.whatYouLearn.map((item, index) => (
                  <div className="learning-point" key={index}>
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="detail-content-card curriculum-card">
              <div className="curriculum-header">
                <div>
                  <h2>Course Curriculum</h2>
                  <p>
                    {course.lessons} lessons • {course.duration}
                  </p>
                </div>

                <button
                  className="expand-button"
                  onClick={() =>
                    setOpenSection((current) => !current)
                  }
                >
                  {openSection ? "Collapse all" : "Expand all"}
                </button>
              </div>

              <div className="curriculum-section">
                <button
                  className="curriculum-section-header"
                  onClick={() =>
                    setOpenSection((current) => !current)
                  }
                >
                  <span className="section-arrow">
                    {openSection ? "⌄" : "›"}
                  </span>

                  <div>
                    <strong>Getting Started</strong>
                    <small>10 lessons • 2h 45m</small>
                  </div>
                </button>

                {openSection && (
                  <div className="lesson-list">
                    {course.lessonsList.map((lesson) => (
                      <div
                        className="lesson-item"
                        key={lesson.id}
                      >
                        <div className="lesson-icon">
                          {lesson.preview ? "▶" : "▣"}
                        </div>

                        <div className="lesson-info">
                          <strong>{lesson.title}</strong>

                          {lesson.preview && (
                            <span className="preview-text">
                              Preview
                            </span>
                          )}
                        </div>

                        <span className="lesson-duration">
                          {lesson.duration}
                        </span>

                        {lesson.preview && (
                          <button className="lesson-preview-button">
                            Preview
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="curriculum-section locked">
                <div className="curriculum-section-header">
                  <span className="section-arrow">›</span>

                  <div>
                    <strong>Building Real-World Projects</strong>
                    <small>12 lessons • 5h 20m</small>
                  </div>

                  <span className="lock-icon">🔒</span>
                </div>
              </div>

              <div className="curriculum-section locked">
                <div className="curriculum-section-header">
                  <span className="section-arrow">›</span>

                  <div>
                    <strong>Advanced Concepts</strong>
                    <small>10 lessons • 4h 45m</small>
                  </div>

                  <span className="lock-icon">🔒</span>
                </div>
              </div>
            </section>

            {/* Requirements */}
            <section className="detail-content-card">
              <h2>Requirements</h2>

              <ul className="requirements-list">
                {course.requirements.map((item, index) => (
                  <li key={index}>
                    <span>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructor */}
            <section className="detail-content-card instructor-section">
              <h2>About the instructor</h2>

              <div className="instructor-profile">
                <div className="large-instructor-avatar">
                  SJ
                </div>

                <div>
                  <h3>{course.instructor}</h3>
                  <p className="instructor-role">
                    {course.instructorRole}
                  </p>

                  <div className="instructor-stats">
                    <span>★ {course.rating} Rating</span>
                    <span>
                      👥 {course.students.toLocaleString()} Students
                    </span>
                    <span>▣ {course.lessons} Courses</span>
                  </div>
                </div>
              </div>

              <p className="instructor-bio">
                {course.instructorBio}
              </p>
            </section>

            {/* Reviews */}
            <section
              className="detail-content-card reviews-section"
              id="reviews"
            >
              <div className="reviews-heading">
                <div>
                  <h2>Student Reviews</h2>
                  <p>
                    See what students are saying about this course.
                  </p>
                </div>

                <div className="overall-rating">
                  <strong>{course.rating}</strong>
                  <span className="rating-stars">★★★★★</span>
                  <small>{course.reviews} reviews</small>
                </div>
              </div>

              <div className="review-item">
                <div className="review-avatar">AK</div>

                <div className="review-content">
                  <div className="review-top">
                    <strong>Alex Kumar</strong>
                    <span>★★★★★</span>
                  </div>

                  <p>
                    Excellent course with clear explanations and
                    practical examples. The lessons are easy to
                    follow and very useful.
                  </p>

                  <small>2 weeks ago</small>
                </div>
              </div>

              <div className="review-item">
                <div className="review-avatar">RM</div>

                <div className="review-content">
                  <div className="review-top">
                    <strong>Rachel Miller</strong>
                    <span>★★★★★</span>
                  </div>

                  <p>
                    I really enjoyed this course. The projects made
                    the concepts much easier to understand.
                  </p>

                  <small>1 month ago</small>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="course-detail-right">
            <div className="sticky-info-card">
              <h3>Course information</h3>

              <div className="info-row">
                <span>Level</span>
                <strong>{course.level}</strong>
              </div>

              <div className="info-row">
                <span>Duration</span>
                <strong>{course.duration}</strong>
              </div>

              <div className="info-row">
                <span>Lessons</span>
                <strong>{course.lessons}</strong>
              </div>

              <div className="info-row">
                <span>Language</span>
                <strong>{course.language}</strong>
              </div>

              <div className="info-row">
                <span>Certificate</span>
                <strong>
                  {course.certificate ? "Included" : "Not included"}
                </strong>
              </div>

              <hr />

              <Link
                to="/courses"
                className="back-courses-button"
              >
                ← Browse More Courses
              </Link>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="course-details-footer">
          <div>
            <strong>LearnHub</strong>
            <p>
              Learn new skills. Build your future.
            </p>
          </div>

          <div className="details-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>

          <p>© 2026 LearnHub. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default CourseDetails;
