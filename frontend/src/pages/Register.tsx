import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "mentor">("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.auth.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (!response.success || !response.token) {
        setError(response.message || "Registration failed. Please try again.");
        return;
      }

      login(response.token, response.user);

      let destination = "/student/dashboard";

      // Mentor signup: activate the mentor profile, then refresh the stored
      // user from the response so roles are correct immediately (no stale
      // "student only" user after navigation).
      if (role === "mentor") {
        try {
          const mentorRes = await api.auth.becomeMentor({
            headline: "Instructor at Eduverse",
            bio: "Passionate about sharing knowledge and mentoring learners.",
          });
          if (mentorRes.user) {
            updateUser(mentorRes.user);
            destination = "/mentor";
          }
        } catch {
          // The account exists; mentor activation can be retried from the dashboard.
        }
      }

      navigate(destination);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <div className="professional-auth-page">
      <div className="register-container">
        {/* LEFT SIDE - BRANDING */}
        <div className="register-brand-section">
          <div className="brand-content">
            <Link to="/" className="professional-logo">
              <span className="logo-icon">E</span>
              <span>Eduverse</span>
            </Link>

            <div className="brand-message">
              <span className="brand-badge">🚀 Start Your Future Today</span>

              <h1>
                Join thousands of
                <span> learners and creators.</span>
              </h1>

              <p>
                Create your free account to access interactive courses, take
                real quizzes, and earn verifiable certificates.
              </p>
            </div>

            <div className="register-features">
              <div className="register-feature-card">
                <div className="register-feature-icon">📚</div>
                <div>
                  <strong>High Quality Courses</strong>
                  <p>Curated tech, data, and design curriculum.</p>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="register-feature-icon">📊</div>
                <div>
                  <strong>Smart Progress Tracking</strong>
                  <p>Keep track of every lesson and quiz result.</p>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="register-feature-icon">🏆</div>
                <div>
                  <strong>Recognized Certificates</strong>
                  <p>Earn verified credentials upon course completion.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            © 2026 Eduverse. Built for learners worldwide.
          </div>
        </div>

        {/* RIGHT SIDE - REGISTER FORM */}
        <div className="register-form-section">
          <div className="register-card">
            <div className="mobile-logo">
              <Link to="/" className="professional-logo">
                <span className="logo-icon">E</span>
                <span>Eduverse</span>
              </Link>
            </div>

            <div className="register-header">
              <h2>Create Account 🚀</h2>
              <p>Join the learning platform in seconds</p>
            </div>

            {error && (
              <div className="professional-error" role="alert">
                <span className="error-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="professional-register-form"
              noValidate
            >
              {/* FULL NAME */}
              <div className="professional-form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError();
                    }}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="professional-form-group">
                <label htmlFor="email">Email address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉</span>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* ROLE SELECTION */}
              <div
                className="professional-form-group"
                role="group"
                aria-labelledby="role-label"
              >
                <label id="role-label">I want to join as</label>
                <div className="role-selector-grid">
                  <button
                    type="button"
                    className={`role-option-btn ${
                      role === "student" ? "active" : ""
                    }`}
                    aria-pressed={role === "student"}
                    onClick={() => setRole("student")}
                  >
                    <span className="role-icon">🎓</span>
                    <div>
                      <strong>Student</strong>
                      <small>I want to learn skills</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`role-option-btn ${
                      role === "mentor" ? "active" : ""
                    }`}
                    aria-pressed={role === "mentor"}
                    onClick={() => setRole("mentor")}
                  >
                    <span className="role-icon">👨‍🏫</span>
                    <div>
                      <strong>Mentor</strong>
                      <small>I want to teach courses</small>
                    </div>
                  </button>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="professional-form-group">
                <label htmlFor="password">Password (min. 8 characters)</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="professional-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="professional-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError();
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="professional-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* TERMS CHECKBOX */}
              <div className="professional-login-options">
                <label className="professional-checkbox">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => {
                      setAgreeToTerms(e.target.checked);
                      clearError();
                    }}
                  />
                  <span className="custom-checkbox"></span>
                  <span>I agree to the Terms of Service & Privacy Policy</span>
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="professional-login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="professional-divider">
              <span>OR</span>
            </div>

            <div className="create-account">
              <span>Already have an account?</span>
              <Link to="/login">Sign in</Link>
            </div>

            <Link to="/" className="professional-back-home">
              ← Back to Eduverse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
