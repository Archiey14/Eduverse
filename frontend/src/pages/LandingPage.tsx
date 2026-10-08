
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function LandingPage() {
  return (
    <div className="landing-page">
      {/* =========================================
          NAVBAR
      ========================================= */}
      <Navbar />

      {/* =========================================
          MAIN CONTENT
      ========================================= */}
      <main>
        {/* =========================================
            HERO SECTION
        ========================================= */}
        <section className="landing-hero">
          <div className="landing-container hero-grid">
            <div className="hero-content">
              <span className="hero-badge">
                <span className="badge-dot"></span>
                Learn. Grow. Succeed.
              </span>

              <h1>
                Learn New Skills.
                <span>Build Your Future.</span>
              </h1>

              <p className="hero-description">
                LearnHub is your complete learning platform for discovering
                courses, learning from expert instructors, taking quizzes, and
                tracking your progress.
              </p>

              <div className="hero-buttons">
                <Link to="/courses" className="hero-primary-btn">
                  Explore Courses
                  <span>→</span>
                </Link>

                <Link to="/register" className="hero-secondary-btn">
                  Get Started
                </Link>
              </div>

              <div className="hero-trust">
                <div className="trust-avatars">
                  <span>👩</span>
                  <span>👨</span>
                  <span>👩‍💻</span>
                  <span>👨‍💻</span>
                </div>

                <div className="trust-text">
                  <strong>Start learning today</strong>
                  <span>Build skills that matter.</span>
                </div>
              </div>
            </div>

            {/* Hero Learning Dashboard */}
            <div className="hero-visual">
              <div className="hero-glow"></div>

              <div className="learning-dashboard-card">
                <div className="dashboard-card-top">
                  <div>
                    <span className="small-label">MY LEARNING</span>
                    <h3>Welcome back 👋</h3>
                  </div>

                  <div className="dashboard-avatar">S</div>
                </div>

                <div className="learning-progress-card">
                  <div className="progress-course-icon">💻</div>

                  <div className="progress-course-info">
                    <span>Continue Learning</span>

                    <strong>Full Stack Development</strong>

                    <div className="dashboard-progress-row">
                      <div className="dashboard-progress-bar">
                        <div
                          className="dashboard-progress-fill"
                          style={{ width: "72%" }}
                        ></div>
                      </div>

                      <span>72%</span>
                    </div>
                  </div>
                </div>

                <div className="learning-mini-stats">
                  <div className="mini-stat">
                    <div className="mini-stat-icon">📚</div>

                    <div>
                      <strong>12</strong>
                      <span>Courses</span>
                    </div>
                  </div>

                  <div className="mini-stat">
                    <div className="mini-stat-icon">🏆</div>

                    <div>
                      <strong>8</strong>
                      <span>Completed</span>
                    </div>
                  </div>
                </div>

                <div className="upcoming-lesson">
                  <div className="lesson-heading">
                    <span>Upcoming Lesson</span>
                    <span className="lesson-time">Today</span>
                  </div>

                  <div className="lesson-content">
                    <div className="lesson-icon">▶</div>

                    <div>
                      <strong>React Components</strong>
                      <span>Lesson 8 · 24 min</span>
                    </div>

                    <span className="lesson-arrow">→</span>
                  </div>
                </div>
              </div>

              {/* Floating Quiz Card */}
              <div className="floating-quiz-card">
                <div className="floating-icon">📝</div>

                <div>
                  <strong>Quiz Completed</strong>
                  <span>Score: 92%</span>
                </div>

                <div className="quiz-check">✓</div>
              </div>

              {/* Floating Certificate */}
              <div className="floating-certificate">
                <div className="certificate-icon">🏆</div>

                <div>
                  <strong>Course Completed</strong>
                  <span>Congratulations!</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            STATS
        ========================================= */}
        <section className="landing-stats">
          <div className="landing-container stats-grid">
            <div className="stat-item">
              <strong>100+</strong>
              <span>Learning Courses</span>
            </div>

            <div className="stat-item">
              <strong>50+</strong>
              <span>Expert Instructors</span>
            </div>

            <div className="stat-item">
              <strong>1K+</strong>
              <span>Active Learners</span>
            </div>

            <div className="stat-item">
              <strong>95%</strong>
              <span>Learning Satisfaction</span>
            </div>
          </div>
        </section>

        {/* =========================================
            FEATURES
        ========================================= */}
        <section
          id="features"
          className="landing-section features-section"
        >
          <div className="landing-container">
            <div className="section-heading">
              <span className="section-label">WHY LEARNHUB?</span>

              <h2>
                Everything You Need
                <span>to Learn Better</span>
              </h2>

              <p>
                A complete learning experience designed to help students
                learn, practice, and achieve their goals.
              </p>
            </div>

            <div className="feature-grid">
              <div className="professional-feature-card">
                <div className="professional-feature-icon blue-icon">
                  🎓
                </div>

                <span className="feature-number">01</span>

                <h3>Quality Courses</h3>

                <p>
                  Explore structured courses created by knowledgeable
                  instructors and learn practical skills step by step.
                </p>

                <Link to="/courses">Explore courses →</Link>
              </div>

              <div className="professional-feature-card">
                <div className="professional-feature-icon purple-icon">
                  📝
                </div>

                <span className="feature-number">02</span>

                <h3>Interactive Quizzes</h3>

                <p>
                  Test your knowledge with interactive quizzes and understand
                  how well you have mastered each lesson.
                </p>

                <Link to="/register">Start learning →</Link>
              </div>

              <div className="professional-feature-card">
                <div className="professional-feature-icon green-icon">
                  📊
                </div>

                <span className="feature-number">03</span>

                <h3>Track Your Progress</h3>

                <p>
                  Monitor completed lessons, course progress, quiz scores,
                  and your overall learning journey.
                </p>

                <Link to="/register">Track progress →</Link>
              </div>

              <div className="professional-feature-card">
                <div className="professional-feature-icon orange-icon">
                  👨‍🏫
                </div>

                <span className="feature-number">04</span>

                <h3>Expert Instructors</h3>

                <p>
                  Learn from instructors who share their knowledge and guide
                  you toward achieving your learning goals.
                </p>

                <Link to="/mentor/dashboard">
                  Instructor Portal →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            HOW IT WORKS
        ========================================= */}
        <section id="how-it-works" className="how-it-works">
          <div className="landing-container">
            <div className="section-heading">
              <span className="section-label">HOW IT WORKS</span>

              <h2>
                Start Learning in
                <span>Three Simple Steps</span>
              </h2>

              <p>
                Getting started with LearnHub is simple. Create your account
                and begin your learning journey today.
              </p>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">01</div>

                <div className="step-icon">👤</div>

                <h3>Create an Account</h3>

                <p>
                  Sign up as a student or instructor and create your LearnHub
                  profile.
                </p>
              </div>

              <div className="step-connector">→</div>

              <div className="step-card">
                <div className="step-number">02</div>

                <div className="step-icon">📚</div>

                <h3>Choose a Course</h3>

                <p>
                  Discover courses that match your interests and start
                  learning from structured lessons.
                </p>
              </div>

              <div className="step-connector">→</div>

              <div className="step-card">
                <div className="step-number">03</div>

                <div className="step-icon">🚀</div>

                <h3>Learn & Grow</h3>

                <p>
                  Complete lessons, take quizzes, track your progress, and
                  reach your learning goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            STUDENT / INSTRUCTOR SECTION
        ========================================= */}
        <section className="learning-community">
          <div className="landing-container community-grid">
            <div className="community-content">
              <span className="section-label">BUILT FOR EVERYONE</span>

              <h2>
                Learn Knowledge.
                <span>Share Knowledge.</span>
              </h2>

              <p>
                LearnHub brings students and instructors together in one
                learning environment. Whether you want to gain new skills or
                share your expertise, there is a place for you here.
              </p>

              <div className="community-points">
                <div>
                  <span className="community-check">✓</span>

                  <div>
                    <strong>For Students</strong>

                    <p>
                      Discover courses, learn new skills, and track your
                      progress.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="community-check">✓</span>

                  <div>
                    <strong>For Instructors</strong>

                    <p>
                      Create courses, share knowledge, and help others learn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="community-buttons">
                <Link to="/register" className="community-btn">
                  Join as Student →
                </Link>

                <Link
                  to="/mentor/dashboard"
                  className="community-instructor-btn"
                >
                  Instructor Portal →
                </Link>
              </div>
            </div>

            <div className="community-visual">
              <div className="community-main-card">
                <div className="community-card-header">
                  <span>LEARNING COMMUNITY</span>
                  <span>● Active</span>
                </div>

                <div className="community-users">
                  <div className="community-user">
                    <div className="user-avatar avatar-one">A</div>

                    <div>
                      <strong>Alex</strong>
                      <span>Learning React</span>
                    </div>

                    <span className="online-dot"></span>
                  </div>

                  <div className="community-user">
                    <div className="user-avatar avatar-two">R</div>

                    <div>
                      <strong>Rahul</strong>
                      <span>Learning Python</span>
                    </div>

                    <span className="online-dot"></span>
                  </div>

                  <div className="community-user">
                    <div className="user-avatar avatar-three">M</div>

                    <div>
                      <strong>Maya</strong>
                      <span>Learning UI/UX</span>
                    </div>

                    <span className="online-dot"></span>
                  </div>
                </div>

                <div className="community-bottom">
                  <div>
                    <strong>1,000+</strong>
                    <span>Learners growing together</span>
                  </div>

                  <span className="community-arrow">→</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            CTA
        ========================================= */}
        <section className="landing-cta">
          <div className="landing-container">
            <div className="cta-content">
              <span className="cta-icon">🚀</span>

              <span className="section-label">
                YOUR JOURNEY STARTS HERE
              </span>

              <h2>
                Ready to Start
                <span>Learning?</span>
              </h2>

              <p>
                Join LearnHub today and take the next step toward building the
                skills and knowledge you need for your future.
              </p>

              <div className="cta-buttons">
                <Link to="/register" className="cta-primary-btn">
                  Create Your Account
                  <span>→</span>
                </Link>

                <Link to="/courses" className="cta-secondary-btn">
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-main">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="landing-logo-icon">L</span>
                <span>LearnHub</span>
              </Link>

              <p>
                A modern learning platform designed to help students and
                instructors learn, teach, and grow together.
              </p>
            </div>

            <div className="footer-column">
              <h4>Platform</h4>

              <Link to="/">Home</Link>
              <Link to="/courses">Courses</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>

              <Link to="/mentor/dashboard">
                Instructor Portal
              </Link>
            </div>

            <div className="footer-column">
              <h4>Learning</h4>

              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>

              <Link to="/courses">Explore Courses</Link>
              <Link to="/register">Start Learning</Link>
            </div>

            <div className="footer-column">
              <h4>Get Started</h4>

              <p>Ready to begin your learning journey?</p>

              <Link to="/register" className="footer-register-btn">
                Create Account →
              </Link>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 LearnHub. All rights reserved.</p>

            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
