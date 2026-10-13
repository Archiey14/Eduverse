import React, { useEffect, useState, useCallback } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Globe,
  Clock,
} from "lucide-react";
import { api, getErrorMessage, type UserSession } from "../services/api";
import "./ActiveSessionsCard.css";

export const ActiveSessionsCard: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.auth.getSessions();
      if (res.success && Array.isArray(res.sessions)) {
        setSessions(res.sessions);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load active sessions."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeOne = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to log out this session?")) {
      return;
    }

    setActionBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.auth.revokeSession(sessionId);
      setSuccess("Session logged out successfully.");
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (err) {
      setError(getErrorMessage(err, "Could not terminate session."));
    } finally {
      setActionBusy(false);
    }
  };

  const handleRevokeAllOther = async () => {
    if (
      !window.confirm(
        "Are you sure you want to log out of all other devices? This will keep only your current device active."
      )
    ) {
      return;
    }

    setActionBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.auth.revokeOtherSessions();
      setSuccess("Logged out of all other devices successfully.");
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch (err) {
      setError(getErrorMessage(err, "Could not log out of other devices."));
    } finally {
      setActionBusy(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    const d = (device || "").toLowerCase();
    if (d.includes("mobile") || d.includes("phone")) {
      return <Smartphone size={20} />;
    }
    if (d.includes("tablet") || d.includes("ipad")) {
      return <Tablet size={20} />;
    }
    return <Monitor size={20} />;
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSec < 60) return "Active now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  const hasOtherSessions = sessions.some((s) => !s.isCurrent);

  return (
    <div className="sessions-card">
      <div className="sessions-card-header">
        <div className="sessions-card-icon">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h2>Active Sessions & Devices</h2>
          <p>Manage the devices and browsers currently signed in to your account.</p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            color: "#b91c1c",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "10px 14px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            color: "#15803d",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {success}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", margin: "24px 0" }}>
          Loading active sessions...
        </p>
      ) : sessions.length === 0 ? (
        <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", margin: "24px 0" }}>
          No active sessions recorded.
        </p>
      ) : (
        <div className="sessions-list">
          {sessions.map((session) => (
            <div
              key={session._id}
              className={`session-item ${session.isCurrent ? "current-device" : ""}`}
            >
              <div className="session-item-left">
                <div className="session-device-icon">
                  {getDeviceIcon(session.device)}
                </div>

                <div className="session-details">
                  <div className="session-title-row">
                    <span className="session-browser-name">
                      {session.browser} on {session.os}
                    </span>

                    {session.isCurrent && (
                      <span className="session-current-badge">
                        • This device
                      </span>
                    )}
                  </div>

                  <p className="session-meta">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Globe size={12} />
                      {session.ipAddress}
                    </span>
                    <span>·</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} />
                      {formatRelativeTime(session.lastActive)}
                    </span>
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  type="button"
                  className="session-btn-revoke"
                  disabled={actionBusy}
                  onClick={() => handleRevokeOne(session._id)}
                >
                  Sign Out
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="sessions-actions-bar">
        {hasOtherSessions && (
          <button
            type="button"
            className="sessions-btn-revoke-all"
            disabled={actionBusy || loading}
            onClick={handleRevokeAllOther}
          >
            <LogOut size={15} />
            Sign out of all other devices
          </button>
        )}

        <button
          type="button"
          className="sessions-btn-refresh"
          disabled={loading}
          onClick={fetchSessions}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  );
};
