import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import "./Settings.css";

function Settings() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.name || "");
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (user?.name) setFullName(user.name);
  }, [user?.name]);

  const accountType = user?.roles?.includes("admin")
    ? "Admin"
    : user?.roles?.includes("mentor")
    ? "Student + Instructor"
    : "Student";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleAccountSave = async (event: FormEvent) => {
    event.preventDefault();
    setAccountError("");
    setAccountSuccess("");

    if (!fullName.trim()) {
      setAccountError("Your name cannot be empty.");
      return;
    }

    setAccountBusy(true);
    try {
      const res = await api.auth.updateMe({ name: fullName.trim() });
      if (res.user) updateUser(res.user);
      setAccountSuccess("Account information saved.");
    } catch (err) {
      setAccountError(getErrorMessage(err, "Could not save your account information."));
    } finally {
      setAccountBusy(false);
    }
  };

  const handlePasswordSave = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Please enter your current and new password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("The new password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setPasswordBusy(true);
    try {
      const res = await api.auth.updatePassword({ currentPassword, newPassword });
      setPasswordSuccess(res?.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Could not update your password."));
    } finally {
      setPasswordBusy(false);
    }
  };

  const alertStyle = (kind: "error" | "success"): React.CSSProperties => ({
    marginBottom: 16,
    padding: "11px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    background: kind === "error" ? "#fef2f2" : "#f0fdf4",
    color: kind === "error" ? "#b91c1c" : "#15803d",
    border: `1px solid ${kind === "error" ? "#fecaca" : "#bbf7d0"}`,
  });

  return (
    <StudentLayout activeItem="settings" searchPlaceholder="Search...">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 26, color: "#111827" }}>Settings</h1>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Manage your account information and password.
        </p>
      </div>

      <section className="settings-content" style={{ padding: 0 }}>
        {/* Account */}
        <form className="settings-card" onSubmit={handleAccountSave}>
          <div className="settings-card-header">
            <div className="settings-section-icon">👤</div>
            <div>
              <h2>Account Settings</h2>
              <p>Manage your account information</p>
            </div>
          </div>

          {accountError && <div style={alertStyle("error")}>{accountError}</div>}
          {accountSuccess && <div style={alertStyle("success")}>{accountSuccess}</div>}

          <div className="settings-form-grid">
            <div className="settings-field">
              <label htmlFor="st-name">Full Name</label>
              <input
                id="st-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="st-email">Email Address</label>
              <input id="st-email" type="email" value={user?.email || ""} readOnly disabled />
            </div>

            <div className="settings-field">
              <label htmlFor="st-type">Account Type</label>
              <input id="st-type" type="text" value={accountType} readOnly disabled />
            </div>

            <div className="settings-field">
              <label htmlFor="st-since">Member Since</label>
              <input id="st-since" type="text" value={memberSince} readOnly disabled />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" className="settings-save-button" disabled={accountBusy}>
              {accountBusy ? "Saving..." : "Save Changes"}
            </button>
            <Link to="/profile?edit=true" className="settings-secondary-button" style={{ textDecoration: "none" }}>
              Edit full profile
            </Link>
          </div>
        </form>

        {/* Password */}
        <form className="settings-card" onSubmit={handlePasswordSave}>
          <div className="settings-card-header">
            <div className="settings-section-icon">🔒</div>
            <div>
              <h2>Password & Security</h2>
              <p>Use at least 8 characters.</p>
            </div>
          </div>

          {passwordError && <div style={alertStyle("error")}>{passwordError}</div>}
          {passwordSuccess && <div style={alertStyle("success")}>{passwordSuccess}</div>}

          <div className="settings-form-grid">
            <div className="settings-field">
              <label htmlFor="st-current">Current Password</label>
              <input
                id="st-current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="settings-field">{/* spacer keeps the grid aligned */}</div>

            <div className="settings-field">
              <label htmlFor="st-new">New Password</label>
              <input
                id="st-new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="st-confirm">Confirm New Password</label>
              <input
                id="st-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="settings-save-button" disabled={passwordBusy}>
            {passwordBusy ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>

      <footer className="settings-footer">
        <p>© 2026 Eduverse. All rights reserved.</p>

        <div>
          <Link to="/help">Help Center</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </footer>
    </StudentLayout>
  );
}

export default Settings;
