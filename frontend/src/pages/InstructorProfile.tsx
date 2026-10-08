import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import InstructorLayout from "../components/InstructorLayout";

interface Summary {
  courses: number;
  students: number;
  lessons: number;
  rating: number;
  reviews: number;
}

const emptySummary: Summary = { courses: 0, students: 0, lessons: 0, rating: 0, reviews: 0 };

function InstructorProfile() {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.mentorProfile?.headline || "");
  const [bio, setBio] = useState(user?.mentorProfile?.bio || "");
  const [expertise, setExpertise] = useState<string[]>(user?.mentorProfile?.expertise || []);
  const [newExpertise, setNewExpertise] = useState("");

  const [summary, setSummary] = useState<Summary>(emptySummary);

  // Keep the form in sync with the logged-in user while not editing
  useEffect(() => {
    if (!user || isEditing) return;
    setName(user.name || "");
    setHeadline(user.mentorProfile?.headline || "");
    setBio(user.mentorProfile?.bio || "");
    setExpertise(user.mentorProfile?.expertise || []);
  }, [user, isEditing]);

  // Real teaching stats
  useEffect(() => {
    let cancelled = false;
    api.mentor
      .getDashboard()
      .then((res) => {
        if (cancelled || !res.data) return;
        const stats = res.data.stats || {};
        const courses: any[] = res.data.courses || [];
        setSummary({
          courses: stats.totalCourses || 0,
          students: stats.totalEnrollments || 0,
          lessons: courses.reduce((sum, c) => sum + (c.stats?.lessonCount || 0), 0),
          rating: stats.overallRating || 0,
          reviews: stats.totalReviews || 0,
        });
      })
      .catch(() => {
        /* stats are optional on this page */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Your name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.auth.updateMe({
        name: name.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        expertise,
      });
      if (res.user) updateUser(res.user);
      setIsEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not save your profile. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
  };

  const handleAddExpertise = () => {
    const skill = newExpertise.trim();
    if (!skill) return;
    if (expertise.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setError("This expertise is already added.");
      return;
    }
    setError("");
    setExpertise([...expertise, skill]);
    setNewExpertise("");
  };

  return (
    <InstructorLayout active="profile" title="Profile">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">INSTRUCTOR ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Manage your instructor information and teaching expertise.</p>
        </div>

        {!isEditing && (
          <button type="button" className="il-btn il-btn-outline" onClick={() => setIsEditing(true)}>
            ✎ Edit Profile
          </button>
        )}
      </div>

      {error && <div className="il-alert il-alert-error">{error}</div>}
      {success && <div className="il-alert il-alert-success">{success}</div>}

      <section className="il-profile-hero">
        <div className="il-avatar-lg">{(user?.name || "I").charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2>{user?.name}</h2>
          <p>{user?.mentorProfile?.headline || "Instructor"}</p>
          <p>✉ {user?.email}</p>
        </div>
      </section>

      <section className="il-stats">
        <div className="il-stat">
          <span>Total Courses</span>
          <strong>{summary.courses}</strong>
        </div>
        <div className="il-stat">
          <span>Total Students</span>
          <strong>{summary.students}</strong>
        </div>
        <div className="il-stat">
          <span>Total Lessons</span>
          <strong>{summary.lessons}</strong>
        </div>
        <div className="il-stat">
          <span>Average Rating</span>
          <strong>{summary.reviews > 0 ? summary.rating.toFixed(1) : "—"}</strong>
          <small>{summary.reviews > 0 ? `${summary.reviews} reviews` : "No reviews yet"}</small>
        </div>
      </section>

      <section className="il-card">
        <h2>Basic information</h2>
        <p className="il-card-sub">Your email address is your login and cannot be changed here.</p>

        <div className="il-form-grid">
          <div className="il-field">
            <label htmlFor="ip-name">Full name</label>
            <input
              id="ip-name"
              className="il-input"
              value={name}
              disabled={!isEditing}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="il-field">
            <label htmlFor="ip-email">Email address</label>
            <input id="ip-email" className="il-input" value={user?.email || ""} disabled readOnly />
          </div>

          <div className="il-field full">
            <label htmlFor="ip-headline">Headline</label>
            <input
              id="ip-headline"
              className="il-input"
              placeholder="e.g. Senior Full Stack Developer"
              value={headline}
              disabled={!isEditing}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div className="il-field full">
            <label htmlFor="ip-bio">Instructor bio</label>
            <textarea
              id="ip-bio"
              className="il-textarea"
              rows={5}
              placeholder="Tell students about your experience and teaching style."
              value={bio}
              disabled={!isEditing}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="il-card">
        <h2>Skills &amp; expertise</h2>
        <p className="il-card-sub">The topics and technologies you teach.</p>

        {expertise.length === 0 ? (
          <p className="il-card-sub">No expertise added yet.</p>
        ) : (
          <div className="il-tags">
            {expertise.map((skill) => (
              <span className="il-tag" key={skill}>
                {skill}
                {isEditing && (
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    onClick={() => setExpertise(expertise.filter((item) => item !== skill))}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {isEditing && (
          <div className="il-toolbar" style={{ marginBottom: 0 }}>
            <input
              className="il-input"
              placeholder="Enter a skill..."
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddExpertise();
                }
              }}
            />
            <button type="button" className="il-btn il-btn-outline" onClick={handleAddExpertise}>
              + Add skill
            </button>
          </div>
        )}
      </section>

      {isEditing && (
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="button" className="il-btn il-btn-outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="il-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}
    </InstructorLayout>
  );
}

export default InstructorProfile;
