import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.resetPassword(token, { password });
      if (response.success) {
        setMessage("Password has been reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } else {
        setError(response.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Invalid or expired token."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="professional-auth-page">
      <div className="login-container">
        <div className="login-brand-section">
          <div className="brand-content">
            <Link to="/" className="professional-logo">
              <span className="logo-icon">E</span>
              <span>Eduverse</span>
            </Link>
            <div className="brand-message">
              <span className="brand-badge">🔒 Secure your account</span>
              <h1>Create new <span>password.</span></h1>
              <p>Your new password must be different from previous used passwords.</p>
            </div>
          </div>
          <div className="brand-footer">
            © 2026 Eduverse. Empowering learners everywhere.
          </div>
        </div>

        <div className="login-form-section">
          <div className="login-card">
            <div className="mobile-logo">
              <Link to="/" className="professional-logo">
                <span className="logo-icon">E</span>
                <span>Eduverse</span>
              </Link>
            </div>

            <div className="login-header">
              <h2>Reset Password</h2>
              <p>Enter your new password below.</p>
            </div>

            {error && (
              <div className="professional-error" role="alert">
                <span className="error-icon">!</span>
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="auth-success" style={{ color: '#059669', padding: '12px', background: '#d1fae5', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="error-icon" style={{ background: '#059669' }}>✓</span>
                <span>{message}</span>
              </div>
            )}

            <form className="professional-login-form" onSubmit={handleSubmit} noValidate>
              <div className="professional-form-group">
                <div className="password-heading">
                  <label htmlFor="password">New Password</label>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={loading || !!message}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="professional-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="professional-form-group">
                <div className="password-heading">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={loading || !!message}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="professional-login-button"
                disabled={loading || !!message}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset password
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
