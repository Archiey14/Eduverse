import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import "./StudentDashboard.css"; // Reuse dashboard styles for simplicity

function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashRes = await api.dashboard.getStudentDashboard();
        if (dashRes.data) {
          const rawEnrolled = dashRes.data.activeEnrollments || [];
          const mapped = rawEnrolled.map((enr: any, idx: number) => ({
            id: enr.course?._id || enr._id,
            category: (enr.course?.category?.name || "Web Development").toUpperCase(),
            title: enr.course?.title || "Course",
            instructor: enr.course?.mentor?.name || "Lead Instructor",
            progress: enr.progressPercent || 0,
            icon: idx % 2 === 0 ? "💻" : "🐍",
            colorClass:
              idx % 3 === 0
                ? "course-blue"
                : idx % 3 === 1
                ? "course-purple"
                : "course-green",
          }));
          setEnrolledCourses(mapped);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <StudentLayout activeItem="courses">
      <div className="dashboard-content-inner">
        <header className="dashboard-header">
          <div>
            <h1>My Courses</h1>
            <p>Continue learning where you left off.</p>
          </div>
        </header>

        {loading ? (
          <p>Loading your courses...</p>
        ) : enrolledCourses.length > 0 ? (
          <div className="active-courses-grid">
            {enrolledCourses.map((course) => (
              <div className="active-course-card" key={course.id}>
                <div className={`active-course-icon ${course.colorClass}`}>
                  {course.icon}
                </div>
                <div className="active-course-info">
                  <span className="course-category">{course.category}</span>
                  <h4>{course.title}</h4>
                  <p>{course.instructor}</p>

                  <div className="course-progress-wrapper">
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{course.progress}%</span>
                  </div>

                  <div className="course-card-actions">
                    <Link to={`/learn/${course.id}`} className="continue-button">
                      Continue Learning →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-dashboard-state" style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "12px", border: "1px solid #eef0f4" }}>
            <span style={{ fontSize: "40px", display: "block", marginBottom: "16px" }}>📚</span>
            <h3>No enrolled courses</h3>
            <p style={{ color: "#6b7280", margin: "8px auto 20px", maxWidth: "420px" }}>
              You haven't enrolled in any courses yet. Discover our curated catalog to start learning right now.
            </p>
            <Link to="/courses" className="dashboard-primary-button" style={{ display: "inline-block" }}>
              Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default MyCourses;
