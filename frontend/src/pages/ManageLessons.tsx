
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ManageLessons.css";

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: "Video" | "Article" | "Quiz";
  status: "Published" | "Draft";
}

interface Course {
  id: number;
  title: string;
  category: string;
  lessons: Lesson[];
}

const initialCourses: Course[] = [
  {
    id: 1,
    title: "Complete React & TypeScript",
    category: "Web Development",
    lessons: [
      {
        id: 1,
        title: "Introduction to React",
        description:
          "Learn the basics of React and understand how React applications work.",
        duration: "18 min",
        type: "Video",
        status: "Published",
      },
      {
        id: 2,
        title: "Components and Props",
        description:
          "Understand reusable components and how to pass data using props.",
        duration: "24 min",
        type: "Video",
        status: "Published",
      },
      {
        id: 3,
        title: "Working with State",
        description:
          "Learn how to manage component state using React hooks.",
        duration: "30 min",
        type: "Video",
        status: "Published",
      },
      {
        id: 4,
        title: "TypeScript Fundamentals",
        description:
          "Learn TypeScript types, interfaces and how they work with React.",
        duration: "35 min",
        type: "Article",
        status: "Published",
      },
      {
        id: 5,
        title: "Building Your First Project",
        description:
          "Build a complete React and TypeScript application.",
        duration: "45 min",
        type: "Video",
        status: "Draft",
      },
    ],
  },
  {
    id: 2,
    title: "JavaScript Fundamentals",
    category: "Programming",
    lessons: [
      {
        id: 1,
        title: "JavaScript Introduction",
        description:
          "Introduction to JavaScript programming.",
        duration: "20 min",
        type: "Video",
        status: "Published",
      },
      {
        id: 2,
        title: "Variables and Data Types",
        description:
          "Understand variables, strings, numbers and other data types.",
        duration: "25 min",
        type: "Video",
        status: "Published",
      },
      {
        id: 3,
        title: "Functions",
        description:
          "Learn how to create and use JavaScript functions.",
        duration: "28 min",
        type: "Article",
        status: "Draft",
      },
    ],
  },
  {
    id: 3,
    title: "Modern CSS Masterclass",
    category: "Web Design",
    lessons: [
      {
        id: 1,
        title: "CSS Fundamentals",
        description:
          "Learn the core concepts of modern CSS.",
        duration: "22 min",
        type: "Video",
        status: "Published",
      },
      {
        id: 2,
        title: "Flexbox Layout",
        description:
          "Build flexible layouts using CSS Flexbox.",
        duration: "26 min",
        type: "Video",
        status: "Published",
      },
      {
        id: 3,
        title: "CSS Grid",
        description:
          "Create powerful page layouts using CSS Grid.",
        duration: "32 min",
        type: "Video",
        status: "Published",
      },
    ],
  },
];

