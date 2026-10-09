import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
GraduationCap,
ClipboardList,
TrendingUp,
User,
Users,
MonitorPlay,
Play,
Check,
Trophy,
ArrowRight,
UserPlus,
BookOpen,
Rocket,
ShieldAlert,
Hand,
} from "lucide-react";
import { FaGithub, FaLinkedinIn, FaEnvelope } from "react-icons/fa";

function LandingPage() {
const { isAuthenticated, isAdmin } = useAuth();

return ( <div className="landing-page"> <Navbar />


  <main>
    {/* HERO SECTION */}
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
            Eduverse is your complete learning platform for discovering
            courses, learning from expert instructors, taking quizzes, and
            tracking your progress.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="hero-primary-btn">
              Get Started
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="hero-trust">
            <div className="trust-avatars">
              <span>
                <User size={20} />
              </span>
              <span>
                <User size={20} />
              </span>
              <span>
                <User size={20} />
              </span>
              <span>
                <User size={20} />
              </span>
            </div>

            <div className="trust-text">
              <strong>Start learning today</strong>
              <span>Build skills that matter.</span>
            </div>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="hero-visual">
          <div className="hero-glow"></div>

          <div className="learning-dashboard-card">
            <div className="dashboard-card-top">
              <div>
                <span className="small-label">MY LEARNING</span>
                <h3>
                  Welcome back <Hand size={20} />
                </h3>
              </div>

              <div className="dashboard-avatar">S</div>
            </div>

            <div className="learning-progress-card">
              <div className="progress-course-icon">
                <MonitorPlay size={24} />
              </div>

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
                <div className="mini-stat-icon">
                  <BookOpen size={20} />
                </div>

                <div>
                  <strong>12</strong>
                  <span>Courses</span>
                </div>
              </div>

              <div className="mini-stat">
                <div className="mini-stat-icon">
                  <Trophy size={20} />
                </div>

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
                <div className="lesson-icon">
                  <Play size={16} />
                </div>

                <div>
                  <strong>React Components</strong>
                  <span>Lesson 8 · 24 min</span>
                </div>

                <span className="lesson-arrow">
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </div>

          {/* FLOATING QUIZ CARD */}
          <div className="floating-quiz-card">
            <div className="floating-icon">
              <ClipboardList size={24} />
            </div>

            <div>
              <strong>Quiz Completed</strong>
              <span>Score: 92%</span>
            </div>

            <div className="quiz-check">
              <Check size={16} />
            </div>
          </div>

          {/* FLOATING CERTIFICATE */}
          <div className="floating-certificate">
            <div className="certificate-icon">
              <Trophy size={24} />
            </div>

            <div>
              <strong>Course Completed</strong>
              <span>Congratulations!</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* STATS SECTION */}
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

    {/* FEATURES SECTION */}
    <section id="features" className="landing-section features-section">
      <div className="landing-container">
        <div className="section-heading">
          <span className="section-label">WHY EDUVERSE?</span>

          <h2>
            Everything You Need
            <span>to Learn Better</span>
          </h2>

          <p>
            A complete learning experience designed to help students learn,
            practice, and achieve their goals.
          </p>
        </div>

        <div className="feature-grid">
          <div className="professional-feature-card">
            <div className="professional-feature-icon blue-icon">
              <GraduationCap size={28} />
            </div>

            <span className="feature-number">01</span>
            <h3>Quality Courses</h3>

            <p>
              Explore structured courses created by knowledgeable
              instructors and learn practical skills step by step.
            </p>

            <Link to="/courses">
              Explore courses <ArrowRight size={16} />
            </Link>
          </div>

          <div className="professional-feature-card">
            <div className="professional-feature-icon purple-icon">
              <ClipboardList size={28} />
            </div>

            <span className="feature-number">02</span>
            <h3>Interactive Quizzes</h3>

            <p>
              Test your knowledge with interactive quizzes and understand
              how well you have mastered each lesson.
            </p>

            <Link to="/register">
              Start learning <ArrowRight size={16} />
            </Link>
          </div>

          <div className="professional-feature-card">
            <div className="professional-feature-icon green-icon">
              <TrendingUp size={28} />
            </div>

            <span className="feature-number">03</span>
            <h3>Track Your Progress</h3>

            <p>
              Monitor completed lessons, course progress, quiz scores, and
              your overall learning journey.
            </p>

            <Link to="/register">
              Track progress <ArrowRight size={16} />
            </Link>
          </div>

          <div className="professional-feature-card">
            <div className="professional-feature-icon orange-icon">
              <Users size={28} />
            </div>

            <span className="feature-number">04</span>
            <h3>Expert Instructors</h3>

            <p>
              Learn from instructors who share their knowledge and guide
              you toward achieving your learning goals.
            </p>

            <Link to="/courses">
              Explore courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section className="how-it-works" id="how-it-works">
      <div className="landing-container">
        <div className="section-heading">
          <span className="section-label">HOW IT WORKS</span>

          <h2>
            Start Learning in
            <span>Three Simple Steps</span>
          </h2>

          <p>
            Getting started with Eduverse is simple. Create your account
            and begin your learning journey today.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">
              <UserPlus size={32} />
            </div>

            <h3>Create an Account</h3>

            <p>
              Sign up as a student or instructor and create your Eduverse
              profile.
            </p>
          </div>

          <div className="step-connector">
            <ArrowRight size={24} />
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">
              <BookOpen size={32} />
            </div>

            <h3>Choose a Course</h3>

            <p>
              Discover courses that match your interests and start learning
              from structured lessons.
            </p>
          </div>

          <div className="step-connector">
            <ArrowRight size={24} />
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">
              <Rocket size={32} />
            </div>

            <h3>Learn &amp; Grow</h3>

            <p>
              Complete lessons, take quizzes, track your progress, and
              reach your learning goals.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* COMMUNITY SECTION */}
    <section className="learning-community">
      <div className="landing-container community-grid">
        <div className="community-content">
          <span className="section-label">BUILT FOR EVERYONE</span>

          <h2>
            Learn Knowledge.
            <span>Share Knowledge.</span>
          </h2>

          <p>
            Eduverse brings students and instructors together in one
            learning environment. Whether you want to gain new skills or
            share your expertise, there is a place for you here.
          </p>

          <div className="community-points">
            <div>
              <span className="community-check">
                <Check size={20} />
              </span>

              <div>
                <strong>For Students</strong>
                <p>
                  Discover courses, learn new skills, and track your
                  progress.
                </p>
              </div>
            </div>

            <div>
              <span className="community-check">
                <Check size={20} />
              </span>

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
              Join as Student <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* COMMUNITY VISUAL */}
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

              <ArrowRight size={20} className="community-arrow" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* CALL TO ACTION */}
    <section className="landing-cta">
      <div className="landing-container">
        <div className="cta-content">
          <span className="cta-icon">
            <Rocket size={32} />
          </span>

          <span className="section-label">YOUR JOURNEY STARTS HERE</span>

          <h2>
            Ready to Start
            <span>Learning?</span>
          </h2>

          <p>
            Join Eduverse today and take the next step toward building the
            skills and knowledge you need for your future.
          </p>

          <div className="cta-buttons">
            <Link to="/register" className="cta-primary-btn">
              Create Your Account
              <ArrowRight size={18} />
            </Link>

            <Link to="/courses" className="cta-secondary-btn">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    </section>
  </main>

  {/* FOOTER */}
  <footer className="landing-footer">
    <div className="landing-container">
      <div className="footer-main">
        {/* FOOTER BRAND */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="landing-logo-icon">L</span>
            <span>Eduverse</span>
          </Link>

          <p>
            A modern learning platform designed to help students and
            instructors learn, teach, and grow together.
          </p>
        </div>

        {/* PLATFORM */}
        <div className="footer-column">
          <h4>Platform</h4>

          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/register">Register</Link>

          {isAuthenticated && isAdmin && (
            <Link to="/admin/dashboard">
              <ShieldAlert size={16} /> Admin Dashboard
            </Link>
          )}
        </div>

        {/* LEARNING */}
        <div className="footer-column">
          <h4>Learning</h4>

          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/courses">Explore Courses</Link>
          <Link to="/register">Start Learning</Link>
        </div>

        {/* GET STARTED */}
        <div className="footer-column">
          <h4>Get Started</h4>

          <p>Ready to begin your learning journey?</p>

          <Link to="/register" className="footer-register-btn">
            Create Account <ArrowRight size={16} />
          </Link>
        </div>

        {/* CONTACT & SOCIAL LINKS */}
        <div className="footer-column footer-contact">
          <h4>Connect With Us</h4>

          <p>Have questions? Reach out or connect with us.</p>

          <div className="footer-social-icons">
            <a
              href="mailto:priyaenjam11@gmail.com"
              aria-label="Email Eduverse"
              title="Email"
            >
              <FaEnvelope size={20} />
            </a>

            <a
              href="https://github.com/Archiey14/Eduverse"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Eduverse GitHub Repository"
              title="GitHub"
            >
              <FaGithub size={20} />
            </a>

            <a
              href="https://www.linkedin.com/in/supriya-enjam-751758388"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              title="LinkedIn"
            >
              <FaLinkedinIn size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <p>© 2026 Eduverse. All rights reserved.</p>

        <div className="footer-bottom-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </div>
      </div>
    </div>
  </footer>
</div>

);
}

export default LandingPage;
