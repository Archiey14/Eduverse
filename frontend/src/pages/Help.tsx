import { useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
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
      "Open the Quizzes page from the sidebar. You can see quizzes from every course you are enrolled in, which ones are still upcoming, which you have passed, and your best scores.",
    category: "Quizzes",
  },
  {
    id: 4,
    question: "How do I update my profile?",
    answer:
      "Open your Profile from the sidebar and select Edit Profile. You can change your name, profile photo, bio and skills, then save your changes.",
    category: "Account",
  },
  {
    id: 5,
    question: "How do I change my password?",
    answer:
      "Open Settings from the sidebar and use the Password & Security section. Enter your current password and a new one of at least 8 characters.",
    category: "Account",
  },
  {
    id: 6,
    question: "How do I save a course to my wishlist?",
    answer:
      "Select the heart icon on any course card in Courses or Discover. Your saved courses can be viewed anytime from the Wishlist page, and you need to be logged in to save them.",
    category: "Courses",
  },
  {
    id: 7,
    question: "How do achievements work?",
    answer:
      "Achievements recognize your learning milestones. You earn them by enrolling in and completing courses, scoring well on quizzes, keeping a learning streak and completing lessons. Progress toward each one is shown on the Achievements page.",
    category: "Achievements",
  },
  {
    id: 8,
    question: "How do I become an instructor?",
    answer:
      "Open the menu next to your name in the top bar and choose Become Instructor. After upgrading you can switch between the student and instructor views at any time from the sidebar.",
    category: "Instructors",
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
    description: "View your quizzes, attempts, and scores.",
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
    description: "Manage your account and password.",
    icon: "⚙",
    path: "/settings",
    className: "settings-icon",
  },
];

function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const query = searchQuery.trim().toLowerCase();
  const filteredFAQs = faqs.filter(
    (faq) =>
      !query ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.category.toLowerCase().includes(query)
  );

  const toggleFAQ = (id: number) =>
    setOpenFAQ((currentId) => (currentId === id ? null : id));

  const clearSearch = () => {
    setSearchQuery("");
    setOpenFAQ(null);
  };

  return (
    <StudentLayout activeItem="help" searchPlaceholder="Search...">
      <section className="help-hero">
        <div className="help-hero-content">
          <div className="help-hero-badge">
            <span>✦</span>
            HELP CENTER
          </div>

          <h1>How can we help you?</h1>

          <p>Find answers to the questions learners ask most often.</p>

          <div className="help-search">
            <span className="help-search-icon">⌕</span>

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
            Search questions about courses, quizzes, progress, profile, and more.
          </div>
        </div>
      </section>

      <div className="help-content">
        <section className="help-section">
          <div className="help-section-header">
            <div>
              <span className="help-section-label">GET STARTED</span>
              <h2>Quick Help</h2>
              <p>Jump directly to the information you need.</p>
            </div>
          </div>

          <div className="help-quick-grid">
            {quickHelpItems.map((item) => (
              <Link key={item.title} to={item.path} className="help-quick-card">
                <div className={`help-quick-icon ${item.className}`}>{item.icon}</div>

                <div className="help-quick-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <span className="help-quick-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="help-section">
          <div className="help-section-header">
            <div>
              <span className="help-section-label">FAQ</span>
              <h2>Frequently Asked Questions</h2>
              <p>Answers to the questions learners ask most often.</p>
            </div>

            <span className="help-faq-count">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? "question" : "questions"}
            </span>
          </div>

          <div className="help-faq-list">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className={`help-faq-item ${openFAQ === faq.id ? "open" : ""}`}
                >
                  <button
                    type="button"
                    className="help-faq-question"
                    onClick={() => toggleFAQ(faq.id)}
                    aria-expanded={openFAQ === faq.id}
                  >
                    <div className="help-faq-question-content">
                      <span className="help-faq-category">{faq.category}</span>
                      <span className="help-faq-title">{faq.question}</span>
                    </div>

                    <span className="help-faq-toggle" aria-hidden="true">
                      {openFAQ === faq.id ? "−" : "+"}
                    </span>
                  </button>

                  {openFAQ === faq.id && (
                    <div className="help-faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="help-empty-state">
                <div className="help-empty-icon">?</div>
                <h3>No answers found</h3>
                <p>We couldn't find any help articles matching "{searchQuery}".</p>
                <button type="button" onClick={clearSearch}>
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="help-footer">
        <div className="help-footer-left">
          <div className="help-footer-logo">E</div>
          <div>
            <strong>Eduverse</strong>
            <span>© 2026 Eduverse. All rights reserved.</span>
          </div>
        </div>

        <div className="help-footer-links">
          <Link to="/help">Help Center</Link>
          <Link to="/settings">Settings</Link>
        </div>
      </footer>
    </StudentLayout>
  );
}

export default Help;