function ManageLessons() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [courses, setCourses] =
    useState<Course[]>(initialCourses);

  const [selectedCourseId, setSelectedCourseId] =
    useState<number>(1);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [showLessonForm, setShowLessonForm] =
    useState(false);

  const [editingLessonId, setEditingLessonId] =
    useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [duration, setDuration] = useState("");
  const [type, setType] =
    useState<Lesson["type"]>("Video");
  const [status, setStatus] =
    useState<Lesson["status"]>("Draft");

  const selectedCourse = courses.find(
    (course) => course.id === selectedCourseId
  );

  const lessons = selectedCourse?.lessons ?? [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const resetLessonForm = () => {
    setTitle("");
    setDescription("");
    setDuration("");
    setType("Video");
    setStatus("Draft");
    setEditingLessonId(null);
  };

  const handleAddLesson = () => {
    resetLessonForm();
    setShowLessonForm(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setTitle(lesson.title);
    setDescription(lesson.description);
    setDuration(lesson.duration);
    setType(lesson.type);
    setStatus(lesson.status);
    setEditingLessonId(lesson.id);
    setShowLessonForm(true);
  };

  const handleCancelForm = () => {
    resetLessonForm();
    setShowLessonForm(false);
  };

  const handleSaveLesson = () => {
    if (!title.trim() || !description.trim()) {
      alert(
        "Please enter both the lesson title and description."
      );
      return;
    }

    if (!selectedCourse) {
      return;
    }

    if (editingLessonId !== null) {
      setCourses((currentCourses) =>
        currentCourses.map((course) => {
          if (course.id !== selectedCourseId) {
            return course;
          }

          return {
            ...course,
            lessons: course.lessons.map((lesson) =>
              lesson.id === editingLessonId
                ? {
                    ...lesson,
                    title,
                    description,
                    duration:
                      duration || "10 min",
                    type,
                    status,
                  }
                : lesson
            ),
          };
        })
      );

      alert("Lesson updated successfully.");
    } else {
      const newLesson: Lesson = {
        id: Date.now(),
        title,
        description,
        duration: duration || "10 min",
        type,
        status,
      };

      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course.id === selectedCourseId
            ? {
                ...course,
                lessons: [
                  ...course.lessons,
                  newLesson,
                ],
              }
            : course
        )
      );

      alert("Lesson added successfully.");
    }

    handleCancelForm();
  };

  const handleDeleteLesson = (lessonId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?"
    );

    if (!confirmed) {
      return;
    }

    setCourses((currentCourses) =>
      currentCourses.map((course) =>
        course.id === selectedCourseId
          ? {
              ...course,
              lessons: course.lessons.filter(
                (lesson) => lesson.id !== lessonId
              ),
            }
          : course
      )
    );

    alert("Lesson deleted successfully.");
  };

  return (
    <div className="manage-lessons-page">
      {/* Sidebar */}
      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <div className="instructor-brand-icon">
            L
          </div>

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
              <span>
                Contact our support team
              </span>
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

      {/* Main */}
      <main className="manage-lessons-main">
        {/* Topbar */}
        <header className="manage-lessons-topbar">
          <div className="manage-lessons-breadcrumb">
            <Link to="/instructor/dashboard">
              Instructor
            </Link>

            <span>/</span>

            <Link to="/instructor/courses">
              My Courses
            </Link>

            <span>/</span>

            <strong>Manage Lessons</strong>
          </div>

          <div className="manage-lessons-topbar-right">
            <button
              type="button"
              className="manage-lessons-notification"
              onClick={() =>
                navigate("/notifications")
              }
              aria-label="Notifications"
            >
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="manage-lessons-profile-wrapper">
              <button
                type="button"
                className="manage-lessons-profile-button"
                onClick={() =>
                  setShowProfileMenu(
                    (previous) => !previous
                  )
                }
              >
                <div className="manage-lessons-avatar">
                  AY
                </div>

                <div className="manage-lessons-user-info">
                  <strong>Archie Yadav</strong>
                  <span>Instructor</span>
                </div>

                <span>
                  {showProfileMenu ? "▲" : "▼"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="manage-lessons-profile-menu">
                  <Link to="/profile">
                    View Profile
                  </Link>

                  <Link to="/settings">
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

        {/* Content */}
        <section className="manage-lessons-content">
          <div className="manage-lessons-header">
            <div>
              <span className="manage-lessons-eyebrow">
                COURSE MANAGEMENT
              </span>

              <h1>Manage Lessons</h1>

              <p>
                Organize and manage the lessons inside
                your courses.
              </p>
            </div>

            <button
              type="button"
              className="add-lesson-button"
              onClick={handleAddLesson}
            >
              + Add Lesson
            </button>
          </div>

          {/* Course Selector */}
          <section className="lesson-course-selector">
            <div className="course-selector-left">
              <div className="course-selector-icon">
                📚
              </div>

              <div>
                <span>Select Course</span>

                <h2>
                  {selectedCourse?.title}
                </h2>

                <p>
                  {selectedCourse?.category}
                </p>
              </div>
            </div>

            <select
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(
                  Number(event.target.value)
                );
                handleCancelForm();
              }}
              className="course-selector-select"
            >
              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.title}
                </option>
              ))}
            </select>
          </section>

          {/* Course Stats */}
          <div className="lesson-stats">
            <div className="lesson-stat-card">
              <div className="lesson-stat-icon">
                📚
              </div>

              <div>
                <span>Total Lessons</span>
                <strong>{lessons.length}</strong>
              </div>
            </div>

            <div className="lesson-stat-card">
              <div className="lesson-stat-icon">
                ✅
              </div>

              <div>
                <span>Published</span>

                <strong>
                  {
                    lessons.filter(
                      (lesson) =>
                        lesson.status ===
                        "Published"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div className="lesson-stat-card">
              <div className="lesson-stat-icon">
                📝
              </div>

              <div>
                <span>Drafts</span>

                <strong>
                  {
                    lessons.filter(
                      (lesson) =>
                        lesson.status === "Draft"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div className="lesson-stat-card">
              <div className="lesson-stat-icon">
                ⏱️
              </div>

              <div>
                <span>Course Lessons</span>
                <strong>{lessons.length}</strong>
              </div>
            </div>
          </div>

          {/* Add/Edit Lesson Form */}
          {showLessonForm && (
            <section className="lesson-form-card">
              <div className="lesson-form-header">
                <div>
                  <span className="lesson-form-eyebrow">
                    {editingLessonId !== null
                      ? "EDIT LESSON"
                      : "NEW LESSON"}
                  </span>

                  <h2>
                    {editingLessonId !== null
                      ? "Edit Lesson"
                      : "Add New Lesson"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="close-form-button"
                  onClick={handleCancelForm}
                >
                  ✕
                </button>
              </div>

              <div className="lesson-form-grid">
                <div className="lesson-form-group full-width">
                  <label htmlFor="lesson-title">
                    Lesson Title *
                  </label>

                  <input
                    id="lesson-title"
                    type="text"
                    placeholder="e.g. Introduction to React Hooks"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                  />
                </div>

                <div className="lesson-form-group">
                  <label htmlFor="lesson-type">
                    Lesson Type
                  </label>

                  <select
                    id="lesson-type"
                    value={type}
                    onChange={(event) =>
                      setType(
                        event.target
                          .value as Lesson["type"]
                      )
                    }
                  >
                    <option value="Video">
                      Video
                    </option>

                    <option value="Article">
                      Article
                    </option>

                    <option value="Quiz">
                      Quiz
                    </option>
                  </select>
                </div>

                <div className="lesson-form-group">
                  <label htmlFor="lesson-duration">
                    Duration
                  </label>

                  <input
                    id="lesson-duration"
                    type="text"
                    placeholder="e.g. 25 min"
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value)
                    }
                  />
                </div>

                <div className="lesson-form-group full-width">
                  <label htmlFor="lesson-description">
                    Description *
                  </label>

                  <textarea
                    id="lesson-description"
                    rows={5}
                    placeholder="Describe what students will learn in this lesson..."
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="lesson-form-group">
                  <label htmlFor="lesson-status">
                    Status
                  </label>

                  <select
                    id="lesson-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as Lesson["status"]
                      )
                    }
                  >
                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Published">
                      Published
                    </option>
                  </select>
                </div>
              </div>

              <div className="lesson-form-actions">
                <button
                  type="button"
                  className="cancel-lesson-button"
                  onClick={handleCancelForm}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-lesson-button"
                  onClick={handleSaveLesson}
                >
                  {editingLessonId !== null
                    ? "Save Changes"
                    : "Add Lesson"}
                </button>
              </div>
            </section>
          )}

          {/* Lessons */}
          <section className="lessons-section">
            <div className="lessons-section-header">
              <div>
                <h2>Course Lessons</h2>

                <p>
                  Manage the lessons for{" "}
                  <strong>
                    {selectedCourse?.title}
                  </strong>
                </p>
              </div>

              <span className="lesson-count">
                {lessons.length}{" "}
                {lessons.length === 1
                  ? "Lesson"
                  : "Lessons"}
              </span>
            </div>

            {lessons.length > 0 ? (
              <div className="lessons-list">
                {lessons.map((lesson, index) => (
                  <div
                    className="lesson-item"
                    key={lesson.id}
                  >
                    <div className="lesson-number">
                      {index + 1}
                    </div>

                    <div className="lesson-type-icon">
                      {lesson.type === "Video"
                        ? "▶️"
                        : lesson.type ===
                          "Article"
                        ? "📄"
                        : "📝"}
                    </div>

                    <div className="lesson-details">
                      <div className="lesson-title-row">
                        <h3>{lesson.title}</h3>

                        <span
                          className={`lesson-status ${
                            lesson.status ===
                            "Published"
                              ? "published"
                              : "draft"
                          }`}
                        >
                          {lesson.status}
                        </span>
                      </div>

                      <p>
                        {lesson.description}
                      </p>

                      <div className="lesson-meta">
                        <span>
                          {lesson.type}
                        </span>

                        <span>•</span>

                        <span>
                          {lesson.duration}
                        </span>
                      </div>
                    </div>

                    <div className="lesson-actions">
                      <button
                        type="button"
                        className="lesson-action-button edit"
                        onClick={() =>
                          handleEditLesson(
                            lesson
                          )
                        }
                        title="Edit lesson"
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        className="lesson-action-button delete"
                        onClick={() =>
                          handleDeleteLesson(
                            lesson.id
                          )
                        }
                        title="Delete lesson"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-lessons">
                <div className="empty-lessons-icon">
                  📚
                </div>

                <h3>No lessons yet</h3>

                <p>
                  Start building your course by adding
                  your first lesson.
                </p>

                <button
                  type="button"
                  onClick={handleAddLesson}
                >
                  + Add First Lesson
                </button>
              </div>
            )}
          </section>

          {/* Bottom CTA */}
          <section className="lessons-info-banner">
            <div className="lessons-info-icon">
              💡
            </div>

            <div>
              <h3>
                Keep your lessons organized
              </h3>

              <p>
                Create clear lesson titles and
                descriptions to help students understand
                what they will learn.
              </p>
            </div>
          </section>
        </section>

        {/* Footer */}
        <footer className="manage-lessons-footer">
          <div>
            <strong>LearnHub</strong>

            <span>
              © 2026 LearnHub. All rights reserved.
            </span>
          </div>

          <div className="manage-lessons-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default ManageLessons;
