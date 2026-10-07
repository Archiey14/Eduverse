
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InstructorSettings.css";

function InstructorSettings() {
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [email, setEmail] = useState("supriya@example.com");
  const [fullName, setFullName] = useState("Supriya Enjam");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studentNotifications, setStudentNotifications] = useState(true);
  const [courseNotifications, setCourseNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] =
    useState(false);

  const [showProfile, setShowProfile] = useState(true);
  const [showCourseStats, setShowCourseStats] = useState(true);

  const [theme, setTheme] = useState("Light");

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    alert("Settings saved successfully!");
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="instructor-settings-page">
      {/* Sidebar */}
      <aside className="instructor-sidebar">
        <div className="instructor-logo">
          <div className="logo-icon">L</div>
          <div>
            <h2>LearnHub</h2>
            <span>Instructor Portal</span>
          </div>
        </div>

        <nav className="instructor-nav">
          <p className="nav-section-title">MAIN</p>

          <Link to="/instructor/dashboard" className="nav-item">
            <span className="nav-icon">⌂</span>
            Dashboard
          </Link>

          <Link to="/instructor/courses" className="nav-item">
            <span className="nav-icon">▣</span>
            My Courses
          </Link>

          <Link
            to="/instructor/courses/create"
            className="nav-item create-nav-item"
          >
            <span className="nav-icon">＋</span>
            Create Course
          </Link>

          <p className="nav-section-title">MANAGEMENT</p>

          <Link to="/instructor/lessons" className="nav-item">
            <span className="nav-icon">☷</span>
            Manage Lessons
          </Link>

          <Link to="/instructor/students" className="nav-item">
            <span className="nav-icon">♙</span>
            Students
          </Link>

          <Link to="/instructor/quizzes" className="nav-item">
            <span className="nav-icon">✓</span>
            Quizzes
          </Link>

          <Link to="/instructor/analytics" className="nav-item">
            <span className="nav-icon">▥</span>
            Analytics
          </Link>

          <p className="nav-section-title">ACCOUNT</p>

          <Link to="/instructor/profile" className="nav-item">
            <span className="nav-icon">♙</span>
            Profile
          </Link>

          <Link
            to="/instructor/settings"
            className="nav-item active"
          >
            <span className="nav-icon">⚙</span>
            Settings
          </Link>

          <Link to="/help" className="nav-item">
            <span className="nav-icon">?</span>
            Help & Support
          </Link>
        </nav>

        <div className="instructor-sidebar-support">
          <div className="support-icon">?</div>
          <div>
            <strong>Need Help?</strong>
            <p>Visit our support center</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="instructor-main">
        {/* Topbar */}
        <header className="instructor-topbar">
          <div>
            <p className="topbar-label">Instructor Portal</p>
            <h3>Settings</h3>
          </div>

          <div className="topbar-actions">
            <button className="notification-button" title="Notifications">
              ♢
              <span className="notification-dot"></span>
            </button>

            <div className="profile-wrapper">
              <button
                className="profile-button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="profile-avatar">SE</div>

                <div className="profile-info">
                  <strong>Supriya Enjam</strong>
                  <span>Instructor</span>
                </div>

                <span className="profile-arrow">⌄</span>
              </button>

              {profileMenuOpen && (
                <div className="profile-menu">
                  <Link to="/instructor/profile">My Profile</Link>
                  <Link to="/instructor/settings">Settings</Link>

                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="settings-content">
          <div className="settings-header">
            <div>
              <span className="page-badge">ACCOUNT SETTINGS</span>

              <h1>Settings</h1>

              <p>
                Manage your account preferences, notifications,
                privacy and security.
              </p>
            </div>
          </div>

          {/* Account Information */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">♙</div>

              <div>
                <h2>Account Information</h2>
                <p>
                  Update the basic information associated with your
                  instructor account.
                </p>
              </div>
            </div>

            <div className="settings-divider"></div>

            <div className="settings-form-grid">
              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </section>

          {/* Password & Security */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">🔒</div>

              <div>
                <h2>Password & Security</h2>
                <p>
                  Keep your account secure by regularly updating
                  your password.
                </p>
              </div>
            </div>

            <div className="settings-divider"></div>

            <div className="password-fields">
              <div className="form-group">
                <label>Current Password</label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div className="settings-form-grid">
                <div className="form-group">
                  <label>New Password</label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="security-note">
              <span>🔐</span>
              <p>
                Use at least 8 characters with a combination of
                letters, numbers and special characters.
              </p>
            </div>
          </section>

          {/* Notifications */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">♢</div>

              <div>
                <h2>Notifications</h2>
                <p>
                  Choose which notifications you would like to
                  receive.
                </p>
              </div>
            </div>

            <div className="settings-divider"></div>

            <div className="settings-options">
              <div className="setting-option">
                <div>
                  <strong>Email Notifications</strong>
                  <p>
                    Receive important account notifications through
                    email.
                  </p>
                </div>

                <button
                  className={`toggle ${
                    emailNotifications ? "on" : ""
                  }`}
                  onClick={() =>
                    setEmailNotifications(!emailNotifications)
                  }
                >
                  <span></span>
                </button>
              </div>

              <div className="setting-option">
                <div>
                  <strong>Student Activity</strong>
                  <p>
                    Get notified when students enroll or interact
                    with your courses.
                  </p>
                </div>

                <button
                  className={`toggle ${
                    studentNotifications ? "on" : ""
                  }`}
                  onClick={() =>
                    setStudentNotifications(!studentNotifications)
                  }
                >
                  <span></span>
                </button>
              </div>

              <div className="setting-option">
                <div>
                  <strong>Course Updates</strong>
                  <p>
                    Receive notifications about course reviews,
                    ratings and performance.
                  </p>
                </div>

                <button
                  className={`toggle ${
                    courseNotifications ? "on" : ""
                  }`}
                  onClick={() =>
                    setCourseNotifications(!courseNotifications)
                  }
                >
                  <span></span>
                </button>
              </div>

              <div className="setting-option">
                <div>
                  <strong>Platform Updates</strong>
                  <p>
                    Receive news, announcements and educational
                    platform updates.
                  </p>
                </div>

                <button
                  className={`toggle ${
                    marketingNotifications ? "on" : ""
                  }`}
                  onClick={() =>
                    setMarketingNotifications(
                      !marketingNotifications
                    )
                  }
                >
                  <span></span>
                </button>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">◉</div>

              <div>
                <h2>Privacy</h2>
                <p>
                  Control what information is visible to your
                  students.
                </p>
              </div>
            </div>

            <div className="settings-divider"></div>

            <div className="settings-options">
              <div className="setting-option">
                <div>
                  <strong>Public Instructor Profile</strong>
                  <p>
                    Allow students to view your instructor profile
                    and expertise.
                  </p>
                </div>

                <button
                  className={`toggle ${showProfile ? "on" : ""}`}
                  onClick={() => setShowProfile(!showProfile)}
                >
                  <span></span>
                </button>
              </div>

              <div className="setting-option">
                <div>
                  <strong>Show Course Statistics</strong>
                  <p>
                    Allow students to see course enrollment and
                    rating statistics.
                  </p>
                </div>

                <button
                  className={`toggle ${
                    showCourseStats ? "on" : ""
                  }`}
                  onClick={() =>
                    setShowCourseStats(!showCourseStats)
                  }
                >
                  <span></span>
                </button>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">◐</div>

              <div>
                <h2>Appearance</h2>
                <p>
                  Choose how the instructor dashboard looks.
                </p>
              </div>
            </div>

            <div className="settings-divider"></div>

            <div className="appearance-options">
              {["Light", "Dark", "System"].map((option) => (
                <button
                  key={option}
                  className={`theme-option ${
                    theme === option ? "selected" : ""
                  }`}
                  onClick={() => setTheme(option)}
                >
                  <div className="theme-preview">
                    {option === "Light" && "☀"}
                    {option === "Dark" && "◐"}
                    {option === "System" && "▣"}
                  </div>

                  <strong>{option}</strong>

                  {theme === option && (
                    <span className="selected-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="settings-actions">
            <button
              className="cancel-button"
              onClick={() => navigate("/instructor/dashboard")}
            >
              Cancel
            </button>

            <button
              className="save-settings-button"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>

          {/* Information Banner */}
          <div className="settings-info-banner">
            <div className="info-banner-icon">i</div>

            <div>
              <strong>Settings are currently stored locally</strong>
              <p>
                These settings are part of the frontend interface
                for now. They will be connected to your backend
                account system during API integration.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="instructor-footer">
          <div>
            <strong>LearnHub</strong>
            <p>
              Empowering instructors to create meaningful
              learning experiences.
            </p>
          </div>

          <div className="footer-links">
            <Link to="/help">Help & Support</Link>
            <Link to="/instructor/profile">Profile</Link>
            <Link to="/instructor/dashboard">Dashboard</Link>
          </div>

          <p className="footer-copy">
            © 2026 LearnHub. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default InstructorSettings;
