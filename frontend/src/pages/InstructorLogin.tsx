
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { OTPInput } from "../components/OTPInput";

function InstructorLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Page the instructor originally wanted (set by ProtectedRoute)
  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/instructor/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [step, setStep] = useState<"login" | "otp">("login");
  const [otpCode, setOtpCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // Validate email
    if (!email.trim()) {
      setError("Please enter your instructor email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // Use the same login API as the normal student login
      const response = await api.auth.login({
        email: email.trim(),
        password,
      });

      if (response.success && response.requires2FA) {
        setPendingUserId(response.userId);
        setStep("otp");
        setError("");
        return;
      }

      if (response.success && response.token) {
        // Get the roles assigned to the logged-in user
        const roles = response.user.roles || [];

        // Instructor accounts use the "mentor" role
        const isInstructor = roles.some(
          (role: string) => role.toLowerCase() === "mentor"
        );

        // Prevent normal students from entering the instructor portal
        if (!isInstructor) {
          setError(
            "This account does not have instructor access. Please use an instructor account."
          );
          return;
        }

        // Save authentication information
        login(response.token, response.user, rememberMe);

        // Send instructor to instructor dashboard
        navigate(redirectTo, { replace: true });
      } else {
        setError(response.message || "Failed to log in.");
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Invalid email or password. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!otpCode.trim() || !pendingUserId) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.verifyOTP({
        userId: pendingUserId,
        code: otpCode.trim(),
      });

      if (response.success && response.token) {
        const roles = response.user.roles || [];
        const isInstructor = roles.some((role: string) => role.toLowerCase() === "mentor");

        if (!isInstructor) {
          setError("This account does not have instructor access. Please use an instructor account.");
          return;
        }

        login(response.token, response.user, rememberMe);
        navigate(redirectTo, { replace: true });
      } else {
        setError(response.message || "Failed to verify OTP.");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Invalid OTP code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="professional-auth-page">
      <div className="login-container">
        {/* =========================================
            LEFT SIDE - BRANDING
        ========================================= */}
        <div className="login-brand-section">
          <div className="brand-content">
            <Link to="/" className="professional-logo">
              <span className="logo-icon">E</span>
              <span>Eduverse</span>
            </Link>

            <div className="brand-message">
              <span className="brand-badge">
                🎓 Teach. Inspire. Grow.
              </span>

              <h1>
                Share your
                <span> knowledge with learners.</span>
              </h1>

              <p>
                Manage your courses, create lessons, track students,
                conduct quizzes, and help learners achieve their goals.
              </p>
            </div>

            <div className="login-benefits">
              {/* Benefit 1 */}
              <div className="benefit-item">
                <div className="benefit-icon">✓</div>

                <div>
                  <strong>Manage your courses</strong>
                  <p>
                    Create and organize engaging courses for your
                    learners.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="benefit-item">
                <div className="benefit-icon">✓</div>

                <div>
                  <strong>Track your students</strong>
                  <p>
                    Monitor learner progress and performance.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="benefit-item">
                <div className="benefit-icon">✓</div>

                <div>
                  <strong>View your analytics</strong>
                  <p>
                    Understand how your courses are performing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            © 2026 Eduverse. Empowering learners everywhere.
          </div>
        </div>

        {/* =========================================
            RIGHT SIDE - LOGIN FORM
        ========================================= */}
        <div className="login-form-section">
          <div className="login-card">
            {/* Mobile Logo */}
            <div className="mobile-logo">
              <Link to="/" className="professional-logo">
                <span className="logo-icon">E</span>
                <span>Eduverse</span>
              </Link>
            </div>

            {/* Login Heading */}
            <div className="login-header">
              <h2>Instructor Login 👨‍🏫</h2>
              <p>
                Sign in to manage your courses and students
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="professional-error" role="alert">
                <span className="error-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Instructor Access Label */}
            <div className="professional-divider">
              <span>INSTRUCTOR ACCESS</span>
            </div>

            {step === "otp" ? (
              <form onSubmit={handleOtpSubmit} className="professional-login-form" noValidate>
                <div className="professional-form-group">
                  <label>One-Time Password</label>
                  <OTPInput value={otpCode} onChange={setOtpCode} />
                  <small style={{ display: "block", marginTop: "8px", color: "#6b7280", textAlign: "center" }}>
                    We've sent a code to your email. (Check server logs for testing).
                  </small>
                </div>

                <button type="submit" className="professional-login-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="login-spinner"></span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <span className="button-arrow">→</span>
                    </>
                  )}
                </button>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button 
                    type="button" 
                    onClick={() => { setStep("login"); setError(""); }}
                    style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 600 }}
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Login Form */}
                <form
                  onSubmit={handleSubmit}
                  className="professional-login-form"
                  noValidate
                >
                  {/* EMAIL */}
                  <div className="professional-form-group">
                    <label htmlFor="instructor-email">
                      Email address
                    </label>

                    <div className="input-wrapper">
                      <span className="input-icon">✉</span>

                      <input
                        id="instructor-email"
                        type="email"
                        placeholder="instructor@example.com"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);

                          if (error) {
                            setError("");
                          }
                        }}
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="professional-form-group">
                    <div className="password-heading">
                      <label htmlFor="instructor-password">
                        Password
                      </label>
                    </div>

                    <div className="input-wrapper">
                      <span className="input-icon">🔒</span>

                      <input
                        id="instructor-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);

                          if (error) {
                            setError("");
                          }
                        }}
                        autoComplete="current-password"
                        disabled={loading}
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
                          setRememberMe(event.target.checked)
                        }
                      />

                      <span className="custom-checkbox"></span>

                      <span>Remember me on this device</span>
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
                        Sign in as Instructor
                        <span className="button-arrow">→</span>
                      </>
                    )}
                  </button>
                </form>

                {/* DIVIDER */}
                <div className="professional-divider">
                  <span>OR</span>
                </div>
                {/* STUDENT LOGIN */}
                <div className="create-account">
                  <span>Want to learn instead?</span>

                  <Link to="/login">
                    Student Login
                  </Link>
                </div>
              </>
            )}

            {/* REGISTER */}
            <div className="create-account">
              <span>Don't have an account?</span>

              <Link to="/register">
                Create an account
              </Link>
            </div>

            {/* BACK TO HOME */}
            <Link
              to="/"
              className="professional-back-home"
            >
              ← Back to Eduverse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorLogin;
