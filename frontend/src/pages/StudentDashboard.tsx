import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import StudentLayout from "../components/StudentLayout";
import { formatDuration, PRICE_LABEL } from "../utils/format";
import "./StudentDashboard.css";

function StudentDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, coursesRes] = await Promise.all([
          api.dashboard.getStudentDashboard(),
          api.courses.getAll({ limit: 12 }),
        ]);

        const dashData = dashRes.data || null;
        if (dashData) {
          setDashboardData(dashData);
        }

        if (coursesRes.data && coursesRes.data.length > 0) {
          // Recommend courses the student has not enrolled in yet
          const enrolledIds = new Set<string>(
            [...(dashData?.activeEnrollments || []), ...(dashData?.completedEnrollments || [])]
              .map((enr: any) => String(enr.course?._id || ""))
              .filter(Boolean)
          );

          const mapped = coursesRes.data
            .filter((c: any) => !enrolledIds.has(String(c._id)))
            .slice(0, 3)
            .map((c: any, idx: number) => ({
              id: c._id || c.slug,
              title: c.title,
              instructor: c.mentor?.name || "Instructor",
              rating: c.stats?.ratingCount > 0 ? c.stats.ratingAvg : null,
              students: `${c.stats?.enrollmentCount || 0}`,
              lessons: `${c.stats?.lessonCount || 0} lessons`,
              duration: formatDuration(c.stats?.totalDurationMin),
              price: PRICE_LABEL,
              icon: idx % 3 === 0 ? "🟨" : idx % 3 === 1 ? "🎨" : "🟢",
              colorClass:
                idx % 3 === 0
                  ? "recommend-yellow"
                  : idx % 3 === 1
                  ? "recommend-pink"
                  : "recommend-green",
            }));
          setRecommendedCourses(mapped);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchDashboard();
  }, []);

  // Map live data from database
  const dbStats = dashboardData?.stats;
  const enrolledCount = dbStats?.enrolledCount ?? 0;
  const activeCount = dbStats?.activeCount ?? 0;
  const completedCount = dbStats?.completedCount ?? 0;
  const streakDays = dbStats?.streakDays ?? 0;
  const hoursLearned = dbStats ? `${dbStats.hoursLearned}h` : "0h";

  // Dynamic enrolled courses from DB
  const rawEnrolled = dashboardData?.activeEnrollments || [];
  const enrolledCourses = rawEnrolled.map((enr: any, idx: number) => {
    const totalLessons = enr.course?.stats?.lessonCount || 0;
    const doneLessons = enr.completedLessons?.length || 0;
    return {
      id: enr.course?._id || enr._id,
      category: (enr.course?.category?.name || "Uncategorised").toUpperCase(),
      title: enr.course?.title || "Course",
      instructor: enr.course?.mentor?.name || "Instructor",
      lesson: enr.lastLesson?.title || (doneLessons > 0 ? "Next lesson" : "Not started yet"),
      lessonNumber: totalLessons > 0 ? Math.min(doneLessons + 1, totalLessons) : 0,
      totalLessons,
      progress: enr.progressPercent || 0,
      icon: idx % 2 === 0 ? "💻" : "🐍",
      duration: formatDuration(enr.course?.stats?.totalDurationMin),
      colorClass:
        idx % 3 === 0
          ? "course-blue"
          : idx % 3 === 1
          ? "course-purple"
          : "course-green",
    };
  });

  const avgProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce(
            (sum: number, c: any) => sum + (c.progress || 0),
            0
          ) / enrolledCourses.length
        )
      : 0;

  // Dynamic upcoming quizzes or quiz attempts
  const rawQuizAttempts = dashboardData?.recentQuizAttempts || [];
  const upcomingQuizzes = rawQuizAttempts.map((attempt: any) => ({
    id: attempt._id,
    title: attempt.quiz?.title || "Quiz Assessment",
    course: attempt.course?.title || "Enrolled Course",
    score: `${attempt.scorePercent}%`,
    passed: attempt.passed,
    date: new Date(attempt.submittedAt).toLocaleDateString(),
    icon: attempt.passed ? "✅" : "📝",
    type: attempt.passed ? "today" : "upcoming",
  }));

  // Dynamic activities from DB
  const rawActivities = dashboardData?.recentActivities || [];
  const recentActivities = rawActivities.slice(0, 4).map((act: any) => ({
    id: act._id,
    icon:
      act.type === "quiz_passed"
        ? "📝"
        : act.type === "enrolled"
        ? "📚"
        : "✓",
    title: act.message,
    description: act.course?.title || "Course Progress",
    time: new Date(act.createdAt).toLocaleDateString(),
    type:
      act.type === "quiz_passed"
        ? "quiz"
        : act.type === "enrolled"
        ? "course"
        : "success",
  }));



  const filteredCourses = enrolledCourses.filter((course: any) =>
    `${course.title} ${course.category} ${course.instructor}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const displayName = user?.name || "Learner";

  return (
    <StudentLayout
      activeItem="dashboard"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search enrolled courses, lessons..."
    >
      {/* ================================
          WELCOME HERO
      ================================= */}
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <span className="welcome-eyebrow">STUDENT DASHBOARD</span>

          <h1>Welcome back, {displayName}! 👋</h1>

          <p>
            {enrolledCourses.length > 0
              ? "You're doing great! Keep learning and reach your goals one lesson at a time."
              : "Welcome to Eduverse! Explore courses to start your personalized learning journey today."}
          </p>

          <div className="welcome-actions">
            {enrolledCourses.length > 0 ? (
              <Link
                to={`/learn/${enrolledCourses[0].id}`}
                className="dashboard-primary-button"
              >
                Continue Learning
                <span>→</span>
              </Link>
            ) : (
              <Link to="/courses" className="dashboard-primary-button">
                Browse Courses
                <span>→</span>
              </Link>
            )}

            <Link to="/courses" className="dashboard-secondary-button">
              Explore Catalog
            </Link>
          </div>
        </div>

        <div className="welcome-visual">
          <div className="welcome-circle circle-one"></div>
          <div className="welcome-circle circle-two"></div>

          <div className="welcome-student">🎓</div>

          <div className="floating-learning-card">
            <span>🔥</span>
            <div>
              <strong>
                {streakDays > 0
                  ? `${streakDays}-day streak`
                  : "Start a streak"}
              </strong>
              <small>
                {streakDays > 0
                  ? "Keep it going!"
                  : "Learn something today"}
              </small>
            </div>
          </div>

          <div className="floating-progress-card">
            <div className="mini-progress-ring">{avgProgress}%</div>
            <div>
              <strong>Overall Progress</strong>
              <small>
                {enrolledCourses.length > 0
                  ? `${enrolledCourses.length} active courses`
                  : "0 enrolled courses"}
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* ================================
          STATISTICS
      ================================= */}
      <section className="dashboard-stat-grid">
        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="dashboard-stat-icon blue">📚</div>
          </div>
          <span className="stat-label">Enrolled Courses</span>
          <strong className="stat-number">{enrolledCount}</strong>
          <p>{activeCount} in progress</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="dashboard-stat-icon purple">📈</div>
          </div>
          <span className="stat-label">Average Progress</span>
          <strong className="stat-number">{avgProgress}%</strong>
          <p>Across your active courses</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="dashboard-stat-icon green">✓</div>
          </div>
          <span className="stat-label">Completed Courses</span>
          <strong className="stat-number">{completedCount}</strong>
          <p>{completedCount === 1 ? "1 course finished" : `${completedCount} courses finished`}</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-card-top">
            <div className="dashboard-stat-icon orange">⏱</div>
          </div>
          <span className="stat-label">Learning Hours</span>
          <strong className="stat-number">{hoursLearned}</strong>
          <p>From completed lessons</p>
        </div>
      </section>

      {/* ================================
          MAIN GRID
      ================================= */}
      <div className="dashboard-main-grid">
        {/* IN PROGRESS COURSES */}
        <section className="dashboard-card in-progress-card">
          <div className="dashboard-card-header">
            <div>
              <span className="card-eyebrow">CONTINUE LEARNING</span>
              <h2>In Progress Courses</h2>
              <p>Pick up where you left off and keep moving forward.</p>
            </div>

            <Link to="/student/courses" className="view-all-link">
              View all ({enrolledCourses.length}) →
            </Link>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="course-list">
              {filteredCourses.map((course: any) => (
                <article className="dashboard-course-item" key={course.id}>
                  <div className={`course-visual ${course.colorClass}`}>
                    <span>{course.icon}</span>
                    <small>{course.duration}</small>
                  </div>

                  <div className="dashboard-course-info">
                    <span className="course-category">{course.category}</span>
                    <h3>{course.title}</h3>
                    <p>
                      Current: <span>{course.lesson}</span>
                      {course.totalLessons > 0 &&
                        ` (Lesson ${course.lessonNumber} of ${course.totalLessons})`}
                    </p>

                    <div className="course-progress-line">
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <strong>{course.progress}%</strong>
                    </div>
                  </div>

                  <Link
                    to={`/learn/${course.id}`}
                    className="course-play-button"
                    aria-label={`Continue ${course.title}`}
                  >
                    ▶
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state" style={{ padding: "40px 20px" }}>
              <span style={{ fontSize: "36px", marginBottom: "10px" }}>📚</span>
              <strong style={{ fontSize: "16px", color: "#1f2937" }}>
                No courses in progress
              </strong>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "6px 0 16px" }}>
                You haven't enrolled in any courses yet. Choose a course from our catalog to start learning.
              </p>
              <Link
                to="/courses"
                className="dashboard-primary-button"
                style={{ display: "inline-flex", margin: "0 auto" }}
              >
                Browse All Courses →
              </Link>
            </div>
          )}
        </section>

        {/* UPCOMING / RECENT QUIZZES */}
        <section className="dashboard-card quizzes-card">
          <div className="dashboard-card-header">
            <div>
              <span className="card-eyebrow">ASSESSMENTS</span>
              <h2>Assessments & Quizzes</h2>
              <p>Test your knowledge and track your scores.</p>
            </div>

            <Link to="/quizzes" className="view-all-link">
              View all →
            </Link>
          </div>

          {upcomingQuizzes.length > 0 ? (
            <div className="quiz-list">
              {upcomingQuizzes.map((quiz: any) => (
                <article className="dashboard-quiz-item" key={quiz.id}>
                  <div className="quiz-item-icon">{quiz.icon}</div>
                  <div className="quiz-item-content">
                    <h3>{quiz.title}</h3>
                    <p>
                      {quiz.course} • Score: {quiz.score}
                    </p>
                  </div>
                  <span className={`quiz-date ${quiz.type}`}>{quiz.date}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state" style={{ padding: "30px 15px" }}>
              <span style={{ fontSize: "32px", marginBottom: "8px" }}>📝</span>
              <strong style={{ fontSize: "15px", color: "#1f2937" }}>
                No quiz attempts yet
              </strong>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 14px" }}>
                Quizzes will appear here once you take them in your enrolled courses.
              </p>
              <Link to="/quizzes" className="full-width-outline-button">
                Open Quizzes Center →
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* ================================
          SECONDARY GRID
      ================================= */}
      <div className="dashboard-secondary-grid">


        {/* RECENT ACTIVITY */}
        <section className="dashboard-card recent-activity-section">
          <div className="dashboard-card-header">
            <div>
              <span className="card-eyebrow">RECENT ACTIVITY</span>
              <h2>What You've Been Up To</h2>
              <p>Your latest learning actions.</p>
            </div>

            <Link to="/activities" className="view-all-link">
              View activity →
            </Link>
          </div>

          {recentActivities.length > 0 ? (
            <div className="recent-activity-list">
              {recentActivities.map((activity: any) => (
                <div className="recent-activity-item" key={activity.id}>
                  <div className={`activity-item-icon ${activity.type}`}>
                    {activity.icon}
                  </div>
                  <div className="recent-activity-content">
                    <strong>{activity.title}</strong>
                    <span>{activity.description}</span>
                  </div>
                  <time>{activity.time}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state" style={{ padding: "26px 15px" }}>
              <span style={{ fontSize: "28px", marginBottom: "6px" }}>⚡</span>
              <strong style={{ fontSize: "14px", color: "#1f2937" }}>
                No recent activity
              </strong>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0" }}>
                Your completed lessons, enrollments, and quiz results will stream here.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ================================
          RECOMMENDED COURSES
      ================================= */}
      <section className="dashboard-card recommended-section">
        <div className="dashboard-card-header">
          <div>
            <span className="card-eyebrow">RECOMMENDED FOR YOU</span>
            <h2>Explore New Courses</h2>
            <p>Continue growing with courses selected for your learning journey.</p>
          </div>

          <Link to="/courses" className="view-all-link">
            Explore all →
          </Link>
        </div>

        <div className="recommended-grid">
          {recommendedCourses.map((course) => (
            <article className="recommended-course" key={course.id}>
              <div className={`recommended-course-image ${course.colorClass}`}>
                <span>{course.icon}</span>
              </div>

              <div className="recommended-course-body">
                <div className="course-rating">
                  {course.rating ? (
                    <>
                      <span>★</span>
                      <strong>{course.rating}</strong>
                    </>
                  ) : (
                    <strong>New</strong>
                  )}
                  <span>({course.students} students)</span>
                </div>

                <h3>{course.title}</h3>
                <p className="recommended-instructor">By {course.instructor}</p>

                <div className="recommended-meta">
                  <span>📚 {course.lessons}</span>
                  <span>⏱ {course.duration}</span>
                </div>

                <div className="recommended-footer">
                  <strong>{course.price}</strong>
                  <Link
                    to={`/courses/${course.id}`}
                    className="course-details-link"
                  >
                    View Course →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ================================
          FOOTER
      ================================= */}
      <footer className="dashboard-footer">
        <p>© 2026 Eduverse. All rights reserved.</p>
        <div className="dashboard-footer-links">
          <Link to="/courses">Courses</Link>
          <Link to="/discover">Discover</Link>
          <Link to="/progress">Progress</Link>
        </div>
      </footer>
    </StudentLayout>
  );
}

export default StudentDashboard;
