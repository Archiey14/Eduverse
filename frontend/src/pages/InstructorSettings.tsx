import { useState } from "react";
import type { FormEvent } from "react";
import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import InstructorLayout from "../components/InstructorLayout";

function InstructorSettings() {
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

  return (
    <InstructorLayout active="settings" title="Settings">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">ACCOUNT SETTINGS</span>
          <h1>Settings</h1>
          <p>Manage your account information and password.</p>
        </div>
      </div>

      <form className="il-card" onSubmit={handleAccountSave}>
        <h2>Account information</h2>
        <p className="il-card-sub">Update the name shown across Eduverse.</p>

        {accountError && <div className="il-alert il-alert-error">{accountError}</div>}
        {accountSuccess && <div className="il-alert il-alert-success">{accountSuccess}</div>}

        <div className="il-form-grid">
          <div className="il-field">
            <label htmlFor="is-name">Full name</label>
            <input
              id="is-name"
              className="il-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="il-field">
            <label htmlFor="is-email">Email address</label>
            <input id="is-email" className="il-input" value={user?.email || ""} disabled readOnly />
            <small>Your email is your login and cannot be changed here.</small>
          </div>
        </div>

        <button type="submit" className="il-btn" disabled={accountBusy}>
          {accountBusy ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form className="il-card" onSubmit={handlePasswordSave}>
        <h2>Password &amp; security</h2>
        <p className="il-card-sub">Use at least 8 characters.</p>

        {passwordError && <div className="il-alert il-alert-error">{passwordError}</div>}
        {passwordSuccess && <div className="il-alert il-alert-success">{passwordSuccess}</div>}

        <div className="il-form-grid">
          <div className="il-field full">
            <label htmlFor="is-current">Current password</label>
            <input
              id="is-current"
              className="il-input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="il-field">
            <label htmlFor="is-new">New password</label>
            <input
              id="is-new"
              className="il-input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="il-field">
            <label htmlFor="is-confirm">Confirm new password</label>
            <input
              id="is-confirm"
              className="il-input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="il-btn" disabled={passwordBusy}>
          {passwordBusy ? "Updating..." : "Update password"}
        </button>
      </form>
    </InstructorLayout>
  );
}

export default InstructorSettings;
