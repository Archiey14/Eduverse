
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import "./Progress.css";

interface CourseProgress {
  id: string | number;
  title: string;
  instructor: string;
  category: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastLesson: string;
  totalTime: string;
  imageClass: string;
  icon: string;
  color: string;
}

interface ProgressStats {
  enrolledCount: number;
  completedCount: number;
  hoursLearned: number;
  streak: number;
}

const Progress = () => {
  const [courseList, setCourseList] = useState<CourseProgress[]>([]);

  const [stats, setStats] = useState<ProgressStats>({
    enrolledCount: 0,
    completedCount: 0,
    hoursLearned: 0,
    streak: 0,
  });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.dashboard.getStudentDashboard();

        if (res.data) {
          if (res.data.stats) {
            setStats({
              enrolledCount: res.data.stats.enrolledCount || 0,
              completedCount: res.data.stats.completedCount || 0,
              hoursLearned: res.data.stats.hoursLearned || 0,
              streak: res.data.stats.streak || 0,
            });
          }

          if (
            res.data.activeEnrollments &&
            res.data.activeEnrollments.length > 0
          ) {
            const mapped: CourseProgress[] =
              res.data.activeEnrollments.map(
                (enr: any, idx: number) => ({
                  id:
                    enr.course?._id ||
                    enr.course?.slug ||
                    enr._id,

                  title:
                    enr.course?.title ||
                    "Enrolled Course",

                  instructor:
                    enr.course?.mentor?.name ||
                    "Lead Instructor",

                  category:
                    enr.course?.category?.name ||
                    "Web Development",

                  progress: enr.progressPercent || 0,

                  completedLessons:
                    enr.completedLessons?.length || 0,

                  totalLessons:
                    enr.course?.stats?.lessonCount || 10,

                  lastLesson:
                    enr.lastLesson?.title ||
                    "First Lesson",

                  totalTime: `${Math.round(
                    (enr.course?.stats?.totalDurationMin || 90) / 60
                  )}h ${
                    (enr.course?.stats?.totalDurationMin || 90) % 60
                  }m`,

                  imageClass:
                    idx % 3 === 0
                      ? "progress-react"
                      : idx % 3 === 1
                      ? "progress-python"
                      : "progress-javascript",

                  icon:
                    idx % 3 === 0
                      ? "⚛️"
                      : idx % 3 === 1
                      ? "🐍"
                      : "JS",

                  color:
                    idx % 3 === 0
                      ? "blue"
                      : idx % 3 === 1
                      ? "green"
                      : "yellow",
                })
              );

            setCourseList(mapped);
          } else {
            setCourseList([]);
          }
        }
      } catch (err) {
        console.warn("Unable to load progress data:", err);
        setCourseList([]);
      }
    };

    fetchProgress();
  }, []);

  const completedLessons = courseList.reduce(
    (total, course) => total + course.completedLessons,
    0
  );

  const totalLessons = courseList.reduce(
    (total, course) => total + course.totalLessons,
    0
  );

  const overallProgress = Math.round(
    courseList.length > 0
      ? courseList.reduce(
          (total, course) => total + course.progress,
          0
        ) / courseList.length
      : 0
  );

  return (
    <StudentLayout
      activeItem="progress"
      searchPlaceholder="Search your progress, certificates, and achievements..."
    >
      <div className="progress-content" style={{ padding: "0" }}>
        {/* Header */}
        <section className="progress-page-header">
          <div>
            <span className="progress-eyebrow">
              YOUR LEARNING JOURNEY
            </span>

            <h1>Learning Progress & Analytics</h1>

            <p>
              Track your course completions, study hours, and
              achievements.
            </p>
          </div>

          <Link
            to="/courses"
            className="progress-browse-button"
          >
            Explore Courses →
          </Link>
        </section>

        {/* Stats Overview */}
        <section className="progress-stat-grid">
          <div className="progress-stat-card progress-stat-primary">
            <div className="progress-stat-icon">📚</div>

            <div className="progress-stat-content">
              <span>Overall Completion</span>

              <strong>{overallProgress}%</strong>

              <small>
                Across all enrolled courses
              </small>
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

              <small>Total learning time</small>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="progress-main-grid">
          {/* Course Progress */}
          <section className="progress-courses-section">
            <div className="progress-section-header">
              <div>
                <h2>Course Progress</h2>

                <p>Continue where you left off.</p>
              </div>

              <Link to="/courses">View All →</Link>
            </div>

            <div className="progress-course-list">
              {courseList.map((course) => (
                <div
                  className="progress-course-card"
                  key={course.id}
                >
                  <div
                    className={`progress-course-image ${course.imageClass}`}
                  >
                    <span>{course.icon}</span>
                  </div>

                  <div className="progress-course-details">
                    <div className="progress-course-heading">
                      <div>
                        <span className="progress-course-category">
                          {course.category}
                        </span>

                        <h3>{course.title}</h3>

                        <p>
                          By{" "}
                          <strong>
                            {course.instructor}
                          </strong>
                        </p>
                      </div>

                      <span className="progress-percentage">
                        {course.progress}%
                      </span>
                    </div>

                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${course.progress}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="progress-course-meta">
                      <span>
                        {course.completedLessons}/
                        {course.totalLessons} lessons
                      </span>

                      <span>
                        {course.totalTime} learned
                      </span>
                    </div>

                    <div className="progress-course-footer">
                      <span>
                        Last:{" "}
                        <strong>
                          {course.lastLesson}
                        </strong>
                      </span>

                      <Link
                        to={`/learn/${course.id}`}
                      >
                        Continue Learning →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {courseList.length === 0 && (
                <div className="progress-empty-state">
                  <span>📚</span>

                  <h3>No active courses yet</h3>

                  <p>
                    Enroll in a course to start
                    tracking your learning progress.
                  </p>

                  <Link to="/courses">
                    Explore Courses →
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Side Column */}
          <aside className="progress-side-column">
            {/* Quick Summary */}
            <section className="progress-summary-card">
              <h2>Learning Summary</h2>

              <div className="progress-summary-row">
                <div className="progress-summary-icon">
                  🎯
                </div>

                <div>
                  <strong>
                    {stats.enrolledCount}
                  </strong>

                  <span>Enrolled Courses</span>
                </div>
              </div>

              <div className="progress-summary-row">
                <div className="progress-summary-icon">
                  ✅
                </div>

                <div>
                  <strong>
                    {stats.completedCount}
                  </strong>

                  <span>Completed Courses</span>
                </div>
              </div>

              <div className="progress-summary-row">
                <div className="progress-summary-icon">
                  🏆
                </div>

                <div>
                  <strong>8</strong>

                  <span>Achievements Earned</span>
                </div>
              </div>

              <div className="progress-summary-row">
                <div className="progress-summary-icon">
                  ⭐
                </div>

                <div>
                  <strong>4.9</strong>

                  <span>Average Course Rating</span>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* Bottom Learning Insights */}
        <section className="progress-insights">
          <div className="progress-insight-card">
            <div className="progress-insight-icon">
              💡
            </div>

            <div>
              <span>LEARNING TIP</span>

              <h3>Consistency beats intensity.</h3>

              <p>
                You have been learning for{" "}
                {stats.streak} days in a row. Keep your
                streak alive by spending at least 30
                minutes learning today.
              </p>
            </div>
          </div>

          <div className="progress-insight-card">
            <div className="progress-insight-icon">
              🚀
            </div>

            <div>
              <span>NEXT MILESTONE</span>

              <h3>
                Complete React & TypeScript
              </h3>

              <p>
                You are only 22% away from completing
                your React course. Keep going!
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="progress-footer">
        <div>
          <strong>LearnHub</strong>

          <span>Learn. Grow. Succeed.</span>
        </div>

        <div className="progress-footer-links">
          <Link to="/courses">Help Center</Link>

          <Link to="/courses">Privacy</Link>

          <Link to="/courses">Terms</Link>
        </div>

        <span>
          © 2026 LearnHub. All rights reserved.
        </span>
      </footer>
    </StudentLayout>
  );
};

export default Progress;
