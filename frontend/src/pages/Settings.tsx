
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [courseReminders, setCourseReminders] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("Light");

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name || "Student";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const accountType = user?.roles?.includes("mentor") ? "Student + Instructor" : "Student";

  return (
    <div className="settings-page">

      {/* Sidebar */}
      <aside className="settings-sidebar">

        <div className="settings-logo">
          <div className="settings-logo-icon">L</div>
          <span>LearnHub</span>
        </div>

        <nav className="settings-nav">

          <Link to="/student/dashboard" className="settings-nav-item">
            <span>🏠</span>
            Dashboard
          </Link>

          <Link to="/courses" className="settings-nav-item">
            <span>📚</span>
            My Courses
          </Link>

          <Link to="/discover" className="settings-nav-item">
            <span>🔍</span>
            Discover
          </Link>

          <Link to="/quizzes" className="settings-nav-item">
            <span>📝</span>
            Quizzes
          </Link>

          <Link to="/progress" className="settings-nav-item">
            <span>📊</span>
            Progress
          </Link>

          <Link to="/activities" className="settings-nav-item">
            <span>⚡</span>
            Activities
          </Link>

          <Link to="/achievements" className="settings-nav-item">
            <span>🏆</span>
            Achievements
          </Link>

          <Link to="/wishlist" className="settings-nav-item">
            <span>❤️</span>
            Wishlist
          </Link>

          <Link to="/profile" className="settings-nav-item">
            <span>👤</span>
            Profile
          </Link>

          <Link
            to="/settings"
            className="settings-nav-item active"
          >
            <span>⚙️</span>
            Settings
          </Link>

        </nav>

        <div className="settings-sidebar-bottom">

          <Link to="/help" className="settings-help-card">
            <div className="settings-help-icon">?</div>
            <div>
              <strong>Need Help?</strong>
              <span>Visit our support center</span>
            </div>
          </Link>

          <button
            className="settings-logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>

        </div>
      </aside>

      {/* Main Content */}
      <main className="settings-main">

        {/* Topbar */}
        <header className="settings-topbar">

          <div>
            <h1>Settings</h1>
            <p>Manage your account and preferences</p>
          </div>

          <div className="settings-user">

            <div className="settings-notification">
              🔔
              <span className="notification-dot"></span>
            </div>

            <div className="settings-user-avatar">
              {initials || "S"}
            </div>

            <div className="settings-user-info">
              <strong>{displayName}</strong>
              <span>{accountType}</span>
            </div>

          </div>

        </header>

        {/* Content */}
        <section className="settings-content">

          {/* Account Settings */}
          <div className="settings-card">

            <div className="settings-card-header">
              <div className="settings-section-icon">👤</div>

              <div>
                <h2>Account Settings</h2>
                <p>Manage your account information</p>
              </div>
            </div>

            <div className="settings-form-grid">

              <div className="settings-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  readOnly
                />
              </div>

              <div className="settings-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={displayEmail}
                  readOnly
                />
              </div>

              <div className="settings-field">
                <label>Account Type</label>
                <input
                  type="text"
                  value={accountType}
                  readOnly
                />
              </div>

              <div className="settings-field">
                <label>Member Since</label>
                <input
                  type="text"
                  value="October 2026"
                  readOnly
                />
              </div>

            </div>

            <button
              className="settings-secondary-button"
              onClick={() => navigate("/profile?edit=true")}
            >
              Edit Profile
            </button>

          </div>

          {/* Password */}
          <div className="settings-card">

            <div className="settings-card-header">
              <div className="settings-section-icon">🔒</div>

              <div>
                <h2>Password & Security</h2>
                <p>Keep your account secure</p>
              </div>
            </div>

            <div className="security-row">

              <div>
                <strong>Password</strong>
                <span>Last changed recently</span>
              </div>

              <button
                className="settings-secondary-button"
                onClick={() =>
                  alert("Change password feature will be connected to the backend later.")
                }
              >
                Change Password
              </button>

            </div>

            <div className="security-row">

              <div>
                <strong>Two-Factor Authentication</strong>
                <span>Add an extra layer of security to your account</span>
              </div>

              <button
                className="settings-outline-button"
                onClick={() =>
                  alert("Two-factor authentication will be available soon.")
                }
              >
                Enable
              </button>

            </div>

          </div>

          {/* Notifications */}
          <div className="settings-card">

            <div className="settings-card-header">
              <div className="settings-section-icon">🔔</div>

              <div>
                <h2>Notification Preferences</h2>
                <p>Choose what notifications you want to receive</p>
              </div>
            </div>

            <div className="toggle-row">

              <div>
                <strong>Email Notifications</strong>
                <span>Receive important updates through email</span>
              </div>

              <button
                className={`toggle ${emailNotifications ? "on" : ""}`}
                onClick={() =>
                  setEmailNotifications(!emailNotifications)
                }
                aria-label="Toggle email notifications"
              >
                <span></span>
              </button>

            </div>

            <div className="toggle-row">

              <div>
                <strong>Course Reminders</strong>
                <span>Get reminders about your ongoing courses</span>
              </div>

              <button
                className={`toggle ${courseReminders ? "on" : ""}`}
                onClick={() =>
                  setCourseReminders(!courseReminders)
                }
                aria-label="Toggle course reminders"
              >
                <span></span>
              </button>

            </div>

            <div className="toggle-row">

              <div>
                <strong>Quiz Reminders</strong>
                <span>Receive reminders about upcoming quizzes</span>
              </div>

              <button
                className={`toggle ${quizReminders ? "on" : ""}`}
                onClick={() =>
                  setQuizReminders(!quizReminders)
                }
                aria-label="Toggle quiz reminders"
              >
                <span></span>
              </button>

            </div>

          </div>

          {/* Privacy */}
          <div className="settings-card">

            <div className="settings-card-header">
              <div className="settings-section-icon">🛡️</div>

              <div>
                <h2>Privacy</h2>
                <p>Control how your profile is displayed</p>
              </div>
            </div>

            <div className="toggle-row">

              <div>
                <strong>Public Profile</strong>
                <span>
                  Allow other learners to view your profile
                </span>
              </div>

              <button
                className={`toggle ${profileVisibility ? "on" : ""}`}
                onClick={() =>
                  setProfileVisibility(!profileVisibility)
                }
                aria-label="Toggle profile visibility"
              >
                <span></span>
              </button>

            </div>

          </div>

          {/* Appearance */}
          <div className="settings-card">

            <div className="settings-card-header">
              <div className="settings-section-icon">🎨</div>

              <div>
                <h2>Appearance & Language</h2>
                <p>Customize your learning experience</p>
              </div>
            </div>

            <div className="settings-form-grid">

              <div className="settings-field">
                <label>Language</label>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>English</option>
                  <option>Telugu</option>
                  <option>Hindi</option>
                </select>
              </div>

              <div className="settings-field">
                <label>Theme</label>

                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System Default</option>
                </select>
              </div>

            </div>

          </div>

          {/* Save */}
          <div className="settings-actions">

            <button
              className="settings-save-button"
              onClick={handleSave}
            >
              Save Changes
            </button>

          </div>

        </section>

        {/* Footer */}
        <footer className="settings-footer">

          <p>
            © 2026 LearnHub. All rights reserved.
          </p>

          <div>
            <Link to="/help">Help Center</Link>
            <Link to="/profile">Profile</Link>
          </div>

        </footer>

      </main>

    </div>
  );
}

export default Settings;
