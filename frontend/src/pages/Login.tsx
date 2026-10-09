import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { OTPInput } from "../components/OTPInput";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [step, setStep] = useState<"login" | "otp">("login");
  const [otpCode, setOtpCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Where to go after signing in (set by ProtectedRoute)
  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/student/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    setLoading(true);

    try {
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
        // "Remember me" unchecked -> session only (cleared when the tab closes)
        login(response.token, response.user, rememberMe);
        
        let finalRedirect = redirectTo;
        if (redirectTo === "/student/dashboard" || !redirectTo) {
          if (response.user.roles?.includes("admin")) {
            finalRedirect = "/admin/dashboard";
          } else if (response.user.roles?.includes("mentor")) {
            finalRedirect = "/instructor/dashboard";
          } else {
            finalRedirect = "/student/dashboard";
          }
        }
        
        navigate(finalRedirect, { replace: true });
      } else {
        setError(response.message || "Failed to log in.");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password. Please try again."));
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
        login(response.token, response.user, rememberMe);
        
        let finalRedirect = redirectTo;
        if (redirectTo === "/student/dashboard" || !redirectTo) {
          if (response.user.roles?.includes("admin")) {
            finalRedirect = "/admin/dashboard";
          } else if (response.user.roles?.includes("mentor")) {
            finalRedirect = "/instructor/dashboard";
          } else {
            finalRedirect = "/student/dashboard";
          }
        }
        
        navigate(finalRedirect, { replace: true });
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
        {/* LEFT SIDE - BRANDING */}
        <div className="login-brand-section">
          <div className="brand-content">
            <Link to="/" className="professional-logo">
              <span className="logo-icon">E</span>
              <span>Eduverse</span>
            </Link>

            <div className="brand-message">
              <span className="brand-badge">🎓 Learn. Grow. Succeed.</span>

              <h1>
                Continue your
                <span> learning journey.</span>
              </h1>

              <p>
                Access your courses, track your progress, take quizzes, and build
                the skills you need for your future.
              </p>
            </div>

            <div className="login-benefits">
              <div className="benefit-item">
                <div className="benefit-icon">✓</div>
                <div>
                  <strong>Learn at your own pace</strong>
                  <p>Study whenever and wherever you want.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">✓</div>
                <div>
                  <strong>Track your progress</strong>
                  <p>See your learning journey in one place.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">✓</div>
                <div>
                  <strong>Learn from expert instructors</strong>
                  <p>Explore courses created by professionals.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            © 2026 Eduverse. Empowering learners everywhere.
          </div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="login-form-section">
          <div className="login-card">
            <div className="mobile-logo">
              <Link to="/" className="professional-logo">
                <span className="logo-icon">E</span>
                <span>Eduverse</span>
              </Link>
            </div>

            <div className="login-header">
              <h2>Welcome back 👋</h2>
              <p>Sign in to continue to your account</p>
            </div>

            {error && (
              <div className="professional-error" role="alert">
                <span className="error-icon">!</span>
                <span>{error}</span>
              </div>
            )}

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
                <GoogleSignInButton
                  text="Continue with Google"
                  redirectTo={redirectTo}
                  onError={(msg) => setError(msg)}
                />

                <div className="professional-divider">
                  <span>OR CONTINUE WITH EMAIL</span>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="professional-login-form"
                  noValidate
                >
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
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError("");
                    }}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="professional-form-group">
                <div className="password-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
                </div>

                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError("");
                    }}
                    autoComplete="current-password"
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

              {/* REMEMBER ME */}
              <div className="professional-login-options">
                <label className="professional-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
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
                    Sign in
                    <span className="button-arrow">→</span>
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
              <span>Don't have an account?</span>
              <Link to="/register">Create an account</Link>
            </div>
            </>
            )}

            <Link to="/" className="professional-back-home">
              ← Back to Eduverse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
