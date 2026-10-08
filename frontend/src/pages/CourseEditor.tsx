import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import InstructorLayout from "../components/InstructorLayout";
import "../components/InstructorLayout.css";

type Tab = "details" | "curriculum" | "quizzes";

interface QuestionDraft {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const emptyQuestion = (): QuestionDraft => ({
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
});

const SAMPLE_THUMB =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80";

const toLines = (value: string) =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  level: "beginner",
  thumbnailUrl: "",
  outcomes: "",
  requirements: "",
};

const emptyLesson = {
  title: "",
  type: "video",
  videoUrl: "",
  content: "",
  durationMin: "10",
};

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [tab, setTab] = useState<Tab>(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    return requested === "curriculum" || requested === "quizzes" ? requested : "details";
  });
  const [course, setCourse] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // curriculum state
  const [newSection, setNewSection] = useState("");
  const [lessonSection, setLessonSection] = useState("");
  const [lessonForm, setLessonForm] = useState(emptyLesson);

  // quiz state
  const [quizTitle, setQuizTitle] = useState("");
  const [passPercent, setPassPercent] = useState("70");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);

  const flash = (type: "error" | "success", text: string) => {
    setError(type === "error" ? text : "");
    setSuccess(type === "success" ? text : "");
  };

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.mentor.getCourse(id);
      const c = res.data;
      setCourse(c);
      setForm({
        title: c.title || "",
        subtitle: c.subtitle || "",
        description: c.description || "",
        category:
          typeof c.category === "object" && c.category ? c.category._id : c.category || "",
        level: c.level || "beginner",
        thumbnailUrl: c.thumbnailUrl || "",
        outcomes: (c.learningOutcomes || []).join("\n"),
        requirements: (c.requirements || []).join("\n"),
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not load this course."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.categories
      .getAll()
      .then((res) => setCategories(res.data || res.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const setField = (key: keyof typeof emptyForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  /* ---------------- details ---------------- */
  const saveDetails = async (e: FormEvent) => {
    e.preventDefault();
    flash("error", "");
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      flash("error", "Title, description and category are required.");
      return;
    }
    setBusy(true);
    const body = {
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      category: form.category,
      level: form.level,
      thumbnailUrl: form.thumbnailUrl,
      learningOutcomes: toLines(form.outcomes),
      requirements: toLines(form.requirements),
    };
    try {
      if (isNew) {
        const res = await api.mentor.createCourse(body);
        navigate(`/instructor/courses/edit/${res.data._id}`, { replace: true });
      } else {
        await api.mentor.updateCourse(id!, body);
        await load();
        flash("success", "Course details saved.");
      }
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not save the course."));
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async () => {
    if (!id || !course) return;
    flash("error", "");
    setBusy(true);
    try {
      const res =
        course.status === "published"
          ? await api.mentor.unpublishCourse(id)
          : await api.mentor.publishCourse(id);
      await load();
      flash("success", res.message || "Status updated.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not change publish status."));
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- curriculum ---------------- */
  const addSection = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !newSection.trim()) return;
    setBusy(true);
    try {
      await api.mentor.addSection(id, { title: newSection.trim() });
      setNewSection("");
      await load();
      flash("success", "Section added.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not add the section."));
    } finally {
      setBusy(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!id) return;
    if (!window.confirm("Delete this section and all its lessons?")) return;
    try {
      await api.mentor.deleteSection(id, sectionId, true);
      await load();
      flash("success", "Section deleted.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not delete the section."));
    }
  };

  const addLesson = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !lessonSection) return;
    if (!lessonForm.title.trim()) {
      flash("error", "Lesson title is required.");
      return;
    }
    setBusy(true);
    try {
      await api.mentor.addLesson(id, {
        sectionId: lessonSection,
        title: lessonForm.title,
        type: lessonForm.type,
        videoUrl: lessonForm.videoUrl,
        content: lessonForm.content,
        durationMin: Number(lessonForm.durationMin) || 0,
      });
      setLessonForm(emptyLesson);
      setLessonSection("");
      await load();
      flash("success", "Lesson added.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not add the lesson."));
    } finally {
      setBusy(false);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await api.mentor.deleteLesson(lessonId);
      await load();
      flash("success", "Lesson deleted.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not delete the lesson."));
    }
  };

  /* ---------------- quizzes ---------------- */
  const updateQuestion = (idx: number, patch: Partial<QuestionDraft>) =>
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  const updateOption = (qIdx: number, oIdx: number, value: string) =>
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) } : q
      )
    );

  const createQuiz = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!quizTitle.trim()) {
      flash("error", "Quiz title is required.");
      return;
    }

    const payload: { text: string; options: string[]; correctIndex: number; explanation: string }[] = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        flash("error", `Question ${i + 1} needs text.`);
        return;
      }
      if (!q.options[q.correctIndex]?.trim()) {
        flash("error", `Question ${i + 1}: the correct answer cannot be empty.`);
        return;
      }
      const kept: string[] = [];
      let correct = 0;
      q.options.forEach((opt, j) => {
        if (opt.trim()) {
          if (j === q.correctIndex) correct = kept.length;
          kept.push(opt.trim());
        }
      });
      if (kept.length < 2) {
        flash("error", `Question ${i + 1} needs at least 2 options.`);
        return;
      }
      payload.push({
        text: q.text.trim(),
        options: kept,
        correctIndex: correct,
        explanation: q.explanation.trim(),
      });
    }

    setBusy(true);
    try {
      await api.mentor.createQuiz(id, {
        title: quizTitle.trim(),
        passPercent: Number(passPercent) || 70,
        questions: payload,
      });
      setQuizTitle("");
      setPassPercent("70");
      setQuestions([emptyQuestion()]);
      await load();
      flash("success", "Quiz created.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not create the quiz."));
    } finally {
      setBusy(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await api.mentor.deleteQuiz(quizId);
      await load();
      flash("success", "Quiz deleted.");
    } catch (err) {
      flash("error", getErrorMessage(err, "Could not delete the quiz."));
    }
  };

  /* ---------------- render ---------------- */
  const sections: any[] = course?.sections || [];
  const lessons: any[] = course?.lessons || [];
  const quizzes: any[] = course?.quizzes || [];
  const publishedLessons = lessons.filter((l) => l.isPublished).length;

  if (loading) {
    return (
      <InstructorLayout active="courses" title="Course Editor">
        <p className="il-loading">Loading course...</p>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout
      active={isNew ? "create" : "courses"}
      title={isNew ? "Create Course" : "Course Editor"}
    >
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">{isNew ? "NEW COURSE" : "COURSE EDITOR"}</span>
          <h1>{isNew ? "Create a Course" : course?.title || "Edit Course"}</h1>
          {!isNew && course && (
            <p>
              <span className={`il-badge il-badge-${course.status}`}>{course.status}</span>{" "}
              · {publishedLessons} published lessons · {quizzes.length} quizzes
            </p>
          )}
        </div>
        {!isNew && course && (
          <div className="il-actions">
            <Link to={`/instructor/students?course=${id}`} className="il-btn il-btn-outline">
              👥 Students
            </Link>
            <button
              className={`il-btn ${course.status === "published" ? "il-btn-outline" : "il-btn-success"}`}
              onClick={togglePublish}
              disabled={busy}
            >
              {course.status === "published" ? "Unpublish" : "🚀 Publish"}
            </button>
          </div>
        )}
      </div>

      {error && <div className="il-alert il-alert-error">{error}</div>}
      {success && <div className="il-alert il-alert-success">{success}</div>}

      {!isNew && (
        <div className="il-tabs">
          {(["details", "curriculum", "quizzes"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`il-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "details" ? "Details" : t === "curriculum" ? "Curriculum" : "Quizzes"}
            </button>
          ))}
        </div>
      )}

      {/* ===== DETAILS ===== */}
      {(isNew || tab === "details") && (
        <form className="il-card" onSubmit={saveDetails}>
          <h2>Course details</h2>
          <p className="il-card-sub">
            To publish you need: description of 50+ characters, a thumbnail, and at least 3
            published lessons.
          </p>

          <div className="il-form-grid">
            <div className="il-field full">
              <label>Title *</label>
              <input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Complete React Bootcamp"
              />
            </div>

            <div className="il-field full">
              <label>Subtitle</label>
              <input
                value={form.subtitle}
                onChange={(e) => setField("subtitle", e.target.value)}
                placeholder="A short one-line pitch"
              />
            </div>

            <div className="il-field full">
              <label>Description * (min 50 characters to publish)</label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="What will students learn in this course?"
              />
            </div>

            <div className="il-field">
              <label>Category *</label>
              <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="il-field">
              <label>Level</label>
              <select value={form.level} onChange={(e) => setField("level", e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="il-field full">
              <label>Thumbnail image URL (required to publish)</label>
              <div className="il-row">
                <input
                  value={form.thumbnailUrl}
                  onChange={(e) => setField("thumbnailUrl", e.target.value)}
                  placeholder="https://..."
                />
                <button
                  type="button"
                  className="il-btn il-btn-outline il-btn-sm"
                  onClick={() => setField("thumbnailUrl", SAMPLE_THUMB)}
                >
                  Use sample image
                </button>
              </div>
            </div>

            <div className="il-field">
              <label>What students will learn</label>
              <textarea
                value={form.outcomes}
                onChange={(e) => setField("outcomes", e.target.value)}
                placeholder="One item per line"
              />
              <span className="il-hint">One item per line</span>
            </div>

            <div className="il-field">
              <label>Requirements</label>
              <textarea
                value={form.requirements}
                onChange={(e) => setField("requirements", e.target.value)}
                placeholder="One item per line"
              />
              <span className="il-hint">One item per line</span>
            </div>
          </div>

          <button type="submit" className="il-btn il-btn-primary" disabled={busy}>
            {busy ? "Saving..." : isNew ? "Create & continue →" : "Save changes"}
          </button>
        </form>
      )}

      {/* ===== CURRICULUM ===== */}
      {!isNew && tab === "curriculum" && (
        <>
          <section className="il-card">
            <h2>Sections & lessons</h2>
            <p className="il-card-sub">
              Organise your course into sections and add lessons to each one.
            </p>

            {sections.length === 0 && (
              <div className="il-empty">
                <span>🗂️</span>No sections yet.
              </div>
            )}

            {sections.map((s) => {
              const secLessons = lessons.filter((l) => String(l.sectionId) === String(s._id));
              return (
                <div className="il-section" key={s._id}>
                  <div className="il-section-head">
                    <strong>{s.title}</strong>
                    <div className="il-actions">
                      <button
                        className="il-btn il-btn-outline il-btn-sm"
                        onClick={() => {
                          setLessonSection(lessonSection === s._id ? "" : s._id);
                          setLessonForm(emptyLesson);
                        }}
                      >
                        ➕ Add lesson
                      </button>
                      <button
                        className="il-btn il-btn-danger il-btn-sm"
                        onClick={() => deleteSection(s._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {secLessons.map((l) => (
                    <div className="il-lesson" key={l._id}>
                      <div>
                        {l.type === "text" ? "📄" : "🎬"} <strong>{l.title}</strong>{" "}
                        <small>· {l.durationMin || 0} min</small>
                      </div>
                      <button
                        className="il-btn il-btn-danger il-btn-sm"
                        onClick={() => deleteLesson(l._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {secLessons.length === 0 && lessonSection !== s._id && (
                    <div className="il-lesson">
                      <small>No lessons in this section yet.</small>
                    </div>
                  )}

                  {lessonSection === s._id && (
                    <form className="il-inline-form" onSubmit={addLesson}>
                      <div className="il-form-grid">
                        <div className="il-field full">
                          <label>Lesson title *</label>
                          <input
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          />
                        </div>
                        <div className="il-field">
                          <label>Type</label>
                          <select
                            value={lessonForm.type}
                            onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                          >
                            <option value="video">Video</option>
                            <option value="text">Text</option>
                          </select>
                        </div>
                        <div className="il-field">
                          <label>Duration (minutes)</label>
                          <input
                            type="number"
                            min="0"
                            value={lessonForm.durationMin}
                            onChange={(e) =>
                              setLessonForm({ ...lessonForm, durationMin: e.target.value })
                            }
                          />
                        </div>
                        {lessonForm.type === "video" ? (
                          <div className="il-field full">
                            <label>Video URL</label>
                            <input
                              value={lessonForm.videoUrl}
                              onChange={(e) =>
                                setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                              }
                              placeholder="https://www.youtube.com/embed/..."
                            />
                          </div>
                        ) : (
                          <div className="il-field full">
                            <label>Lesson content</label>
                            <textarea
                              value={lessonForm.content}
                              onChange={(e) =>
                                setLessonForm({ ...lessonForm, content: e.target.value })
                              }
                            />
                          </div>
                        )}
                      </div>
                      <div className="il-actions">
                        <button type="submit" className="il-btn il-btn-primary il-btn-sm" disabled={busy}>
                          Save lesson
                        </button>
                        <button
                          type="button"
                          className="il-btn il-btn-outline il-btn-sm"
                          onClick={() => setLessonSection("")}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}

            <form className="il-row" onSubmit={addSection} style={{ marginTop: 16 }}>
              <input
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="New section title, e.g. Section 2: Core Concepts"
              />
              <button type="submit" className="il-btn il-btn-primary" disabled={busy}>
                Add section
              </button>
            </form>
          </section>
        </>
      )}

      {/* ===== QUIZZES ===== */}
      {!isNew && tab === "quizzes" && (
        <>
          <section className="il-card">
            <h2>Existing quizzes</h2>
            <p className="il-card-sub">Quizzes students can take inside this course.</p>
            {quizzes.length === 0 ? (
              <div className="il-empty">
                <span>📝</span>No quizzes yet. Create one below.
              </div>
            ) : (
              quizzes.map((q) => (
                <div className="il-list-item" key={q._id}>
                  <div>
                    <strong>{q.title}</strong>
                    <small>
                      {q.questions?.length || 0} questions · pass at {q.passPercent}%
                    </small>
                  </div>
                  <button className="il-btn il-btn-danger il-btn-sm" onClick={() => deleteQuiz(q._id)}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </section>

          <form className="il-card" onSubmit={createQuiz}>
            <h2>Create a quiz</h2>
            <p className="il-card-sub">Select the radio button next to the correct answer.</p>

            <div className="il-form-grid">
              <div className="il-field">
                <label>Quiz title *</label>
                <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
              </div>
              <div className="il-field">
                <label>Pass percentage</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={passPercent}
                  onChange={(e) => setPassPercent(e.target.value)}
                />
              </div>
            </div>

            {questions.map((q, qi) => (
              <div className="il-question" key={qi}>
                <div className="il-field">
                  <label>Question {qi + 1}</label>
                  <input
                    value={q.text}
                    onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                    placeholder="Type your question"
                  />
                </div>

                {q.options.map((opt, oi) => (
                  <div className="il-option" key={oi}>
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctIndex === oi}
                      onChange={() => updateQuestion(qi, { correctIndex: oi })}
                    />
                    <input
                      type="text"
                      value={opt}
                      placeholder={`Option ${oi + 1}`}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                    />
                  </div>
                ))}

                <div className="il-field">
                  <label>Explanation (optional)</label>
                  <input
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                  />
                </div>

                {questions.length > 1 && (
                  <button
                    type="button"
                    className="il-btn il-btn-danger il-btn-sm"
                    onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))}
                  >
                    Remove question
                  </button>
                )}
              </div>
            ))}

            <div className="il-actions">
              <button
                type="button"
                className="il-btn il-btn-outline"
                onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}
              >
                ➕ Add question
              </button>
              <button type="submit" className="il-btn il-btn-primary" disabled={busy}>
                {busy ? "Saving..." : "Save quiz"}
              </button>
            </div>
          </form>
        </>
      )}
    </InstructorLayout>
  );
}
