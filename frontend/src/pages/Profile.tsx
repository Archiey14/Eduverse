
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../services/api";
import { StudentLayout } from "../components/StudentLayout";
import { timeAgo } from "../utils/format";
import {
  buildAchievements,
  emptyAchievementStats,
  toAchievementStats,
} from "../utils/achievements";
import type { AchievementStats } from "../utils/achievements";
import "./Profile.css";

interface ProfileForm {
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string;
}

const splitName = (fullName: string) => {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
};

const buildForm = (user: {
  name: string;
  avatarUrl?: string;
  mentorProfile?: { bio?: string; expertise?: string[] };
} | null): ProfileForm => {
  const { firstName, lastName } = splitName(user?.name || "");

  return {
    firstName,
    lastName,
    bio: user?.mentorProfile?.bio || "",
    avatarUrl: user?.avatarUrl || "",
  };
};

const activityIcon = (type: string) => {
  if (type === "quiz_passed" || type === "quiz_attempted") return "📝";
  if (type === "lesson_completed") return "✓";
  if (type === "enrolled") return "◫";
  if (type === "course_completed") return "★";
  return "▶";
};

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>(() => buildForm(user));
  const [skills, setSkills] = useState<string[]>(
    user?.mentorProfile?.expertise || []
  );
  const [newSkill, setNewSkill] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const [stats, setStats] =
    useState<AchievementStats>(emptyAchievementStats);
  const [activities, setActivities] = useState<any[]>([]);

  // Create and clean up the temporary image preview.
  useEffect(() => {
    if (!selectedAvatar) {
      setAvatarPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedAvatar);
    setAvatarPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedAvatar]);

  // Reset image error state when the saved image changes.
  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [form.avatarUrl]);

  // Settings -> Edit Profile opens this page in edit mode.
  useEffect(() => {
    if (new URLSearchParams(location.search).get("edit") === "true") {
      setIsEditing(true);
    }
  }, [location.search]);

  // Keep the form synchronized with the logged-in user while not editing.
  useEffect(() => {
    if (!user || isEditing) return;

    setForm(buildForm(user));
    setSkills(user.mentorProfile?.expertise || []);
  }, [user, isEditing]);

  // Load real learning statistics and recent activity.
  useEffect(() => {
    let cancelled = false;

    api.dashboard
      .getStudentDashboard()
      .then((res) => {
        if (cancelled || !res.data) return;

        setStats(toAchievementStats(res.data.stats));
        setActivities((res.data.recentActivities || []).slice(0, 4));
      })
      .catch(() => {
        // Learning statistics are optional on this page.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const earnedAchievements = useMemo(
    () => buildAchievements(stats).filter((achievement) => achievement.earned).length,
    [stats]
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Select and validate a student profile picture.
  const handleAvatarSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    setAvatarError("");
    setAvatarSuccess("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Your profile photo must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedAvatar(file);
  };

  // Upload the selected image through the existing backend endpoint.
  const handleAvatarUpload = async () => {
    if (!selectedAvatar) {
      setAvatarError("Please choose a photo first.");
      return;
    }

    setUploadingAvatar(true);
    setAvatarError("");
    setAvatarSuccess("");

    try {
      const res = await api.auth.uploadAvatar(selectedAvatar);

      if (!res.user) {
        throw new Error("The server did not return the updated user.");
      }

      // Update the authenticated user so the layout avatar changes immediately.
      updateUser(res.user);

      const savedAvatarUrl = res.user.avatarUrl || "";

      setForm((previous) => ({
        ...previous,
        avatarUrl: savedAvatarUrl,
      }));

      setSelectedAvatar(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setAvatarSuccess("Profile photo updated successfully.");
    } catch (err) {
      setAvatarError(
        getErrorMessage(err, "Could not upload your profile photo.")
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarCancel = () => {
    setSelectedAvatar(null);
    setAvatarError("");
    setAvatarSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaveError("");
    setSaveSuccess("");

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    if (!fullName) {
      setSaveError("Your name cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const res = await api.auth.updateMe({
        name: fullName,
        avatarUrl: form.avatarUrl.trim(),
        bio: form.bio.trim(),
        expertise: skills,
      });

      if (res.user) {
        updateUser(res.user);
        setForm(buildForm(res.user));
      }

      setIsEditing(false);
      setSaveSuccess("Profile updated successfully.");

      navigate("/profile", { replace: true });
    } catch (err) {
      setSaveError(
        getErrorMessage(err, "Could not update your profile.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(buildForm(user));
    setSkills(user?.mentorProfile?.expertise || []);
    setNewSkill("");
    setIsEditing(false);
    setSaveError("");
    setSaveSuccess("");
    navigate("/profile", { replace: true });
  };

  const addSkill = () => {
    const skill = newSkill.trim();

    if (!skill) return;

    if (!skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setSkills((previous) => [...previous, skill]);
    }

    setNewSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
  };

  const fullName =
    `${form.firstName} ${form.lastName}`.trim() || user?.name || "";

  const avatarInitials = (
    `${form.firstName.charAt(0)}${form.lastName.charAt(0)}` ||
    (user?.name || "?").charAt(0)
  ).toUpperCase();

  const roleLabel = user?.roles?.includes("admin")
    ? "Admin"
    : user?.roles?.includes("mentor")
      ? "Instructor"
      : "Student";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const displayedAvatar = avatarPreview || form.avatarUrl;

  return (
    <StudentLayout activeItem="profile">
      <div
        className="profile-page"
        style={{ height: "auto", display: "block" }}
      >
        <div className="profile-content" style={{ padding: 0 }}>
          {/* Page header */}
          <div className="profile-page-header">
            <div>
              <p className="profile-breadcrumb">
                Dashboard <span>/</span> Profile
              </p>

              <h1>My Profile</h1>
              <p>Manage your personal information and skills.</p>
            </div>

            <div className="profile-header-actions">
              {saveError && (
                <span className="profile-save-error" role="alert">
                  {saveError}
                </span>
              )}

              {saveSuccess && !isEditing && (
                <span
                  style={{
                    color: "#15803d",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                  role="status"
                >
                  {saveSuccess}
                </span>
              )}

              {!isEditing ? (
                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={() => {
                    setSaveSuccess("");
                    setIsEditing(true);
                  }}
                >
                  <span>✎</span> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="profile-save-button"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <span>✓</span>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile hero and avatar upload */}
          <section className="profile-hero-card">
            <div className="profile-avatar-section">
              <div
                className="profile-large-avatar"
                style={{ overflow: "hidden" }}
              >
                {displayedAvatar && !avatarLoadFailed ? (
                  <img
                    key={displayedAvatar}
                    src={displayedAvatar}
                    alt={`${fullName}'s profile`}
                    onError={() => setAvatarLoadFailed(true)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <span>{avatarInitials}</span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleAvatarSelection}
              />

              <button
                type="button"
                className="profile-edit-button"
                style={{ marginTop: 12 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                Choose Photo
              </button>

              {selectedAvatar && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  <button
                    type="button"
                    className="profile-save-button"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                  </button>

                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleAvatarCancel}
                    disabled={uploadingAvatar}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                JPG, PNG, or WebP. Maximum size: 2 MB.
              </p>

              {avatarError && (
                <p
                  role="alert"
                  style={{
                    color: "#dc2626",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {avatarError}
                </p>
              )}

              {avatarSuccess && (
                <p
                  role="status"
                  style={{
                    color: "#15803d",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {avatarSuccess}
                </p>
              )}
            </div>

            <div className="profile-hero-info">
              <div className="profile-name-row">
                <h2>{fullName}</h2>
                <span className="profile-role-badge">{roleLabel}</span>
              </div>

              <p className="profile-hero-email">✉ {user?.email}</p>

              <p className="profile-hero-bio">
                {user?.mentorProfile?.bio ||
                  "No bio added yet. Click Edit Profile to add one."}
              </p>
            </div>

            <div className="profile-member-info">
              <span>Member since</span>
              <strong>{memberSince}</strong>
            </div>
          </section>

          {/* Learning statistics */}
          <section className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="profile-stat-icon profile-stat-blue">◫</div>
              <div>
                <span>Courses Completed</span>
                <strong>{stats.completedCount}</strong>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon profile-stat-purple">◷</div>
              <div>
                <span>Learning Hours</span>
                <strong>{stats.hoursLearned}h</strong>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon profile-stat-green">✓</div>
              <div>
                <span>Lessons Completed</span>
                <strong>{stats.lessonsCompleted}</strong>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon profile-stat-orange">★</div>
              <div>
                <span>Current Streak</span>
                <strong>
                  {stats.streakDays}{" "}
                  {stats.streakDays === 1 ? "day" : "days"}
                </strong>
              </div>
            </div>
          </section>

          <div className="profile-details-grid">
            {/* Personal information */}
            <section className="profile-section-card">
              <div className="profile-section-header">
                <div>
                  <h3>Personal Information</h3>
                  <p>Update your personal details.</p>
                </div>

                <span className="profile-section-icon">♙</span>
              </div>

              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label htmlFor="firstName">First Name</label>

                  {isEditing ? (
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {form.firstName}
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="lastName">Last Name</label>

                  {isEditing ? (
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {form.lastName || "—"}
                    </div>
                  )}
                </div>

                <div className="profile-form-group profile-full-width">
                  <label htmlFor="email">Email Address</label>

                  <div className="profile-readonly-value" id="email">
                    {user?.email}
                  </div>

                  {isEditing && (
                    <small style={{ color: "#6b7280" }}>
                      Your email is your login and cannot be changed here.
                    </small>
                  )}
                </div>

                <div className="profile-form-group profile-full-width">
                  <label htmlFor="avatarUrl">Profile Photo URL</label>

                  {isEditing ? (
                    <input
                      id="avatarUrl"
                      name="avatarUrl"
                      type="url"
                      value={form.avatarUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/photo.jpg"
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {form.avatarUrl || "No profile photo URL set"}
                    </div>
                  )}

                  {isEditing && (
                    <small style={{ color: "#6b7280" }}>
                      Optional. You can upload a photo using the Choose Photo
                      button above instead.
                    </small>
                  )}
                </div>

                <div className="profile-form-group profile-full-width">
                  <label htmlFor="bio">About Me</label>

                  {isEditing ? (
                    <textarea
                      id="bio"
                      name="bio"
                      rows={5}
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tell us a little about yourself."
                    />
                  ) : (
                    <div className="profile-readonly-textarea">
                      {form.bio || "No bio added yet."}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Learning summary */}
            <section className="profile-section-card profile-learning-summary">
              <div className="profile-section-header">
                <div>
                  <h3>Learning Summary</h3>
                  <p>Your learning activity.</p>
                </div>

                <span className="profile-section-icon">◉</span>
              </div>

              <div className="profile-learning-item">
                <div className="profile-learning-item-icon">◫</div>
                <div>
                  <span>Enrolled Courses</span>
                  <strong>
                    {stats.enrolledCount}{" "}
                    {stats.enrolledCount === 1 ? "Course" : "Courses"}
                  </strong>
                </div>
              </div>

              <div className="profile-learning-item">
                <div className="profile-learning-item-icon">✓</div>
                <div>
                  <span>Completed Courses</span>
                  <strong>
                    {stats.completedCount}{" "}
                    {stats.completedCount === 1 ? "Course" : "Courses"}
                  </strong>
                </div>
              </div>

              <div className="profile-learning-item">
                <div className="profile-learning-item-icon">◷</div>
                <div>
                  <span>Total Learning Time</span>
                  <strong>{stats.hoursLearned} Hours</strong>
                </div>
              </div>

              <div className="profile-learning-item">
                <div className="profile-learning-item-icon">★</div>
                <div>
                  <span>Achievements</span>
                  <strong>{earnedAchievements} Earned</strong>
                </div>
              </div>

              <Link to="/progress" className="profile-view-progress-link">
                View learning progress
                <span>→</span>
              </Link>
            </section>
          </div>

          {/* Skills */}
          <section className="profile-section-card profile-skills-section">
            <div className="profile-section-header">
              <div>
                <h3>Skills & Expertise</h3>
                <p>Add the skills and topics you know.</p>
              </div>

              <span className="profile-section-icon">◆</span>
            </div>

            <div className="profile-skill-column">
              <div className="profile-skill-heading">
                <div>
                  <h4>Skills I Know</h4>
                  <p>Skills you are comfortable with.</p>
                </div>

                <span>{skills.length}</span>
              </div>

              <div className="profile-skill-list">
                {skills.length === 0 && (
                  <span style={{ color: "#6b7280", fontSize: 13 }}>
                    No skills added yet.
                  </span>
                )}

                {skills.map((skill) => (
                  <span
                    className="profile-skill-tag profile-skill-known"
                    key={skill}
                  >
                    {skill}

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="profile-add-skill">
                  <input
                    type="text"
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(event) => setNewSkill(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSkill();
                      }
                    }}
                  />

                  <button type="button" onClick={addSkill}>
                    Add
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Recent learning activities */}
          <section className="profile-section-card">
            <div className="profile-section-header">
              <div>
                <h3>Recent Learning</h3>
                <p>Your latest learning activities.</p>
              </div>

              <Link to="/activities" className="profile-section-link">
                View all →
              </Link>
            </div>

            <div className="profile-recent-learning">
              {activities.length === 0 ? (
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  No activity yet. Enroll in a course and complete a lesson to
                  get started.
                </p>
              ) : (
                activities.map((activity, index) => (
                  <div
                    className="profile-recent-item"
                    key={activity._id || index}
                  >
                    <div
                      className={`profile-recent-icon ${
                        [
                          "profile-recent-blue",
                          "profile-recent-purple",
                          "profile-recent-green",
                          "profile-recent-orange",
                        ][index % 4]
                      }`}
                    >
                      {activityIcon(activity.type)}
                    </div>

                    <div className="profile-recent-content">
                      <strong>{activity.message}</strong>
                      <span>{activity.course?.title || "Eduverse"}</span>
                    </div>

                    <div className="profile-recent-time">
                      {timeAgo(activity.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="profile-footer">
            <div>
              <strong>Eduverse</strong>
              <span>Learn. Grow. Achieve.</span>
            </div>

            <div className="profile-footer-links">
              <Link to="/help">Help Center</Link>
              <Link to="/settings">Settings</Link>
            </div>

            <p>© 2026 Eduverse. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </StudentLayout>
  );
}

export default Profile;