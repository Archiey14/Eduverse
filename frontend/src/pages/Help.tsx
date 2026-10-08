
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Help.css";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: "How do I enroll in a course?",
    answer:
      "Browse the Courses or Discover page and select the course you are interested in. Open the course details and click the Enroll Now button to start learning.",
    category: "Courses",
  },
  {
    id: 2,
    question: "How can I track my learning progress?",
    answer:
      "Go to the Progress page from the sidebar. You can view your overall completion percentage, completed lessons, learning hours, streak, and individual course progress.",
    category: "Progress",
  },
  {
    id: 3,
    question: "Where can I find my quizzes?",
    answer:
      "Open the Quizzes page from the sidebar. You can view upcoming quizzes, completed quizzes, scores, and quiz-related information from one place.",
    category: "Quizzes",
  },
  {
    id: 4,
    question: "How do I update my profile?",
    answer:
      "Open your Profile from the sidebar and select Edit Profile. Update your personal information, skills, interests, or bio and then save your changes.",
    category: "Account",
  },
  {
    id: 5,
    question: "How can I change my account settings?",
    answer:
      "Open Settings from the sidebar. You can manage your account preferences, security options, notifications, privacy, language, and appearance settings.",
    category: "Account",
  },
  {
    id: 6,
    question: "How do I save a course to my wishlist?",
    answer:
      "Open any course from the Courses or Discover page and select the wishlist icon. Your saved courses can be viewed anytime from the Wishlist page.",
    category: "Courses",
  },
  {
    id: 7,
    question: "How do achievements work?",
    answer:
      "Achievements recognize your learning milestones. You can earn them by completing courses, finishing quizzes, maintaining learning streaks, and reaching other learning goals.",
    category: "Achievements",
  },
  {
    id: 8,
    question: "Can I contact the support team?",
    answer:
      "Yes. If you cannot find the answer you need in our Help Center, use the Email Support or Live Chat options below to contact the support team.",
    category: "Support",
  },
];

const quickHelpItems = [
  {
    title: "Courses",
    description: "Find courses, enroll, and start learning.",
    icon: "▣",
    path: "/courses",
    className: "courses-icon",
  },
  {
    title: "Quizzes",
    description: "Manage quizzes, attempts, and scores.",
    icon: "✓",
    path: "/quizzes",
    className: "quizzes-icon",
  },
  {
    title: "Progress",
    description: "Track your learning journey and goals.",
    icon: "◔",
    path: "/progress",
    className: "progress-icon",
  },
  {
    title: "Settings",
    description: "Manage your account and preferences.",
    icon: "⚙",
    path: "/settings",
    className: "settings-icon",
  },
];

