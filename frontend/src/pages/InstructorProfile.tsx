
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InstructorProfile.css";

const InstructorProfile = () => {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("Supriya Enjam");
  const [email, setEmail] = useState("supriya@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [location, setLocation] = useState("Telangana, India");
  const [bio, setBio] = useState(
    "Passionate instructor focused on helping students build practical skills in modern web development."
  );
  const [expertise, setExpertise] = useState([
    "React",
    "TypeScript",
    "JavaScript",
    "HTML & CSS",
    "Web Development",
  ]);

  const [newExpertise, setNewExpertise] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Instructor profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddExpertise = () => {
    const skill = newExpertise.trim();

    if (!skill) {
      return;
    }

    if (expertise.includes(skill)) {
      alert("This expertise is already added.");
      return;
    }

    setExpertise([...expertise, skill]);
    setNewExpertise("");
  };

  const handleRemoveExpertise = (skill: string) => {
    setExpertise(expertise.filter((item) => item !== skill));
  };

  return (
    <div className="instructor-profile-page">
      {/* Sidebar */}
      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <div className="instructor-brand-icon">L</div>

          <div className="instructor-brand-text">
            <h2 className="instructor-brand-title">LearnHub</h2>
            <span className="instructor-brand-subtitle">
              Instructor Portal
            </span>
          </div>
        </div>

        <nav className="instructor-navigation">
          <div className="instructor-nav-section">
            <span className="instructor-nav-label">MAIN</span>

            <Link
              to="/instructor/dashboard"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">⌂</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/instructor/courses"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">▣</span>
              <span>My Courses</span>
            </Link>

            <Link
              to="/instructor/courses/create"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">＋</span>
              <span>Create Course</span>
            </Link>
          </div>

          <div className="instructor-nav-section">
            <span className="instructor-nav-label">MANAGE</span>

            <Link
              to="/instructor/lessons"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">▤</span>
              <span>Manage Lessons</span>
            </Link>

            <Link
              to="/instructor/students"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">♙</span>
              <span>Students</span>
            </Link>

            <Link
              to="/instructor/quizzes"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">?</span>
              <span>Quizzes</span>
            </Link>

            <Link
              to="/instructor/analytics"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">◒</span>
              <span>Analytics</span>
            </Link>
          </div>

          <div className="instructor-nav-section">
            <span className="instructor-nav-label">ACCOUNT</span>

            <Link
              to="/profile"
              className="instructor-nav-link active"
            >
              <span className="instructor-nav-icon">♙</span>
              <span>Profile</span>
            </Link>

            <Link
              to="/settings"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">⚙</span>
              <span>Settings</span>
            </Link>

            <Link
              to="/help"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">?</span>
              <span>Help Center</span>
            </Link>
          </div>
        </nav>

        <div className="instructor-sidebar-bottom">
          <div className="instructor-support-card">
            <div className="instructor-support-icon">?</div>

            <div>
              <strong>Need help?</strong>
              <p>Visit our Help Center</p>
            </div>
          </div>

          <button
            className="instructor-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="instructor-main">
        {/* Topbar */}
        <header className="instructor-topbar">
          <div className="instructor-breadcrumb">
            <span>Instructor</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Profile</strong>
          </div>

          <div className="instructor-topbar-right">
            <button className="instructor-notification">
              ♢
              <span className="notification-dot"></span>
            </button>

            <div className="instructor-profile-wrapper">
              <button
                className="instructor-profile-button"
                onClick={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
              >
                <div className="instructor-avatar">S</div>

                <div className="instructor-user-info">
                  <strong>Supriya Enjam</strong>
                  <span>Instructor</span>
                </div>

                <span className="profile-chevron">
                  {showProfileMenu ? "▲" : "▼"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="instructor-profile-menu">
                  <Link to="/profile">My Profile</Link>
                  <Link to="/settings">Settings</Link>

                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="instructor-content">
          <div className="profile-page-header">
            <div>
              <span className="welcome-label">
                INSTRUCTOR ACCOUNT
              </span>

              <h1>My Profile</h1>

              <p>
                Manage your instructor information and teaching
                expertise.
              </p>
            </div>

            {!isEditing && (
              <button
                className="edit-profile-button"
                onClick={() => setIsEditing(true)}
              >
                ✎ Edit Profile
              </button>
            )}
          </div>

          {/* Profile Hero */}
          <section className="instructor-profile-hero">
            <div className="large-profile-avatar">S</div>

            <div className="profile-hero-info">
              <h2>{name}</h2>

              <span className="instructor-role-badge">
                Instructor
              </span>

              <p>
                <span>✉</span> {email}
              </p>

              <p>
                <span>⌖</span> {location}
              </p>
            </div>

            <div className="profile-hero-stats">
              <div>
                <strong>4</strong>
                <span>Courses</span>
              </div>

              <div>
                <strong>558</strong>
                <span>Students</span>
              </div>

              <div>
                <strong>4.8</strong>
                <span>Rating</span>
              </div>
            </div>
          </section>

          {/* Personal Information */}
          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="section-label">
                  PERSONAL INFORMATION
                </span>
                <h2>Basic Information</h2>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label htmlFor="name">Full Name</label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  disabled={!isEditing}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled={!isEditing}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="phone">Phone Number</label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  disabled={!isEditing}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="location">Location</label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  disabled={!isEditing}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="profile-form-group full-width">
                <label htmlFor="bio">Instructor Bio</label>

                <textarea
                  id="bio"
                  rows={5}
                  value={bio}
                  disabled={!isEditing}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Expertise */}
          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="section-label">
                  TEACHING EXPERTISE
                </span>

                <h2>Skills & Expertise</h2>

                <p>
                  Add the skills and technologies you teach.
                </p>
              </div>
            </div>

            <div className="expertise-list">
              {expertise.map((skill) => (
                <div className="expertise-tag" key={skill}>
                  <span>{skill}</span>

                  {isEditing && (
                    <button
                      onClick={() =>
                        handleRemoveExpertise(skill)
                      }
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="add-expertise">
                <input
                  type="text"
                  placeholder="Enter a skill..."
                  value={newExpertise}
                  onChange={(e) =>
                    setNewExpertise(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddExpertise();
                    }
                  }}
                />

                <button onClick={handleAddExpertise}>
                  + Add Skill
                </button>
              </div>
            )}
          </section>

          {/* Teaching Summary */}
          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="section-label">
                  TEACHING SUMMARY
                </span>

                <h2>Instructor Overview</h2>
              </div>
            </div>

            <div className="teaching-summary-grid">
              <div className="teaching-summary-card">
                <div className="summary-icon courses">
                  ▣
                </div>

                <div>
                  <strong>4</strong>
                  <span>Total Courses</span>
                </div>
              </div>

              <div className="teaching-summary-card">
                <div className="summary-icon students">
                  ♙
                </div>

                <div>
                  <strong>558</strong>
                  <span>Total Students</span>
                </div>
              </div>

              <div className="teaching-summary-card">
                <div className="summary-icon lessons">
                  ▤
                </div>

                <div>
                  <strong>102</strong>
                  <span>Total Lessons</span>
                </div>
              </div>

              <div className="teaching-summary-card">
                <div className="summary-icon rating">
                  ★
                </div>

                <div>
                  <strong>4.8</strong>
                  <span>Average Rating</span>
                </div>
              </div>
            </div>
          </section>

          {/* Save Actions */}
          {isEditing && (
            <div className="profile-actions">
              <button
                className="cancel-profile-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                className="save-profile-button"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Info Banner */}
          <div className="profile-info-banner">
            <div className="profile-info-icon">i</div>

            <div>
              <strong>Keep your profile updated</strong>

              <p>
                A complete instructor profile helps students
                understand your expertise and choose the right
                courses.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="instructor-footer">
          <p>© 2026 LearnHub. All rights reserved.</p>

          <div className="instructor-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/">Visit Student Portal</Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default InstructorProfile;
