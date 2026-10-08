import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import { Loading, Notice } from "../components/Notice";
import { formatDuration } from "../utils/format";
import {
  buildAchievements,
  emptyAchievementStats,
  toAchievementStats,
} from "../utils/achievements";
import type { AchievementStats } from "../utils/achievements";
import "./Progress.css";

interface CourseProgress {
  id: string;
  title: string;
  instructor: string;
  category: string;
  progress: number;
  completed: boolean;
  completedLessons: number;
  totalLessons: number;
  lastLesson: string;
  courseLength: string;
  imageClass: string;
  icon: string;
}

const IMAGE_CLASSES = ["progress-react", "progress-python", "progress-javascript"];
const ICONS = ["⚛️", "🐍", "JS"];

const Progress = () => {
  const [courseList, setCourseList] = useState<CourseProgress[]>([]);
  const [stats, setStats] = useState<AchievementStats>(emptyAchievementStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api.dashboard
      .getStudentDashboard()
      .then((res) => {
        if (cancelled || !res.data) return;

        setStats(toAchievementStats(res.data.stats));

        const enrollments = [
          ...(res.data.activeEnrollments || []),
          ...(res.data.completedEnrollments || []),
        ];

        setCourseList(
          enrollments.map((enr: any, idx: number) => ({
            id: enr.course?._id || enr._id,
            title: enr.course?.title || "Course",
            instructor: enr.course?.mentor?.name || "Instructor",
            category: enr.course?.category?.name || "Uncategorised",
            progress: enr.progressPercent || 0,
            completed: enr.status === "completed",
            completedLessons: enr.completedLessons?.length || 0,
            totalLessons: enr.course?.stats?.lessonCount || 0,
            lastLesson: enr.lastLesson?.title || "Not started yet",
            courseLength: formatDuration(enr.course?.stats?.totalDurationMin),
            imageClass: IMAGE_CLASSES[idx % IMAGE_CLASSES.length],
            icon: ICONS[idx % ICONS.length],
          }))
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Unable to load your progress."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const completedLessons = courseList.reduce((t, c) => t + c.completedLessons, 0);
  const totalLessons = courseList.reduce((t, c) => t + c.totalLessons, 0);

  const overallProgress =
    courseList.length > 0
      ? Math.round(courseList.reduce((t, c) => t + c.progress, 0) / courseList.length)
      : 0;

  const achievements = useMemo(() => buildAchievements(stats), [stats]);
  const earnedAchievements = achievements.filter((a) => a.earned).length;

  // The unfinished course that is closest to being completed
  const nextMilestone = useMemo(() => {
    const inProgress = courseList.filter((c) => !c.completed);
    if (inProgress.length === 0) return null;
    return inProgress.reduce((best, c) => (c.progress > best.progress ? c : best));
  }, [courseList]);

  return (
    <StudentLayout
      activeItem="progress"
      searchPlaceholder="Search your progress, certificates, and achievements..."
    >
      <div className="progress-content" style={{ padding: "0" }}>
        <section className="progress-page-header">
          <div>
            <span className="progress-eyebrow">YOUR LEARNING JOURNEY</span>
            <h1>Learning Progress & Analytics</h1>
            <p>Track your course completions, study hours, and achievements.</p>
          </div>

          <Link to="/courses" className="progress-browse-button">
            Explore Courses →
          </Link>
        </section>

        {error && <Notice message={error} />}

        {loading ? (
          <Loading label="Loading your progress..." />
        ) : (
          <>
            <section className="progress-stat-grid">
              <div className="progress-stat-card progress-stat-primary">
                <div className="progress-stat-icon">📚</div>
                <div className="progress-stat-content">
                  <span>Overall Completion</span>
                  <strong>{overallProgress}%</strong>
                  <small>Across all enrolled courses</small>
                </div>
              </div>

              <div className="progress-stat-card">
                <div className="progress-stat-icon">✅</div>
                <div className="progress-stat-content">
                  <span>Lessons Completed</span>
                  <strong>
                    {completedLessons}/{totalLessons}
                  </strong>
                  <small>Total lessons finished</small>
                </div>
              </div>

              <div className="progress-stat-card">
                <div className="progress-stat-icon">⏱️</div>
                <div className="progress-stat-content">
                  <span>Hours Learned</span>
                  <strong>{stats.hoursLearned}h</strong>
                  <small>From completed lessons</small>
                </div>
              </div>
            </section>

            <div className="progress-main-grid">
              <section className="progress-courses-section">
                <div className="progress-section-header">
                  <div>
                    <h2>Course Progress</h2>
                    <p>Continue where you left off.</p>
                  </div>

                  <Link to="/student/courses">View All →</Link>
                </div>

                <div className="progress-course-list">
                  {courseList.map((course) => (
                    <div className="progress-course-card" key={course.id}>
                      <div className={`progress-course-image ${course.imageClass}`}>
                        <span>{course.icon}</span>
                      </div>

                      <div className="progress-course-details">
                        <div className="progress-course-heading">
                          <div>
                            <span className="progress-course-category">
                              {course.category}
                              {course.completed ? " · COMPLETED" : ""}
                            </span>
                            <h3>{course.title}</h3>
                            <p>
                              By <strong>{course.instructor}</strong>
                            </p>
                          </div>

                          <span className="progress-percentage">{course.progress}%</span>
                        </div>

                        <div className="progress-bar-wrapper">
                          <div className="progress-bar-track">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="progress-course-meta">
                          <span>
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                          <span>{course.courseLength} total</span>
                        </div>

                        <div className="progress-course-footer">
                          <span>
                            Last: <strong>{course.lastLesson}</strong>
                          </span>

                          <Link to={`/learn/${course.id}`}>
                            {course.completed ? "Review Course →" : "Continue Learning →"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                  {courseList.length === 0 && (
                    <div className="progress-empty-state">
                      <span>📚</span>
                      <h3>No courses yet</h3>
                      <p>Enroll in a course to start tracking your learning progress.</p>
                      <Link to="/courses">Explore Courses →</Link>
                    </div>
                  )}
                </div>
              </section>

              <aside className="progress-side-column">
                <section className="progress-summary-card">
                  <h2>Learning Summary</h2>

                  <div className="progress-summary-row">
                    <div className="progress-summary-icon">🎯</div>
                    <div>
                      <strong>{stats.enrolledCount}</strong>
                      <span>Enrolled Courses</span>
                    </div>
                  </div>

                  <div className="progress-summary-row">
                    <div className="progress-summary-icon">✅</div>
                    <div>
                      <strong>{stats.completedCount}</strong>
                      <span>Completed Courses</span>
                    </div>
                  </div>

                  <div className="progress-summary-row">
                    <div className="progress-summary-icon">🏆</div>
                    <div>
                      <strong>
                        {earnedAchievements}/{achievements.length}
                      </strong>
                      <span>Achievements Earned</span>
                    </div>
                  </div>

                  <div className="progress-summary-row">
                    <div className="progress-summary-icon">📝</div>
                    <div>
                      <strong>{stats.passedQuizzesCount}</strong>
                      <span>Quizzes Passed</span>
                    </div>
                  </div>
                </section>
              </aside>
            </div>

            <section className="progress-insights">
              <div className="progress-insight-card">
                <div className="progress-insight-icon">💡</div>
                <div>
                  <span>LEARNING TIP</span>
                  <h3>Consistency beats intensity.</h3>
                  <p>
                    {stats.streakDays > 0
                      ? `You have been learning for ${stats.streakDays} day${
                          stats.streakDays === 1 ? "" : "s"
                        } in a row. Keep your streak alive by learning something today.`
                      : "Start a learning streak by completing a lesson today."}
                  </p>
                </div>
              </div>

              <div className="progress-insight-card">
                <div className="progress-insight-icon">🚀</div>
                <div>
                  <span>NEXT MILESTONE</span>
                  {nextMilestone ? (
                    <>
                      <h3>Complete {nextMilestone.title}</h3>
                      <p>
                        {nextMilestone.progress >= 100
                          ? "You've finished every lesson. Take any remaining quizzes to wrap up."
                          : `You are only ${100 - nextMilestone.progress}% away from completing this course. Keep going!`}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3>Pick your next course</h3>
                      <p>
                        {courseList.length > 0
                          ? "You've completed all your courses. Explore the catalog for something new."
                          : "Enroll in a course to set your first milestone."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <footer className="progress-footer">
        <div>
          <strong>Eduverse</strong>
          <span>Learn. Grow. Succeed.</span>
        </div>

        <div className="progress-footer-links">
          <Link to="/help">Help Center</Link>
          <Link to="/courses">Courses</Link>
        </div>

        <span>© 2026 Eduverse. All rights reserved.</span>
      </footer>
    </StudentLayout>
  );
};

export default Progress;
