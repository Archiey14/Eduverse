import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import InstructorLayout from "../components/InstructorLayout";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const toLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function CreateCourse() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [description, setDescription] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [requirements, setRequirements] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.categories
      .getAll()
      .then((res) => setCategoryList(res.data || res.categories || []))
      .catch((err) =>
        setError(getErrorMessage(err, "Could not load course categories."))
      )
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!title.trim() || !category || !description.trim()) {
      setError("Title, category and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.mentor.createCourse({
        title: title.trim(),
        subtitle: subtitle.trim(),
        category,
        level,
        description: description.trim(),
        learningOutcomes: toLines(learningOutcomes),
        requirements: toLines(requirements),
        thumbnailUrl: thumbnail.trim(),
      });

      const newId = res?.data?._id;
      navigate(newId ? `/instructor/courses/edit/${newId}` : "/instructor/courses", {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create the course. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InstructorLayout active="create" title="Create Course">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">COURSE MANAGEMENT</span>
          <h1>Create New Course</h1>
          <p>
            Start with the basics. Your course is saved as a draft, and you can add
            sections, lessons and quizzes and publish it from the course editor.
          </p>
        </div>

        <Link to="/instructor/courses" className="il-btn il-btn-outline">
          ← Back to Courses
        </Link>
      </div>

      {error && <div className="il-alert il-alert-error">{error}</div>}

      <form className="il-card" onSubmit={handleSubmit}>
        <h2>Course details</h2>
        <p className="il-card-sub">
          To publish later you will need a description of 50+ characters, a thumbnail
          and at least 3 published lessons.
        </p>

        <div className="il-form-grid">
          <div className="il-field full">
            <label htmlFor="cc-title">Course title *</label>
            <input
              id="cc-title"
              className="il-input"
              type="text"
              placeholder="e.g. Complete React & TypeScript"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="il-field full">
            <label htmlFor="cc-subtitle">Subtitle</label>
            <input
              id="cc-subtitle"
              className="il-input"
              type="text"
              placeholder="A short one-line pitch"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="il-field">
            <label htmlFor="cc-category">Category *</label>
            <select
              id="cc-category"
              className="il-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "Select a category"}
              </option>
              {categoryList.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="il-field">
            <label htmlFor="cc-level">Level</label>
            <select
              id="cc-level"
              className="il-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {LEVELS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="il-field full">
            <label htmlFor="cc-description">Description *</label>
            <textarea
              id="cc-description"
              className="il-textarea"
              rows={6}
              placeholder="What will students learn in this course?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="il-field">
            <label htmlFor="cc-outcomes">What students will learn</label>
            <textarea
              id="cc-outcomes"
              className="il-textarea"
              placeholder={"One item per line"}
              value={learningOutcomes}
              onChange={(e) => setLearningOutcomes(e.target.value)}
            />
            <small>One item per line</small>
          </div>

          <div className="il-field">
            <label htmlFor="cc-requirements">Requirements</label>
            <textarea
              id="cc-requirements"
              className="il-textarea"
              placeholder={"One item per line"}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
            <small>One item per line</small>
          </div>

          <div className="il-field full">
            <label htmlFor="cc-thumbnail">Thumbnail image URL</label>
            <input
              id="cc-thumbnail"
              className="il-input"
              type="url"
              placeholder="https://example.com/course-image.jpg"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
            <small>Required to publish. You can also add it later in the editor.</small>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Link to="/instructor/courses" className="il-btn il-btn-outline">
            Cancel
          </Link>
          <button type="submit" className="il-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Save draft & continue →"}
          </button>
        </div>
      </form>
    </InstructorLayout>
  );
}

export default CreateCourse;
