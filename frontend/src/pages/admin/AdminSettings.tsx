import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, getErrorMessage } from "../../services/api";
import "./AdminSettings.css";

const AdminSettings = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.auth.getMe();
        const profile = response?.data || response;

        setName(profile?.name || "");
        setAvatarUrl(profile?.avatarUrl || "");
      } catch (err) {
        console.error("Failed to load admin profile:", err);

        setError(
          getErrorMessage(
            err,
            "Unable to load your profile."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!name.trim()) {
        setError("Name is required.");
        return;
      }

      await api.auth.updateMe({
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
      });

      await refreshUser();

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to update admin profile:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to update your profile."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const initials =
    name.trim().charAt(0).toUpperCase() || "A";

  if (loading) {
    return (
      <div className="admin-settings-page">
        <div className="admin-settings-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">ADMINISTRATION</p>

          <h1>Settings</h1>

          <p>
            Manage your administrator profile and account
            information.
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="admin-settings-error">
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="admin-settings-success">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="admin-settings-card">
        <div className="admin-settings-card-header">
          <div>
            <h2>Admin Profile</h2>
            <p>
              Update the information displayed on your
              administrator account.
            </p>
          </div>
        </div>

        <form
          className="admin-profile-form"
          onSubmit={handleSave}
        >
          {/* Profile preview */}
          <div className="admin-profile-preview">
            {avatarUrl.trim() ? (
              <img
                src={avatarUrl}
                alt="Admin profile"
                className="admin-settings-avatar-image"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : null}

            <div
              className={`admin-settings-avatar ${
                avatarUrl.trim() ? "hidden" : ""
              }`}
            >
              {initials}
            </div>

            <div>
              <strong>
                {name || "Administrator"}
              </strong>

              <span>
                Administrator
              </span>
            </div>
          </div>

          {/* Name */}
          <div className="admin-form-group">
            <label htmlFor="admin-name">
              Full Name
            </label>

            <input
              id="admin-name"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div className="admin-form-group">
            <label htmlFor="admin-email">
              Email Address
            </label>

            <input
              id="admin-email"
              type="email"
              value={user?.email || ""}
              disabled
            />

            <small>
              Email address cannot be changed from this
              page.
            </small>
          </div>

          {/* Avatar */}
          <div className="admin-form-group">
            <label htmlFor="admin-avatar">
              Profile Image URL
            </label>

            <input
              id="admin-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) =>
                setAvatarUrl(e.target.value)
              }
              placeholder="https://example.com/profile.jpg"
            />

            <small>
              Enter a public image URL for your profile
              picture.
            </small>
          </div>

          {/* Role */}
          <div className="admin-form-group">
            <label>
              Account Role
            </label>

            <div className="admin-role-display">
              <span className="admin-role-badge">
                Administrator
              </span>

              <span>
                Your administrator permissions are managed
                by the system.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="admin-settings-actions">
            <button
              type="submit"
              className="admin-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;