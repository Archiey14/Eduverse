
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);

    /*
      TEMPORARY FRONTEND REGISTRATION

      Later this will connect to Archie's backend:

      POST /api/auth/register

      Data:

      {
        name,
        email,
        password,
        role
      }
    */

    setTimeout(() => {
      setLoading(false);

      console.log("Registration information:", {
        name,
        email,
        role,
        password,
      });

      alert("Registration successful! Please login to continue.");

      navigate("/login");
    }, 900);
  };

  const handleGoogleRegister = () => {
    setError("");
    setGoogleLoading(true);

    /*
      TEMPORARY GOOGLE REGISTRATION

      This button is currently only a frontend placeholder.

      Later we can connect it to the backend/Firebase
      Google authentication flow.

      Example future flow:

      Google Login
          ↓
      Firebase / Backend
          ↓
      Create or find user
          ↓
      Save role
          ↓
      Dashboard
    */

    setTimeout(() => {
      setGoogleLoading(false);

      console.log("Continue with Google clicked");

      alert(
        "Google registration will be connected when authentication is integrated."
      );
    }, 700);
  };

  return (
    <div className="professional-auth-page">
      <div className="login-container">

        {/* =========================================
            LEFT BRAND SECTION
        ========================================= */}

        <section className="login-brand-section">
          <div className="brand-content">

            <Link to="/" className="professional-logo">
              <span className="logo-icon">L</span>
              LearnHub
            </Link>

            <div className="brand-message">

              <span className="brand-badge">
                Start Your Learning Journey
              </span>

              <h1>
                Learn Today.
                <span>Grow Tomorrow.</span>
              </h1>

              <p>
                Create your account and unlock a complete
                learning experience designed to help you
                build valuable skills and achieve your goals.
              </p>

              <div className="login-benefits">

                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>

                  <div>
                    <strong>Access quality courses</strong>

                    <p>
                      Learn through structured courses
                      created by instructors.
                    </p>
                  </div>
                </div>

                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>

                  <div>
                    <strong>Track your progress</strong>

                    <p>
                      Monitor your learning journey
                      from your dashboard.
                    </p>
                  </div>
                </div>

                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>

                  <div>
                    <strong>Learn at your own pace</strong>

                    <p>
                      Study whenever and wherever
                      you want.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="brand-footer">
            © 2026 LearnHub. Empowering learners everywhere.
          </div>
        </section>

        {/* =========================================
            RIGHT REGISTER SECTION
        ========================================= */}

        <section className="login-form-section">

          {/* Mobile Logo */}

          <div className="mobile-logo">
            <Link to="/" className="professional-logo">
              <span className="logo-icon">L</span>
              LearnHub
            </Link>
          </div>

          <div className="login-card register-card">

            {/* Header */}

            <div className="login-header">
              <h2>Create your account</h2>

              <p>
                Join LearnHub and start your learning journey.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="professional-error">
                <span className="error-icon">!</span>

                <span>{error}</span>
              </div>
            )}

            {/* =========================================
                REGISTRATION FORM
            ========================================= */}

            <form
              className="professional-login-form"
              onSubmit={handleSubmit}
            >

              {/* Full Name */}

              <div className="professional-form-group">
                <label htmlFor="name">
                  Full name
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">
                    👤
                  </span>

                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}

              <div className="professional-form-group">
                <label htmlFor="register-email">
                  Email address
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Role */}

              <div className="professional-form-group">
                <label htmlFor="role">
                  I want to join as
                </label>

                <div className="input-wrapper role-select-wrapper">
                  <span className="input-icon">
                    🎓
                  </span>

                  <select
                    id="role"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                  >
                    <option value="student">
                      Student
                    </option>

                    <option value="instructor">
                      Instructor
                    </option>
                  </select>
                </div>
              </div>

              {/* Password */}

              <div className="professional-form-group">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="professional-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                <small className="password-hint">
                  Use at least 6 characters.
                </small>
              </div>

              {/* Confirm Password */}

              <div className="professional-form-group">
                <label htmlFor="confirm-password">
                  Confirm password
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">
                    🔐
                  </span>

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="professional-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>
              </div>

              {/* Terms */}

              <label className="professional-checkbox">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(event) =>
                    setAgreeToTerms(
                      event.target.checked
                    )
                  }
                />

                <span className="custom-checkbox"></span>

                <span>
                  I agree to the{" "}
                  <a href="#terms">
                    Terms and Conditions
                  </a>
                </span>
              </label>

              {/* Create Account Button */}

              <button
                type="submit"
                className="professional-login-button"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account

                    <span className="button-arrow">
                      →
                    </span>
                  </>
                )}
              </button>

            </form>

            {/* =========================================
                DIVIDER
            ========================================= */}

            <div className="professional-divider">
              <span>OR</span>
            </div>

            {/* =========================================
                GOOGLE REGISTER
            ========================================= */}

            <button
              type="button"
              className="google-auth-button"
              onClick={handleGoogleRegister}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <>
                  <span className="login-spinner"></span>
                  Connecting to Google...
                </>
              ) : (
                <>
                  <span className="google-icon">
                    G
                  </span>

                  <span>
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            {/* =========================================
                LOGIN LINK
            ========================================= */}

            <div className="create-account">
              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign in
              </Link>
            </div>

            {/* Back Home */}

            <Link
              to="/"
              className="professional-back-home"
            >
              ← Back to LearnHub
            </Link>

          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