function Help() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const displayName = user?.name || "Student";
  const initials = displayName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const filteredFAQs = faqs.filter((faq) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.category.toLowerCase().includes(query)
    );
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ((currentId) => (currentId === id ? null : id));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setOpenFAQ(null);
  };

  return (
    <div className="help-page">

      {/* ========================================
          SIDEBAR
      ======================================== */}
      <aside className="help-sidebar">

        {/* Logo */}
        <div className="help-logo">
          <div className="help-logo-icon">
            L
          </div>

          <div className="help-logo-text">
            <span className="help-logo-title">
              LearnHub
            </span>

            <span className="help-logo-subtitle">
              Learning Platform
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="help-navigation">

          {/* Main */}
          <div className="help-nav-section">

            <p className="help-nav-label">
              MAIN
            </p>

            <Link
              to="/student/dashboard"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ⌂
              </span>

              <span>
                Dashboard
              </span>
            </Link>

            <Link
              to="/courses"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ▣
              </span>

              <span>
                My Courses
              </span>
            </Link>

            <Link
              to="/discover"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ⌕
              </span>

              <span>
                Discover
              </span>
            </Link>

            <Link
              to="/quizzes"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ✓
              </span>

              <span>
                Quizzes
              </span>
            </Link>

          </div>

          {/* Learning */}
          <div className="help-nav-section">

            <p className="help-nav-label">
              LEARNING
            </p>

            <Link
              to="/progress"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ◔
              </span>

              <span>
                Progress
              </span>
            </Link>

            <Link
              to="/activities"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ◷
              </span>

              <span>
                Activities
              </span>
            </Link>

            <Link
              to="/achievements"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ★
              </span>

              <span>
                Achievements
              </span>
            </Link>

            <Link
              to="/wishlist"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ♡
              </span>

              <span>
                Wishlist
              </span>
            </Link>

          </div>

          {/* Account */}
          <div className="help-nav-section">

            <p className="help-nav-label">
              ACCOUNT
            </p>

            <Link
              to="/profile"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ◉
              </span>

              <span>
                Profile
              </span>
            </Link>

            <Link
              to="/settings"
              className="help-nav-link"
            >
              <span className="help-nav-icon">
                ⚙
              </span>

              <span>
                Settings
              </span>
            </Link>

            <Link
              to="/help"
              className="help-nav-link active"
            >
              <span className="help-nav-icon">
                ?
              </span>

              <span>
                Help & Support
              </span>
            </Link>

          </div>

        </nav>

        {/* Sidebar Bottom */}
        <div className="help-sidebar-bottom">

          <div className="help-support-card">

            <div className="help-support-icon">
              ?
            </div>

            <div>
              <h4>
                Need help?
              </h4>

              <p>
                We're here for you.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="help-logout-button"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}
      <main className="help-main">

        {/* Topbar */}
        <header className="help-topbar">

          <div className="help-topbar-left">

            <div className="help-breadcrumb-wrapper">
              <span className="help-breadcrumb-muted">
                LearnHub
              </span>

              <span className="help-breadcrumb-separator">
                /
              </span>

              <span className="help-breadcrumb">
                Help & Support
              </span>
            </div>

          </div>

          <div className="help-topbar-right">

            <button
              type="button"
              className="help-notification-button"
              aria-label="Notifications"
              onClick={() =>
                alert("Notifications will be available soon.")
              }
            >
              ♢

              <span className="help-notification-dot"></span>
            </button>

            <Link
              to="/profile"
              className="help-user-profile"
            >
              <div className="help-user-avatar">
                {initials || "S"}
              </div>

              <div className="help-user-info">
                <strong>
                  {displayName}
                </strong>

                <span>
                  Student
                </span>
              </div>
            </Link>

          </div>

        </header>

        {/* ========================================
            HERO
        ======================================== */}
        <section className="help-hero">

          <div className="help-hero-content">

            <div className="help-hero-badge">
              <span>
                ✦
              </span>

              HELP CENTER
            </div>

            <h1>
              How can we help you?
            </h1>

            <p>
              Find answers, explore helpful resources, or get
              in touch with our support team.
            </p>

            {/* Search */}
            <div className="help-search">

              <span className="help-search-icon">
                ⌕
              </span>

              <input
                type="text"
                value={searchQuery}
                placeholder="Search for answers..."
                aria-label="Search help articles"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setOpenFAQ(null);
                }}
              />

              {searchQuery && (
                <button
                  type="button"
                  className="help-search-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>

            <div className="help-search-hint">
              Search questions about courses, quizzes,
              progress, profile, and more.
            </div>

          </div>

        </section>

        {/* ========================================
            PAGE CONTENT
        ======================================== */}
        <div className="help-content">

          {/* ========================================
              QUICK HELP
          ======================================== */}
          <section className="help-section">

            <div className="help-section-header">

              <div>
                <span className="help-section-label">
                  GET STARTED
                </span>

                <h2>
                  Quick Help
                </h2>

                <p>
                  Jump directly to the information you need.
                </p>
              </div>

            </div>

            <div className="help-quick-grid">

              {quickHelpItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  className="help-quick-card"
                >

                  <div
                    className={`help-quick-icon ${item.className}`}
                  >
                    {item.icon}
                  </div>

                  <div className="help-quick-content">

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description}
                    </p>

                  </div>

                  <span className="help-quick-arrow">
                    →
                  </span>

                </Link>
              ))}

            </div>

          </section>

          {/* ========================================
              FAQ SECTION
          ======================================== */}
          <section className="help-section">

            <div className="help-section-header">

              <div>
                <span className="help-section-label">
                  FAQ
                </span>

                <h2>
                  Frequently Asked Questions
                </h2>

                <p>
                  Answers to the questions learners ask most often.
                </p>
              </div>

              <span className="help-faq-count">
                {filteredFAQs.length}{" "}
                {filteredFAQs.length === 1
                  ? "question"
                  : "questions"}
              </span>

            </div>

            <div className="help-faq-list">

              {filteredFAQs.length > 0 ? (

                filteredFAQs.map((faq) => (

                  <div
                    key={faq.id}
                    className={`help-faq-item ${
                      openFAQ === faq.id
                        ? "open"
                        : ""
                    }`}
                  >

                    <button
                      type="button"
                      className="help-faq-question"
                      onClick={() => toggleFAQ(faq.id)}
                      aria-expanded={openFAQ === faq.id}
                    >

                      <div className="help-faq-question-content">

                        <span className="help-faq-category">
                          {faq.category}
                        </span>

                        <span className="help-faq-title">
                          {faq.question}
                        </span>

                      </div>

                      <span
                        className="help-faq-toggle"
                        aria-hidden="true"
                      >
                        {openFAQ === faq.id
                          ? "−"
                          : "+"}
                      </span>

                    </button>

                    {openFAQ === faq.id && (

                      <div className="help-faq-answer">

                        <p>
                          {faq.answer}
                        </p>

                      </div>

                    )}

                  </div>

                ))

              ) : (

                <div className="help-empty-state">

                  <div className="help-empty-icon">
                    ?
                  </div>

                  <h3>
                    No answers found
                  </h3>

                  <p>
                    We couldn't find any help articles
                    matching "{searchQuery}".
                  </p>

                  <button
                    type="button"
                    onClick={clearSearch}
                  >
                    Clear Search
                  </button>

                </div>

              )}

            </div>

          </section>

          {/* ========================================
              SUPPORT SECTION
          ======================================== */}
          <section className="help-contact-section">

            <div className="help-contact-content">

              <div className="help-contact-icon">
                ♡
              </div>

              <div className="help-contact-text">

                <span className="help-section-label">
                  NEED MORE HELP?
                </span>

                <h2>
                  Our support team is here for you.
                </h2>

                <p>
                  If you couldn't find what you were looking
                  for, our support team is ready to help.
                </p>

              </div>

              <div className="help-contact-actions">

                <button
                  type="button"
                  className="help-contact-button primary"
                  onClick={() =>
                    alert(
                      "Email support will be connected soon."
                    )
                  }
                >
                  <span>
                    ✉
                  </span>

                  Email Support
                </button>

                <button
                  type="button"
                  className="help-contact-button secondary"
                  onClick={() =>
                    alert(
                      "Live chat will be connected soon."
                    )
                  }
                >
                  <span>
                    ◌
                  </span>

                  Live Chat
                </button>

              </div>

            </div>

          </section>

        </div>

        {/* ========================================
            FOOTER
        ======================================== */}
        <footer className="help-footer">

          <div className="help-footer-left">

            <div className="help-footer-logo">
              L
            </div>

            <div>
              <strong>
                LearnHub
              </strong>

              <span>
                © 2026 LearnHub. All rights reserved.
              </span>
            </div>

          </div>

          <div className="help-footer-links">

            <Link to="/help">
              Help Center
            </Link>

            <Link to="/settings">
              Privacy
            </Link>

            <Link to="/settings">
              Terms
            </Link>

          </div>

        </footer>

      </main>

    </div>
  );
}

export default Help;
