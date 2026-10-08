
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./CreateCourse.css";

function CreateCourse() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [status, setStatus] = useState<"Published" | "Draft">("Draft");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categoryList, setCategoryList] = useState<any[]>([]);

  useEffect(() => {
    api.categories
      .getAll()
      .then((res) => {
        const list = res.data || res.categories || [];
        setCategoryList(list);
        if (list.length > 0 && !category) {
          setCategory(list[0]._id || list[0].name);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !category || !level || !description.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.mentor.createCourse({
        title: title.trim(),
        category,
        level: level.toLowerCase(),
        description: description.trim(),
        requirements: requirements.split("\n").map((r) => r.trim()).filter(Boolean),
        learningOutcomes: learningOutcomes.split("\n").map((o) => o.trim()).filter(Boolean),
        thumbnailUrl: thumbnail.trim(),
      });

      const newId = res?.data?._id;

      if (status === "Published" && newId) {
        try {
          await api.mentor.publishCourse(newId);
        } catch {
          // May require at least one lesson before publishing
        }
      }

      alert("Course created successfully!");
      if (newId) {
        navigate(`/instructor/courses/edit/${newId}`);
      } else {
        navigate("/instructor/courses");
      }
    } catch (err) {
      alert(getErrorMessage(err, "Failed to create course. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-course-page">
      {/* Sidebar */}
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
          {/* Main */}
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
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">
                📚
              </span>
              <span>My Courses</span>
            </Link>

            <Link
              to="/instructor/courses/create"
              className="instructor-nav-link active"
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

          {/* Management */}
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

          {/* Account */}
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

        {/* Sidebar Bottom */}
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

      {/* Main */}
      <main className="create-course-main">
        {/* Topbar */}
        <header className="create-course-topbar">
          <div className="create-course-breadcrumb">
            <Link to="/instructor/dashboard">
              Instructor
            </Link>

            <span>/</span>

            <Link to="/instructor/courses">
              My Courses
            </Link>

            <span>/</span>

            <strong>Create Course</strong>
          </div>

          <div className="create-course-topbar-right">
            {/* Notification */}
            <button
              type="button"
              className="create-course-notification"
              aria-label="Notifications"
              onClick={() => navigate("/notifications")}
            >
              🔔
              <span className="notification-dot"></span>
            </button>

            {/* Profile */}
            <div className="create-course-profile-wrapper">
              <button
                type="button"
                className="create-course-profile-button"
                onClick={() =>
                  setShowProfileMenu(
                    (previous) => !previous
                  )
                }
              >
                <div className="create-course-avatar">
                  AY
                </div>

                <div className="create-course-user-info">
                  <strong>Archie Yadav</strong>
                  <span>Instructor</span>
                </div>

                <span className="create-course-profile-chevron">
                  {showProfileMenu ? "▲" : "▼"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="create-course-profile-menu">
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

        {/* Content */}
        <section className="create-course-content">
          {/* Header */}
          <div className="create-course-header">
            <div>
              <span className="create-course-eyebrow">
                COURSE MANAGEMENT
              </span>

              <h1>Create New Course</h1>

              <p>
                Share your knowledge with students by creating
                a new course. Fill in the details below to get
                started.
              </p>
            </div>

            <Link
              to="/instructor/courses"
              className="back-courses-button"
            >
              ← Back to Courses
            </Link>
          </div>

          <form
            className="create-course-form"
            onSubmit={handleSubmit}
          >
            {/* Basic Information */}
            <section className="create-course-card">
              <div className="create-course-card-header">
                <div className="create-course-card-icon">
                  📚
                </div>

                <div>
                  <h2>Basic Information</h2>

                  <p>
                    Provide the main information about your
                    course.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                {/* Course Title */}
                <div className="form-group full-width">
                  <label htmlFor="title">
                    Course Title <span>*</span>
                  </label>

                  <input
                    id="title"
                    type="text"
                    placeholder="e.g. Complete React & TypeScript"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    required
                  />

                  <small>
                    Choose a clear and descriptive title.
                  </small>
                </div>

                {/* Category */}
                <div className="form-group">
                  <label htmlFor="category">
                    Category <span>*</span>
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select category
                    </option>
                    {categoryList.length > 0 ? (
                      categoryList.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Web Development">Web Development</option>
                        <option value="Programming">Programming</option>
                        <option value="Web Design">Web Design</option>
                        <option value="Backend Development">Backend Development</option>
                        <option value="Database">Database</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Mobile Development">Mobile Development</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Level */}
                <div className="form-group">
                  <label htmlFor="level">
                    Course Level <span>*</span>
                  </label>

                  <select
                    id="level"
                    value={level}
                    onChange={(event) =>
                      setLevel(event.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select level
                    </option>

                    <option value="Beginner">
                      Beginner
                    </option>

                    <option value="Intermediate">
                      Intermediate
                    </option>

                    <option value="Advanced">
                      Advanced
                    </option>

                    <option value="All Levels">
                      All Levels
                    </option>
                  </select>
                </div>

                {/* Duration */}
                <div className="form-group">
                  <label htmlFor="duration">
                    Estimated Duration
                  </label>

                  <input
                    id="duration"
                    type="text"
                    placeholder="e.g. 8 weeks"
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value)
                    }
                  />
                </div>

                {/* Price */}
                <div className="form-group">
                  <label htmlFor="price">
                    Course Price
                  </label>

                  <div className="input-with-prefix">
                    <span>₹</span>

                    <input
                      id="price"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={price}
                      onChange={(event) =>
                        setPrice(event.target.value)
                      }
                    />
                  </div>

                  <small>
                    Enter 0 if this is a free course.
                  </small>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="create-course-card">
              <div className="create-course-card-header">
                <div className="create-course-card-icon">
                  ✍️
                </div>

                <div>
                  <h2>Course Description</h2>

                  <p>
                    Explain what students will learn from
                    your course.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description <span>*</span>
                </label>

                <textarea
                  id="description"
                  rows={7}
                  placeholder="Write a detailed description of your course..."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  required
                />

                <small>
                  Give students a clear overview of the
                  course.
                </small>
              </div>
            </section>

            {/* Learning Outcomes */}
            <section className="create-course-card">
              <div className="create-course-card-header">
                <div className="create-course-card-icon">
                  🎯
                </div>

                <div>
                  <h2>What Students Will Learn</h2>

                  <p>
                    List the main skills and outcomes students
                    will gain.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="learningOutcomes">
                  Learning Outcomes
                </label>

                <textarea
                  id="learningOutcomes"
                  rows={6}
                  placeholder={
                    "Example:\nUnderstand React fundamentals\nBuild reusable components\nWork with TypeScript\nCreate modern applications"
                  }
                  value={learningOutcomes}
                  onChange={(event) =>
                    setLearningOutcomes(
                      event.target.value
                    )
                  }
                />

                <small>
                  You can add one learning outcome per
                  line.
                </small>
              </div>
            </section>

            {/* Requirements */}
            <section className="create-course-card">
              <div className="create-course-card-header">
                <div className="create-course-card-icon">
                  📋
                </div>

                <div>
                  <h2>Requirements</h2>

                  <p>
                    Tell students what they should know
                    before starting.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="requirements">
                  Course Requirements
                </label>

                <textarea
                  id="requirements"
                  rows={5}
                  placeholder={
                    "Example:\nBasic programming knowledge\nA computer with internet access\nWillingness to learn"
                  }
                  value={requirements}
                  onChange={(event) =>
                    setRequirements(
                      event.target.value
                    )
                  }
                />

                <small>
                  Add prerequisites or tools students may
                  need.
                </small>
              </div>
            </section>

            {/* Thumbnail */}
            <section className="create-course-card">
              <div className="create-course-card-header">
                <div className="create-course-card-icon">
                  🖼️
                </div>

                <div>
                  <h2>Course Thumbnail</h2>

                  <p>
                    Add an image URL that represents your
                    course.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="thumbnail">
                  Thumbnail URL
                </label>

                <input
                  id="thumbnail"
                  type="url"
                  placeholder="https://example.com/course-image.jpg"
                  value={thumbnail}
                  onChange={(event) =>
                    setThumbnail(event.target.value)
                  }
                />

                <small>
                  Backend file upload can be connected
                  later.
                </small>
              </div>

              {thumbnail && (
                <div className="thumbnail-preview">
                  <img
                    src={thumbnail}
                    alt="Course thumbnail preview"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              )}
            </section>

            {/* Publishing Options */}
            <section className="create-course-card">
              <div className="create-course-card-header">
                <div className="create-course-card-icon">
                  🚀
                </div>

                <div>
                  <h2>Publishing Options</h2>

                  <p>
                    Choose whether to publish your course
                    now or save it as a draft.
                  </p>
                </div>
              </div>

              <div className="publishing-options">
                {/* Draft */}
                <label
                  className={`publishing-option ${
                    status === "Draft"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="Draft"
                    checked={status === "Draft"}
                    onChange={() =>
                      setStatus("Draft")
                    }
                  />

                  <div>
                    <strong>Save as Draft</strong>

                    <span>
                      Continue editing the course later.
                    </span>
                  </div>
                </label>

                {/* Published */}
                <label
                  className={`publishing-option ${
                    status === "Published"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="Published"
                    checked={status === "Published"}
                    onChange={() =>
                      setStatus("Published")
                    }
                  />

                  <div>
                    <strong>Publish Course</strong>

                    <span>
                      Make the course available to students.
                    </span>
                  </div>
                </label>
              </div>
            </section>

            {/* Form Actions */}
            <div className="create-course-form-actions">
              <Link
                to="/instructor/courses"
                className="cancel-course-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="save-course-button"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : status === "Published"
                  ? "🚀 Publish Course"
                  : "💾 Save as Draft"}
              </button>
            </div>
          </form>
        </section>

        {/* Footer */}
        <footer className="create-course-footer">
          <div>
            <strong>LearnHub</strong>

            <span>
              © 2026 LearnHub. All rights reserved.
            </span>
          </div>

          <div className="create-course-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default CreateCourse;
