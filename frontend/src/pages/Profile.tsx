
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../services/api";
import { StudentLayout } from "../components/StudentLayout";
import "./Profile.css";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  bio: string;
  website: string;
  avatarUrl: string;
}

const initialProfile: ProfileData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "+91 98765 43210",
  location: "Telangana, India",
  role: "Student",
  bio: "Passionate learner interested in web development, programming, and building practical projects. I enjoy learning new technologies and improving my skills.",
  website: "https://example.com",
  avatarUrl: "",
};

const initialTeachSkills = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "TypeScript",
];

const initialLearningSkills = [
  "Node.js",
  "Express.js",
  "MongoDB",
  "Python",
];

const initialInterests = [
  "Web Development",
  "Programming",
  "UI/UX Design",
  "Backend Development",
  "Database",
];

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [teachSkills, setTeachSkills] = useState(initialTeachSkills);
  const [learningSkills, setLearningSkills] = useState(initialLearningSkills);
  const [interests, setInterests] = useState(initialInterests);

  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newLearningSkill, setNewLearningSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (new URLSearchParams(location.search).get("edit") === "true") {
      setIsEditing(true);
    }
  }, [location.search]);

  useEffect(() => {
    if (!user) return;

    const [firstName = "", ...rest] = user.name.split(" ");
    setProfile((previous) => ({
      ...previous,
      firstName: firstName || user.name,
      lastName: rest.join(" "),
      email: user.email,
      role: user.roles?.includes("mentor") ? "Instructor" : "Student",
      bio: user.mentorProfile?.bio || previous.bio,
      avatarUrl: user.avatarUrl || "",
      website: previous.website,
    }));
  }, [user]);

  const handleProfileChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaveError("");
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();

    try {
      const res = await api.auth.updateMe({
        name: fullName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        expertise: teachSkills,
      });

      if (res.user) {
        updateUser(res.user);
      }

      setIsEditing(false);
      navigate("/student/dashboard", { replace: true });
      alert("Profile updated successfully!");
    } catch (err) {
      setSaveError(getErrorMessage(err, "Could not update your profile."));
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setTeachSkills(initialTeachSkills);
    setLearningSkills(initialLearningSkills);
    setInterests(initialInterests);
    setIsEditing(false);
    setSaveError("");
    navigate("/student/dashboard", { replace: true });
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      logout();
      navigate("/login");
    }
  };

  const addTeachSkill = () => {
    const skill = newSkill.trim();

    if (!skill) {
      return;
    }

    if (!teachSkills.includes(skill)) {
      setTeachSkills((previous) => [...previous, skill]);
    }

    setNewSkill("");
  };

  const addLearningSkill = () => {
    const skill = newLearningSkill.trim();

    if (!skill) {
      return;
    }

    if (!learningSkills.includes(skill)) {
      setLearningSkills((previous) => [...previous, skill]);
    }

    setNewLearningSkill("");
  };

  const addInterest = () => {
    const interest = newInterest.trim();

    if (!interest) {
      return;
    }

    if (!interests.includes(interest)) {
      setInterests((previous) => [...previous, interest]);
    }

    setNewInterest("");
  };

  const removeTeachSkill = (skillToRemove: string) => {
    setTeachSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
  };

  const removeLearningSkill = (skillToRemove: string) => {
    setLearningSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
  };

  const removeInterest = (interestToRemove: string) => {
    setInterests((previous) =>
      previous.filter((interest) => interest !== interestToRemove)
    );
  };

  const avatarInitials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0) || ""}`.toUpperCase();

  return (
    <StudentLayout activeItem="profile">
      <div className="profile-page" style={{ height: "auto", display: "block" }}>
        {/* Content */}
        <div className="profile-content" style={{ padding: "0" }}>
          {/* Page Header */}
          <div className="profile-page-header">
            <div>
              <p className="profile-breadcrumb">
                Dashboard <span>/</span> Profile
              </p>

              <h1>My Profile</h1>

              <p>
                Manage your personal information, skills, and learning
                interests.
              </p>
            </div>

            <div className="profile-header-actions">
              {saveError && <span className="profile-save-error">{saveError}</span>}
              {!isEditing ? (
                <button
                  className="profile-edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  <span>✎</span>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    className="profile-cancel-button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>

                  <button
                    className="profile-save-button"
                    onClick={handleSave}
                  >
                    <span>✓</span>
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Hero */}
          <section className="profile-hero-card">
            <div className="profile-avatar-section">
              <div className="profile-large-avatar">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                ) : (
                  <span>{avatarInitials}</span>
                )}
              </div>
            </div>

            <div className="profile-hero-info">
              <div className="profile-name-row">
                <h2>
                  {profile.firstName} {profile.lastName}
                </h2>

                <span className="profile-role-badge">
                  {profile.role}
                </span>
              </div>

              <p className="profile-hero-email">
                ✉ {profile.email}
              </p>

              <p className="profile-hero-location">
                ⌖ {profile.location}
              </p>

              <p className="profile-hero-bio">{profile.bio}</p>
            </div>

            <div className="profile-member-info">
              <span>Member since</span>
              <strong>January 2026</strong>
            </div>
          </section>

          {/* Stats */}
          <section className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="profile-stat-icon profile-stat-blue">
                ◫
              </div>
              <div>
                <span>Courses Completed</span>
                <strong>3</strong>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon profile-stat-purple">
                ◷
              </div>
              <div>
                <span>Learning Hours</span>
                <strong>42h</strong>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon profile-stat-green">
                ✓
              </div>
              <div>
                <span>Lessons Completed</span>
                <strong>68</strong>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon profile-stat-orange">
                ★
              </div>
              <div>
                <span>Current Streak</span>
                <strong>7 days</strong>
              </div>
            </div>
          </section>

          {/* Main Profile Grid */}
          <div className="profile-details-grid">
            {/* Personal Information */}
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
                      value={profile.firstName}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {profile.firstName}
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
                      value={profile.lastName}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {profile.lastName}
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="email">Email Address</label>

                  {isEditing ? (
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {profile.email}
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="phone">Phone Number</label>

                  {isEditing ? (
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {profile.phone}
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="location">Location</label>

                  {isEditing ? (
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={profile.location}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {profile.location}
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="role">Role</label>

                  {isEditing ? (
                    <select
                      id="role"
                      name="role"
                      value={profile.role}
                      onChange={(event) =>
                        setProfile((previous) => ({
                          ...previous,
                          role: event.target.value,
                        }))
                      }
                    >
                      <option value="Student">Student</option>
                      <option value="Instructor">Instructor</option>
                    </select>
                  ) : (
                    <div className="profile-readonly-value">
                      {profile.role}
                    </div>
                  )}
                </div>

                <div className="profile-form-group profile-full-width">
                  <label htmlFor="avatarUrl">Profile Photo URL</label>

                  {isEditing ? (
                    <input
                      id="avatarUrl"
                      name="avatarUrl"
                      type="url"
                      value={profile.avatarUrl}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/photo.jpg"
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {profile.avatarUrl || "No profile photo set"}
                    </div>
                  )}
                </div>

                <div className="profile-form-group profile-full-width">
                  <label htmlFor="website">Website</label>

                  {isEditing ? (
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={profile.website}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="profile-readonly-value">
                      {profile.website}
                    </div>
                  )}
                </div>

                <div className="profile-form-group profile-full-width">
                  <label htmlFor="bio">About Me</label>

                  {isEditing ? (
                    <textarea
                      id="bio"
                      name="bio"
                      rows={5}
                      value={profile.bio}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="profile-readonly-textarea">
                      {profile.bio}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Learning Summary */}
            <section className="profile-section-card profile-learning-summary">
              <div className="profile-section-header">
                <div>
                  <h3>Learning Summary</h3>
                  <p>Your learning activity.</p>
                </div>

                <span className="profile-section-icon">◉</span>
              </div>

              <div className="profile-learning-item">
                <div className="profile-learning-item-icon">
                  ◫
                </div>

                <div>
                  <span>Enrolled Courses</span>
                  <strong>6 Courses</strong>
                </div>
              </div>

              <div className="profile-learning-item">
                <div className="profile-learning-item-icon">
                  ✓
                </div>

                <div>
                  <span>Completed Courses</span>
                  <strong>3 Courses</strong>
                </div>
              </div>

              <div className="profile-learning-item">
                <div className="profile-learning-item-icon">
                  ◷
                </div>

                <div>
                  <span>Total Learning Time</span>
                  <strong>42 Hours</strong>
                </div>
              </div>

              <div className="profile-learning-item">
                <div className="profile-learning-item-icon">
                  ★
                </div>

                <div>
                  <span>Achievements</span>
                  <strong>8 Earned</strong>
                </div>
              </div>

              <Link
                to="/progress"
                className="profile-view-progress-link"
              >
                View learning progress
                <span>→</span>
              </Link>
            </section>
          </div>

          {/* Skills Section */}
          <section className="profile-section-card profile-skills-section">
            <div className="profile-section-header">
              <div>
                <h3>Skills & Expertise</h3>
                <p>
                  Add skills you already know or want to improve.
                </p>
              </div>

              <span className="profile-section-icon">◆</span>
            </div>

            <div className="profile-skills-columns">
              {/* Skills I Know */}
              <div className="profile-skill-column">
                <div className="profile-skill-heading">
                  <div>
                    <h4>Skills I Know</h4>
                    <p>Skills you are comfortable with.</p>
                  </div>

                  <span>{teachSkills.length}</span>
                </div>

                <div className="profile-skill-list">
                  {teachSkills.map((skill) => (
                    <span
                      className="profile-skill-tag profile-skill-known"
                      key={skill}
                    >
                      {skill}

                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeTeachSkill(skill)}
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
                      onChange={(event) =>
                        setNewSkill(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          addTeachSkill();
                        }
                      }}
                    />

                    <button type="button" onClick={addTeachSkill}>
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Learning Skills */}
              <div className="profile-skill-column">
                <div className="profile-skill-heading">
                  <div>
                    <h4>Skills I'm Learning</h4>
                    <p>Skills you want to improve.</p>
                  </div>

                  <span>{learningSkills.length}</span>
                </div>

                <div className="profile-skill-list">
                  {learningSkills.map((skill) => (
                    <span
                      className="profile-skill-tag profile-skill-learning"
                      key={skill}
                    >
                      {skill}

                      {isEditing && (
                        <button
                          type="button"
                          onClick={() =>
                            removeLearningSkill(skill)
                          }
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
                      value={newLearningSkill}
                      onChange={(event) =>
                        setNewLearningSkill(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          addLearningSkill();
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={addLearningSkill}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Learning Interests */}
          <section className="profile-section-card profile-interests-section">
            <div className="profile-section-header">
              <div>
                <h3>Learning Interests</h3>
                <p>
                  Topics that help us personalize your learning
                  experience.
                </p>
              </div>

              <span className="profile-section-icon">♡</span>
            </div>

            <div className="profile-interest-list">
              {interests.map((interest) => (
                <span className="profile-interest-tag" key={interest}>
                  {interest}

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      aria-label={`Remove ${interest}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="profile-add-interest">
                <input
                  type="text"
                  placeholder="Add a learning interest..."
                  value={newInterest}
                  onChange={(event) =>
                    setNewInterest(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addInterest();
                    }
                  }}
                />

                <button type="button" onClick={addInterest}>
                  Add Interest
                </button>
              </div>
            )}
          </section>

          {/* Recent Learning */}
          <section className="profile-section-card">
            <div className="profile-section-header">
              <div>
                <h3>Recent Learning</h3>
                <p>Your latest learning activities.</p>
              </div>

              <Link
                to="/activities"
                className="profile-section-link"
              >
                View all →
              </Link>
            </div>

            <div className="profile-recent-learning">
              <div className="profile-recent-item">
                <div className="profile-recent-icon profile-recent-blue">
                  ✓
                </div>

                <div className="profile-recent-content">
                  <strong>Completed React Components Quiz</strong>
                  <span>React & TypeScript Development</span>
                </div>

                <div className="profile-recent-time">
                  Today
                </div>
              </div>

              <div className="profile-recent-item">
                <div className="profile-recent-icon profile-recent-purple">
                  ▶
                </div>

                <div className="profile-recent-content">
                  <strong>
                    Completed: TypeScript Interfaces
                  </strong>
                  <span>React & TypeScript Development</span>
                </div>

                <div className="profile-recent-time">
                  Yesterday
                </div>
              </div>

              <div className="profile-recent-item">
                <div className="profile-recent-icon profile-recent-green">
                  ★
                </div>

                <div className="profile-recent-content">
                  <strong>Earned Course Starter Badge</strong>
                  <span>Achievements</span>
                </div>

                <div className="profile-recent-time">
                  2 days ago
                </div>
              </div>

              <div className="profile-recent-item">
                <div className="profile-recent-icon profile-recent-orange">
                  ◫
                </div>

                <div className="profile-recent-content">
                  <strong>Enrolled in Node.js & Express</strong>
                  <span>Backend Development</span>
                </div>

                <div className="profile-recent-time">
                  4 days ago
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="profile-footer">
            <div>
              <strong>LearnHub</strong>
              <span>Learn. Grow. Achieve.</span>
            </div>

            <div className="profile-footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#help">Help Center</a>
            </div>

            <p>© 2026 LearnHub. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </StudentLayout>
  );
}

export default Profile;
