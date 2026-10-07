
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    /*
      TEMPORARY FRONTEND LOGIN

      Later this will connect to Archie's backend:

      POST /api/auth/login

      Example:

      const response = await api.post("/auth/login", {
        email,
        password,
      });
    */

    setTimeout(() => {
      setLoading(false);

      console.log("Login information:", {
        email,
        password,
        rememberMe,
      });

      // Temporary navigation until backend authentication is connected.
      navigate("/student/dashboard");
    }, 1000);
  };

  return (
    <div className="professional-auth-page">
      <div className="login-container">

        {/* LEFT SIDE - BRANDING */}
        <div className="login-brand-section">

          <div className="brand-content">

            <Link to="/" className="professional-logo">
              <span className="logo-icon">L</span>
              <span>LearnHub</span>
            </Link>

            <div className="brand-message">
              <span className="brand-badge">
                🎓 Learn. Grow. Succeed.
              </span>

              <h1>
                Continue your
                <span> learning journey.</span>
              </h1>

              <p>
                Access your courses, track your progress,
                take quizzes, and build the skills you need
                for your future.
              </p>
            </div>

            <div className="login-benefits">

              <div className="benefit-item">
                <div className="benefit-icon">✓</div>

                <div>
                  <strong>Learn at your own pace</strong>
                  <p>
                    Study whenever and wherever you want.
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">✓</div>

                <div>
                  <strong>Track your progress</strong>
                  <p>
                    See your learning journey in one place.
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">✓</div>

                <div>
                  <strong>Learn from expert instructors</strong>
                  <p>
                    Explore courses created by professionals.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="brand-footer">
            © 2026 LearnHub. Empowering learners everywhere.
          </div>

        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="login-form-section">

          <div className="login-card">

            <div className="mobile-logo">
              <Link to="/" className="professional-logo">
                <span className="logo-icon">L</span>
                <span>LearnHub</span>
              </Link>
            </div>

            <div className="login-header">
              <h2>Welcome back 👋</h2>

              <p>
                Sign in to continue to your account
              </p>
            </div>

            {error && (
              <div className="professional-error">
                <span className="error-icon">!</span>

                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="professional-login-form"
            >

              {/* EMAIL */}
              <div className="professional-form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    id="email"
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

              {/* PASSWORD */}
              <div className="professional-form-group">

                <div className="password-heading">

                  <label htmlFor="password">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="professional-forgot"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    autoComplete="current-password"
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
                    {showPassword ? "🙈" : "👁"}
                  </button>

                </div>

              </div>

              {/* REMEMBER ME */}
              <div className="professional-login-options">

                <label className="professional-checkbox">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked
                      )
                    }
                  />

                  <span className="custom-checkbox"></span>

                  <span>
                    Remember me
                  </span>

                </label>

              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="professional-login-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="button-arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>

            {/* DIVIDER */}
            <div className="professional-divider">
              <span>OR</span>
            </div>

            {/* REGISTER */}
            <div className="create-account">

              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Create an account
              </Link>

            </div>

            <Link
              to="/"
              className="professional-back-home"
            >
              ← Back to LearnHub
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;
