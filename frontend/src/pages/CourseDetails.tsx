import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { EmptyState, Loading, Notice } from "../components/Notice";
import {
  capitalize,
  formatDuration,
  getInitials,
  getYouTubeEmbedUrl,
  PRICE_LABEL,
} from "../utils/format";
import "./CourseDetails.css";

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="cd-stars" aria-label={`${value} out of 5 stars`}>
      {"★".repeat(full)}
      <span className="cd-stars-off">{"★".repeat(Math.max(0, 5 - full))}</span>
    </span>
  );
}

function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewError, setPreviewError] = useState("");

  const isEnrolled = !!enrollment;

  const loadCourse = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError("");
    setNotFound(false);

    try {
      const courseRes = await api.courses.getByIdOrSlug(id);
      const c = courseRes.data;
      setCourse(c);

      // Reviews are secondary: a failure here should not hide the course
      try {
        const reviewsRes = await api.courses.getReviews(c._id);
        setReviews(reviewsRes.data || []);
      } catch {
        setReviews([]);
      }

      if (isAuthenticated) {
        try {
          const mine = await api.enrollments.getMyEnrollments();
          const found = (mine.data || []).find(
            (e: any) => e.course?._id === c._id
          );
          setEnrollment(found || null);
        } catch {
          setEnrollment(null);
        }
      } else {
        setEnrollment(null);
      }
    } catch (err) {
      setCourse(null);
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setLoadError(getErrorMessage(err, "Failed to load this course."));
      }
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const userId = user?.id || (user as any)?._id;
  const mentorId = course?.mentor?._id || course?.mentor;
  const isOwner = !!course && !!user && String(mentorId) === String(userId);
  const isPublished = course?.status === "published";

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${course._id}`);
      return;
    }

    setEnrolling(true);
    setEnrollError("");
    try {
      await api.enrollments.enroll(course._id);
      navigate(`/learn/${course._id}`);
    } catch (err) {
      // 409 = already enrolled (e.g. enrolled in another tab): just continue
      if (err instanceof ApiError && err.status === 409) {
        navigate(`/learn/${course._id}`);
        return;
      }
      setEnrollError(getErrorMessage(err, "Enrollment failed. Please try again."));
    } finally {
      setEnrolling(false);
    }
  };

  const handleReviewSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!course) return;

    setSubmittingReview(true);
    setReviewMessage(null);

    try {
      await api.courses.submitReview(course._id, {
        rating,
        comment: comment.trim(),
      });
      setReviewMessage({ kind: "success", text: "Thanks! Your review was saved." });
      setComment("");

      const [updatedReviews, updatedCourse] = await Promise.all([
        api.courses.getReviews(course._id),
        api.courses.getByIdOrSlug(course._id),
      ]);
      setReviews(updatedReviews.data || []);
      setCourse(updatedCourse.data);
    } catch (err) {
      setReviewMessage({
        kind: "error",
        text: getErrorMessage(err, "Failed to submit review."),
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const togglePreview = async (lessonId: string) => {
    if (previewId === lessonId) {
      setPreviewId(null);
      return;
    }
    setPreviewId(lessonId);
    setPreviewData(null);
    setPreviewError("");
    try {
      const res = await api.learn.getLesson(lessonId);
      setPreviewData(res.data);
    } catch (err) {
      setPreviewError(getErrorMessage(err, "Could not load the preview."));
    }
  };

  // Group lessons / quizzes under their sections
  const curriculum = useMemo(() => {
    if (!course) return [];
    const sections = [...(course.sections || [])].sort(
      (a: any, b: any) => (a.order || 0) - (b.order || 0)
    );
    const lessons = course.lessons || [];
    const quizzes = course.quizzes || [];

    const grouped = sections.map((section: any) => ({
      id: section._id,
      title: section.title,
      lessons: lessons.filter((l: any) => l.sectionId === section._id),
      quizzes: quizzes.filter((q: any) => q.sectionId === section._id),
    }));

    const knownIds = new Set(sections.map((s: any) => s._id));
    const looseLessons = lessons.filter((l: any) => !knownIds.has(l.sectionId));
    const looseQuizzes = quizzes.filter((q: any) => !knownIds.has(q.sectionId));
    if (looseLessons.length > 0 || looseQuizzes.length > 0) {
      grouped.push({
        id: "other",
        title: "Additional content",
        lessons: looseLessons,
        quizzes: looseQuizzes,
      });
    }

    return grouped.filter((g: any) => g.lessons.length + g.quizzes.length > 0);
  }, [course]);

  const navbar = (
    <header className="cd-navbar">
      <div className="cd-navbar-inner">
        <Link to="/" className="cd-logo">
          <span className="cd-logo-icon">E</span>
          <span>Eduverse</span>
        </Link>

        <nav className="cd-nav-links">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/discover">Discover</Link>

          {isAuthenticated ? (
            <Link to="/student/dashboard" className="cd-nav-cta">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="cd-nav-cta">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="cd-page">
        {navbar}
        <Loading label="Loading course..." />
      </div>
    );
  }

  if (notFound || (!course && !loadError)) {
    return (
      <div className="cd-page">
        {navbar}
        <div className="cd-container">
          <EmptyState
            icon="🔎"
            title="Course not found"
            message="This course doesn't exist, or it hasn't been published yet."
          >
            <Link to="/courses" className="ev-btn">
              Browse courses
            </Link>
          </EmptyState>
        </div>
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className="cd-page">
        {navbar}
        <div className="cd-container">
          <Notice
            title="Couldn't load this course"
            message={loadError}
            onRetry={loadCourse}
          />
        </div>
      </div>
    );
  }

  const stats = course.stats || {};
  const mentor = course.mentor || {};
  const mentorName = mentor.name || "Instructor";
  const hasRatings = (stats.ratingCount || 0) > 0;
  const embedUrl = getYouTubeEmbedUrl(course.previewVideoUrl);
  const progressPercent = enrollment?.progressPercent || 0;
  const canReview = isEnrolled && !isOwner;

  return (
    <div className="cd-page">
      {navbar}

      {/* HERO */}
      <section className="cd-hero">
        <div className="cd-container">
          <div className="cd-breadcrumb">
            <Link to="/courses">Courses</Link>
            <span>/</span>
            <span>{course.category?.name || "Course"}</span>
          </div>

          <div className="cd-badges">
            {!isPublished && (
              <span className="cd-badge cd-badge-warn">
                {capitalize(course.status)} preview
              </span>
            )}
            {course.category?.name && (
              <span className="cd-badge">{course.category.name}</span>
            )}
            <span className="cd-badge">{capitalize(course.level)}</span>
          </div>

          <h1>{course.title}</h1>
          {course.subtitle && <p className="cd-subtitle">{course.subtitle}</p>}

          <div className="cd-meta">
            <div className="cd-meta-item">
              {hasRatings ? (
                <>
                  <strong>{stats.ratingAvg}</strong>
                  <Stars value={stats.ratingAvg} />
                  <span>({stats.ratingCount} reviews)</span>
                </>
              ) : (
                <span>No ratings yet</span>
              )}
            </div>
            <div className="cd-meta-item">
              <span>👥 {(stats.enrollmentCount || 0).toLocaleString()} students</span>
            </div>
            <div className="cd-meta-item">
              <span>⏱ {formatDuration(stats.totalDurationMin)}</span>
            </div>
            <div className="cd-meta-item">
              <span>🌐 {course.language || "English"}</span>
            </div>
          </div>

          <div className="cd-hero-instructor">
            <div className="cd-avatar">{getInitials(mentorName, "I")}</div>
            <div>
              <small>Created by</small>
              <strong>{mentorName}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="cd-container cd-layout">
        <div className="cd-main">
          {!isPublished && (
            <Notice
              kind="info"
              message={
                isOwner
                  ? "This course is not published yet. Only you can see this preview. Publish it from Mentor Studio to make it available to students."
                  : "This course is not published."
              }
            />
          )}

          {course.description && (
            <section className="cd-card">
              <h2>About this course</h2>
              <p className="cd-description">{course.description}</p>
            </section>
          )}

          {course.learningOutcomes?.length > 0 && (
            <section className="cd-card">
              <h2>What you will learn</h2>
              <div className="cd-learn-grid">
                {course.learningOutcomes.map((item: string, index: number) => (
                  <div className="cd-learn-item" key={index}>
                    <span className="cd-check">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="cd-card">
            <div className="cd-card-heading">
              <h2>Course content</h2>
              <p>
                {stats.lessonCount || 0} lessons
                {stats.quizCount ? ` • ${stats.quizCount} quizzes` : ""} •{" "}
                {formatDuration(stats.totalDurationMin)} total
              </p>
            </div>

            {curriculum.length === 0 ? (
              <p className="cd-muted">No lessons have been published yet.</p>
            ) : (
              curriculum.map((section: any) => (
                <div className="cd-section" key={section.id}>
                  <h3>{section.title}</h3>

                  {section.lessons.map((lesson: any) => (
                    <div key={lesson._id}>
                      <div className="cd-lesson">
                        <div className="cd-lesson-left">
                          <span className="cd-lesson-icon">
                            {lesson.type === "text" ? "📄" : "▶"}
                          </span>
                          <div>
                            <strong>{lesson.title}</strong>
                            <small>
                              {lesson.durationMin
                                ? `${lesson.durationMin} min`
                                : "Reading"}
                            </small>
                          </div>
                        </div>

                        {lesson.isFreePreview ? (
                          <button
                            type="button"
                            className="cd-preview-btn"
                            onClick={() => togglePreview(lesson._id)}
                          >
                            {previewId === lesson._id ? "Hide" : "Preview"}
                          </button>
                        ) : (
                          <span className="cd-lock" title="Enroll to unlock">
                            🔒
                          </span>
                        )}
                      </div>

                      {previewId === lesson._id && (
                        <div className="cd-preview-box">
                          {previewError && (
                            <Notice message={previewError} />
                          )}
                          {!previewError && !previewData && (
                            <Loading label="Loading preview..." />
                          )}
                          {previewData && (
                            <>
                              {getYouTubeEmbedUrl(previewData.videoUrl) && (
                                <iframe
                                  title={previewData.title}
                                  src={getYouTubeEmbedUrl(previewData.videoUrl) || ""}
                                  allowFullScreen
                                />
                              )}
                              {previewData.content && (
                                <p>{previewData.content}</p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {section.quizzes.map((quiz: any) => (
                    <div className="cd-lesson" key={quiz._id}>
                      <div className="cd-lesson-left">
                        <span className="cd-lesson-icon">📝</span>
                        <div>
                          <strong>{quiz.title}</strong>
                          <small>Quiz • pass at {quiz.passPercent}%</small>
                        </div>
                      </div>
                      <span className="cd-lock" title="Enroll to unlock">
                        🔒
                      </span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </section>

          {course.requirements?.length > 0 && (
            <section className="cd-card">
              <h2>Requirements</h2>
              <ul className="cd-requirements">
                {course.requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="cd-card">
            <h2>Instructor</h2>
            <div className="cd-instructor">
              <div className="cd-avatar cd-avatar-lg">
                {getInitials(mentorName, "I")}
              </div>
              <div>
                <h3>{mentorName}</h3>
                {mentor.mentorProfile?.headline && (
                  <span className="cd-instructor-role">
                    {mentor.mentorProfile.headline}
                  </span>
                )}
                {mentor.mentorProfile?.bio && <p>{mentor.mentorProfile.bio}</p>}
                {mentor.mentorProfile?.expertise?.length > 0 && (
                  <div className="cd-chips">
                    {mentor.mentorProfile.expertise.map((skill: string) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="cd-card" id="reviews">
            <div className="cd-card-heading">
              <h2>Student reviews</h2>
              <p>
                {hasRatings
                  ? `${stats.ratingAvg} average from ${stats.ratingCount} review${
                      stats.ratingCount === 1 ? "" : "s"
                    }`
                  : "No reviews yet."}
              </p>
            </div>

            {canReview && (
              <form className="cd-review-form" onSubmit={handleReviewSubmit}>
                <strong>Leave a review</strong>

                {progressPercent < 25 && (
                  <p className="cd-muted">
                    You can review this course once you've completed 25% of it
                    (you're at {progressPercent}%).
                  </p>
                )}

                <label htmlFor="cd-rating">Rating</label>
                <select
                  id="cd-rating"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value={5}>5 stars - Excellent</option>
                  <option value={4}>4 stars - Very good</option>
                  <option value={3}>3 stars - Good</option>
                  <option value={2}>2 stars - Fair</option>
                  <option value={1}>1 star - Poor</option>
                </select>

                <textarea
                  rows={3}
                  placeholder="Share what you thought of the course..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                {reviewMessage && (
                  <Notice
                    kind={reviewMessage.kind}
                    message={reviewMessage.text}
                  />
                )}

                <button
                  type="submit"
                  className="ev-btn"
                  disabled={submittingReview || progressPercent < 25}
                >
                  {submittingReview ? "Submitting..." : "Submit review"}
                </button>
              </form>
            )}

            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div className="cd-review" key={rev._id}>
                  <div className="cd-avatar">
                    {getInitials(rev.student?.name, "S")}
                  </div>
                  <div className="cd-review-body">
                    <div className="cd-review-top">
                      <strong>{rev.student?.name || "Student"}</strong>
                      <Stars value={rev.rating} />
                    </div>
                    {rev.comment && <p>{rev.comment}</p>}
                    {rev.mentorReply?.text && (
                      <div className="cd-reply">
                        <small>Instructor reply</small>
                        <p>{rev.mentorReply.text}</p>
                      </div>
                    )}
                    <small className="cd-muted">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="cd-muted">Be the first to review this course.</p>
            )}
          </section>
        </div>

        {/* STICKY CARD */}
        <aside className="cd-aside">
          <div className="cd-sticky-card">
            <div className="cd-thumb">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} />
              ) : (
                <span>🎓</span>
              )}
            </div>

            {embedUrl && (
              <details className="cd-trailer">
                <summary>▶ Watch course preview</summary>
                <iframe title="Course preview" src={embedUrl} allowFullScreen />
              </details>
            )}

            <div className="cd-card-body">
              <div className="cd-price">
                <strong>{PRICE_LABEL}</strong>
                <span>Full lifetime access</span>
              </div>

              {isEnrolled && (
                <div className="cd-progress">
                  <div className="cd-progress-track">
                    <div style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <small>{progressPercent}% complete</small>
                </div>
              )}

              {enrollError && <Notice message={enrollError} />}

              {isOwner ? (
                <Link to="/mentor" className="ev-btn cd-full">
                  Manage in Mentor Studio
                </Link>
              ) : (
                <button
                  type="button"
                  className="ev-btn cd-full"
                  onClick={handleEnroll}
                  disabled={enrolling || (!isPublished && !isEnrolled)}
                >
                  {enrolling
                    ? "Enrolling..."
                    : isEnrolled
                    ? "Go to course →"
                    : !isAuthenticated
                    ? "Log in to enroll"
                    : "Enroll now"}
                </button>
              )}

              {!isAuthenticated && (
                <p className="cd-muted cd-center">
                  New here? <Link to="/register">Create a free account</Link>
                </p>
              )}

              <div className="cd-includes">
                <h3>This course includes</h3>
                <div>🎥 {formatDuration(stats.totalDurationMin)} of content</div>
                <div>📝 {stats.lessonCount || 0} lessons</div>
                {stats.quizCount > 0 && <div>✅ {stats.quizCount} quizzes</div>}
                <div>📱 Access on mobile and desktop</div>
                <div>🏆 Certificate of completion</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="cd-footer">
        <div className="cd-container cd-footer-inner">
          <span>© 2026 Eduverse</span>
          <div>
            <Link to="/courses">Courses</Link>
            <Link to="/discover">Discover</Link>
            <Link to="/student/dashboard">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CourseDetails;
