import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
  CSSProperties,
} from "react";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type ProfileData = {
  name: string;
  email: string;
  roles: string[];
  avatarUrl: string;
  createdAt: string;
};

const AdminProfile = () => {
  const { refreshUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    roles: [],
    avatarUrl: "",
    createdAt: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // -----------------------------------------
  // LOAD PROFILE FROM BACKEND
  // -----------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.auth.getMe();

        const user = response.user;

        setProfile({
          name: user.name || "",
          email: user.email || "",
          roles: user.roles || [],
          avatarUrl: user.avatarUrl || "",
          createdAt: user.createdAt || "",
        });
      } catch (err: any) {
        console.error("Failed to load profile:", err);
        setError(err?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // -----------------------------------------
  // NAME CHANGE
  // -----------------------------------------
  const handleNameChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setProfile((previous) => ({
      ...previous,
      name: event.target.value,
    }));
  };

  // -----------------------------------------
  // CHOOSE PICTURE
  // -----------------------------------------
  const handleChoosePicture = () => {
    if (uploadingPicture) {
      return;
    }

    fileInputRef.current?.click();
  };

  // -----------------------------------------
  // UPLOAD PICTURE
  // -----------------------------------------
  const handlePictureChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Clear previous messages
    setError("");
    setMessage("");

    // Only allow specific image types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, JPEG, PNG or WebP image."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    // 2 MB maximum
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    try {
      setUploadingPicture(true);

      const response = await api.auth.uploadAvatar(file);

      const updatedUser = response.user;

      setProfile((previous) => ({
        ...previous,
        avatarUrl: updatedUser?.avatarUrl || "",
      }));

      // Keep AuthContext and stored user synchronized
      await refreshUser();

      setMessage(
        "Profile picture uploaded successfully."
      );
    } catch (err: any) {
      console.error(
        "Profile picture upload failed:",
        err
      );

      setError(
        err?.message ||
          "Failed to upload profile picture."
      );
    } finally {
      setUploadingPicture(false);

      // Allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // -----------------------------------------
  // REMOVE PICTURE
  // -----------------------------------------
  const handleRemovePicture = async () => {
    /*
     * The current backend upload system does not yet have
     * a dedicated delete-avatar endpoint.
     *
     * For now, this only clears the picture from the
     * frontend state. The previously uploaded file remains
     * on the server.
     *
     * We will add a proper delete endpoint later if needed.
     */

    setProfile((previous) => ({
      ...previous,
      avatarUrl: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setMessage(
      "Picture removed from the current view. Save the profile to update your profile information."
    );
  };

  // -----------------------------------------
  // SAVE PROFILE
  // -----------------------------------------
  const handleSaveProfile = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!profile.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      /*
       * The avatar is uploaded separately through
       * api.auth.uploadAvatar().
       *
       * Therefore this request only updates the name
       * and the current avatar URL.
       */
      const response = await api.auth.updateMe({
        name: profile.name.trim(),
        avatarUrl: profile.avatarUrl,
      });

      const updatedUser = response.user;

      setProfile((previous) => ({
        ...previous,
        name: updatedUser?.name || previous.name,
        avatarUrl:
          updatedUser?.avatarUrl ??
          previous.avatarUrl,
      }));

      // Update AuthContext/local stored user
      await refreshUser();

      setMessage("Profile updated successfully.");
    } catch (err: any) {
      console.error(
        "Profile update failed:",
        err
      );

      setError(
        err?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // CHANGE PASSWORD
  // -----------------------------------------
  const handleChangePassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword) {
      setError(
        "Please enter both current and new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters."
      );
      return;
    }

    try {
      setChangingPassword(true);

      await api.auth.updatePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");

      setMessage(
        "Password updated successfully."
      );
    } catch (err: any) {
      console.error(
        "Password update failed:",
        err
      );

      setError(
        err?.message ||
          "Failed to update password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // -----------------------------------------
  // FORMAT DATE
  // -----------------------------------------
  const formatDate = (date: string) => {
    if (!date) {
      return "—";
    }

    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          Loading profile...
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // PAGE
  // -----------------------------------------
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Admin Profile
          </h1>

          <p style={styles.subtitle}>
            Manage your administrator profile and
            account settings.
          </p>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div style={styles.successMessage}>
          ✓ {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* PROFILE CARD */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>
            Personal Information
          </h2>

          <p style={styles.cardSubtitle}>
            Update your name and profile picture.
          </p>
        </div>

        <form onSubmit={handleSaveProfile}>
          {/* PROFILE PICTURE */}
          <div style={styles.pictureSection}>
            <div style={styles.avatarWrapper}>
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Admin profile"
                  style={styles.avatarImage}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {profile.name
                    ? profile.name
                        .charAt(0)
                        .toUpperCase()
                    : "A"}
                </div>
              )}
            </div>

            <div style={styles.pictureInfo}>
              <h3 style={styles.pictureTitle}>
                Profile Picture
              </h3>

              <p style={styles.pictureDescription}>
                Choose a JPG, PNG or WebP image up to
                2 MB.
              </p>

              <div style={styles.pictureButtons}>
                <button
                  type="button"
                  onClick={handleChoosePicture}
                  disabled={uploadingPicture}
                  style={{
                    ...styles.primaryButton,
                    opacity: uploadingPicture
                      ? 0.7
                      : 1,
                    cursor: uploadingPicture
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {uploadingPicture
                    ? "Uploading..."
                    : "📷 Choose Picture"}
                </button>

                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePicture}
                    disabled={uploadingPicture}
                    style={{
                      ...styles.removeButton,
                      opacity: uploadingPicture
                        ? 0.6
                        : 1,
                    }}
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handlePictureChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* NAME */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Full Name
            </label>

            <input
              type="text"
              value={profile.name}
              onChange={handleNameChange}
              placeholder="Enter your name"
              style={styles.input}
            />
          </div>

          {/* EMAIL */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Email Address
            </label>

            <input
              type="email"
              value={profile.email}
              disabled
              style={{
                ...styles.input,
                backgroundColor: "#f3f4f6",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* ROLE */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Role
            </label>

            <div style={styles.roles}>
              {profile.roles.map((role) => (
                <span
                  key={role}
                  style={styles.roleBadge}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* MEMBER SINCE */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Member Since
            </label>

            <div style={styles.readOnlyValue}>
              {formatDate(profile.createdAt)}
            </div>
          </div>

          {/* SAVE */}
          <div style={styles.saveSection}>
            <button
              type="submit"
              disabled={
                saving || uploadingPicture
              }
              style={{
                ...styles.saveButton,
                opacity:
                  saving || uploadingPicture
                    ? 0.7
                    : 1,
                cursor:
                  saving || uploadingPicture
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* PASSWORD CARD */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>
            Change Password
          </h2>

          <p style={styles.cardSubtitle}>
            Update your administrator account
            password.
          </p>
        </div>

        <form onSubmit={handleChangePassword}>
          {/* CURRENT PASSWORD */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value
                )
              }
              placeholder="Enter current password"
              style={styles.input}
            />
          </div>

          {/* NEW PASSWORD */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              placeholder="Enter new password"
              style={styles.input}
            />
          </div>

          {/* UPDATE PASSWORD */}
          <button
            type="submit"
            disabled={changingPassword}
            style={{
              ...styles.saveButton,
              opacity: changingPassword
                ? 0.7
                : 1,
              cursor: changingPassword
                ? "not-allowed"
                : "pointer",
            }}
          >
            {changingPassword
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ================================================================== */
/* STYLES                                                              */
/* ================================================================== */

const styles: Record<string, CSSProperties> = {
  page: {
    padding: "32px",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  loading: {
    padding: "40px",
    textAlign: "center",
    fontSize: "18px",
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  successMessage: {
    padding: "12px 16px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#dcfce7",
    color: "#166534",
  },

  errorMessage: {
    padding: "12px 16px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
  },

  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  cardHeader: {
    marginBottom: "24px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: 700,
  },

  cardSubtitle: {
    marginTop: "6px",
    color: "#6b7280",
  },

  pictureSection: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "30px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
  },

  avatarWrapper: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
    border: "4px solid #e5e7eb",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    fontWeight: 700,
    background: "#e5e7eb",
    color: "#4b5563",
  },

  pictureInfo: {
    flex: 1,
  },

  pictureTitle: {
    margin: "0 0 6px",
    fontSize: "18px",
  },

  pictureDescription: {
    margin: "0 0 14px",
    color: "#6b7280",
    fontSize: "14px",
  },

  pictureButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  primaryButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  removeButton: {
    border: "1px solid #dc2626",
    borderRadius: "8px",
    padding: "10px 16px",
    background: "#fff",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: 600,
  },

  formGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
  },

  roles: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  roleBadge: {
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "13px",
    fontWeight: 600,
  },

  readOnlyValue: {
    padding: "12px 14px",
    background: "#f9fafb",
    borderRadius: "8px",
    color: "#4b5563",
  },

  saveSection: {
    marginTop: "28px",
  },

  saveButton: {
    border: "none",
    borderRadius: "8px",
    padding: "12px 22px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "15px",
  },
};

export default AdminProfile;