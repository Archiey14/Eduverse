import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.forgotPassword({ email: email.trim() });
      if (response.success) {
        setMessage("If an account with that email exists, we have sent a password reset link.");
      } else {
        setError(response.message || "Failed to send reset link.");
      }
    } catch (err) {
      setError(getErrorMessage(err, "An error occurred. Please try again."));
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
              <h1>Reset your <span>password.</span></h1>
              <p>Enter your email address and we'll send you a link to get back into your account.</p>
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
              <h2>Forgot Password</h2>
              <p>No worries, we'll send you reset instructions.</p>
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
                <label htmlFor="email">Email address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="professional-login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send reset link
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="professional-divider">
              <span>OR</span>
            </div>

            <div className="create-account">
              <span>Remember your password?</span>
              <Link to="/login">Log in</Link>
            </div>
            
            <Link to="/" className="professional-back-home" style={{ marginTop: '30px', display: 'inline-block' }}>
              ← Back to Eduverse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
