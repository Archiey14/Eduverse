import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

// 25 minutes of inactivity before warning
const INACTIVITY_LIMIT_MS = 25 * 60 * 1000;
// 2 minutes countdown during warning
const COUNTDOWN_SECONDS = 120;

export const SessionTimeoutModal: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);

  const lastActivityRef = useRef<number>(Date.now());
  const timerCheckIntervalRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(COUNTDOWN_SECONDS);
      // Touch backend session by refreshing profile
      api.auth.getMe().catch(() => {});
    }
  }, [showWarning]);

  // Track global user interactions
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserAction = () => {
      // Only reset activity if warning is not currently open
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, handleUserAction, { passive: true }));

    // Periodic check for inactivity
    timerCheckIntervalRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= INACTIVITY_LIMIT_MS && !showWarning) {
        setShowWarning(true);
        setSecondsRemaining(COUNTDOWN_SECONDS);
      }
    }, 10000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserAction));
      if (timerCheckIntervalRef.current) clearInterval(timerCheckIntervalRef.current);
    };
  }, [isAuthenticated, showWarning]);

  // Countdown timer when warning modal is visible
  useEffect(() => {
    if (!showWarning) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleLogoutDueToInactivity();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning]);

  const handleLogoutDueToInactivity = useCallback(() => {
    setShowWarning(false);
    logout();
    navigate("/login?reason=inactivity", { replace: true });
  }, [logout, navigate]);

  const handleStayLoggedIn = () => {
    resetActivity();
  };

  const handleSignOutNow = () => {
    setShowWarning(false);
    logout();
    navigate("/login");
  };

  if (!isAuthenticated || !showWarning) {
    return null;
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div
      className="session-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-modal-title"
    >
      <div className="session-modal-card">
        <div className="session-modal-icon">
          <AlertTriangle size={32} />
        </div>

        <h3 id="session-modal-title" className="session-modal-title">
          Session Inactivity Warning
        </h3>

        <p className="session-modal-desc">
          You have been idle for a while. For your security and to protect your account, your session will automatically expire soon.
        </p>

        <div className="session-modal-timer">
          <Clock size={16} />
          <span>Logging out in {formattedTime}</span>
        </div>

        <div className="session-modal-actions">
          <button
            type="button"
            className="session-btn-logout"
            onClick={handleSignOutNow}
          >
            Sign Out Now
          </button>
          <button
            type="button"
            className="session-btn-stay"
            onClick={handleStayLoggedIn}
          >
            Stay Signed In
          </button>
        </div>
      </div>
    </div>
  );
};
