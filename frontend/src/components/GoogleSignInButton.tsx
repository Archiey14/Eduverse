import React, { useState } from "react";
import { signInWithGoogle } from "../config/firebase";
import { api, getErrorMessage } from "../services/api";
import { useAuth, type User } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface GoogleSignInButtonProps {
  text?: string;
  redirectTo?: string;
  roleToAssign?: "student" | "mentor";
  disabled?: boolean;
  onSuccess?: (user: User) => void;
  onError?: (errorMessage: string) => void;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = "Continue with Google",
  redirectTo = "/student/dashboard",
  roleToAssign = "student",
  disabled = false,
  onSuccess,
  onError,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // 1. Firebase Popup Sign-In
      const googleProfile = await signInWithGoogle();

      // 2. Authenticate / Register on backend with Google Profile
      const response = await api.auth.googleAuth({
        email: googleProfile.email,
        name: googleProfile.name,
        avatarUrl: googleProfile.avatarUrl,
        googleId: googleProfile.googleId,
        idToken: googleProfile.idToken,
      });

      if (!response.success || !response.token) {
        throw new Error(response.message || "Failed to sign in with Google.");
      }

      // 3. Save session in AuthContext
      login(response.token, response.user, true);

      let targetDestination = redirectTo;

      // If user registered as mentor from Register page
      if (roleToAssign === "mentor" && !response.user.roles?.includes("mentor")) {
        try {
          const mentorRes = await api.auth.becomeMentor({
            headline: "Instructor at Eduverse",
            bio: "Passionate about sharing knowledge and mentoring learners.",
          });
          if (mentorRes.user) {
            updateUser(mentorRes.user);
            targetDestination = "/mentor/dashboard";
          }
        } catch {
          // Fallback to default
        }
      }

      if (onSuccess) {
        onSuccess(response.user);
      } else {
        navigate(targetDestination, { replace: true });
      }
    } catch (err: any) {
      const msg = getErrorMessage(err, "Google sign-in failed. Please try again.");
      if (onError) {
        onError(msg);
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`professional-google-button ${className}`}
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      aria-label={text}
    >
      {loading ? (
        <>
          <span
            className="login-spinner"
            style={{
              borderColor: "rgba(37, 99, 235, 0.2)",
              borderTopColor: "#2563eb",
            }}
          ></span>
          <span>Connecting with Google...</span>
        </>
      ) : (
        <>
          <svg
            className="google-icon-svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{text}</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;
