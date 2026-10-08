import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./AdminDashboard.css";

interface TopCourse {
  _id?: string;
  title: string;
  slug?: string;
  mentor?: {
    name?: string;
  };
  category?: {
    name?: string;
  };
  stats?: {
    enrollmentCount?: number;
  };
}

interface AnalyticsStats {
  totalUsers: number;
  totalMentors: number;
  totalCourses: number;
  totalEnrollments: number;
  recentSignups7d: number;
  topCourses: TopCourse[];
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const AdminAnalytics = () => {
  const [stats, setStats] =
    useState<AnalyticsStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.admin.getStats();

      const data =
        response?.data || response;

      setStats({
        totalUsers:
          data?.totalUsers || 0,

        totalMentors:
          data?.totalMentors || 0,

        totalCourses:
          data?.totalCourses || 0,

        totalEnrollments:
          data?.totalEnrollments || 0,

        recentSignups7d:
          data?.recentSignups7d || 0,

        topCourses:
          Array.isArray(data?.topCourses)
            ? data.topCourses
            : [],
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <p>{error}</p>

          <button onClick={loadAnalytics}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-page">
        <div className="admin-empty">
          <h3>No analytics data</h3>
          <p>
            Analytics data is currently
            unavailable.
          </p>
        </div>
      </div>
    );
  }

  const mentorPercentage =
    stats.totalUsers > 0
      ? Math.round(
          (stats.totalMentors /
            stats.totalUsers) *
            100
        )
      : 0;

  const averageEnrollments =
    stats.totalCourses > 0
      ? Math.round(
          stats.totalEnrollments /
            stats.totalCourses
        )
      : 0;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Analytics</h1>

          <p>
            Monitor platform growth and
            engagement.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadAnalytics}
        >
          Refresh
        </button>
      </div>

      {/* Main statistics */}
      <div
        className="admin-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div className="admin-stat-card">
          <span>Total Users</span>

          <h2>
            {stats.totalUsers.toLocaleString()}
          </h2>

          <p>
            Registered platform users
          </p>
        </div>

        <div className="admin-stat-card">
          <span>Total Mentors</span>

          <h2>
            {stats.totalMentors.toLocaleString()}
          </h2>

          <p>
            {mentorPercentage}% of users
          </p>
        </div>

        <div className="admin-stat-card">
          <span>Total Courses</span>

          <h2>
            {stats.totalCourses.toLocaleString()}
          </h2>

          <p>
            Courses on the platform
          </p>
        </div>

        <div className="admin-stat-card">
          <span>Total Enrollments</span>

          <h2>
            {stats.totalEnrollments.toLocaleString()}
          </h2>

          <p>
            {averageEnrollments} average per
            course
          </p>
        </div>
      </div>

      {/* Recent signups */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <h2>Recent Growth</h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              New users who joined during the
              last 7 days.
            </p>
          </div>

          <strong
            style={{
              fontSize: "24px",
            }}
          >
            +{stats.recentSignups7d}
          </strong>
        </div>

        <div
          style={{
            padding: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "12px",
                background: "#e5e7eb",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    stats.recentSignups7d *
                      10,
                    100
                  )}%`,
                  height: "100%",
                  background:
                    "currentColor",
                  borderRadius: "10px",
                }}
              />
            </div>

            <span>
              Last 7 days
            </span>
          </div>
        </div>
      </div>

      {/* Top courses */}
      <div
        className="admin-table-card"
        style={{
          marginTop: "25px",
        }}
      >
        <div className="admin-table-header">
          <div>
            <h2>Top Courses</h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Most enrolled published courses.
            </p>
          </div>
        </div>

        {stats.topCourses.length === 0 ? (
          <div className="admin-empty">
            <h3>No published courses</h3>

            <p>
              There are no top course records
              available yet.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course</th>
                  <th>Mentor</th>
                  <th>Category</th>
                  <th>Enrollments</th>
                </tr>
              </thead>

              <tbody>
                {stats.topCourses.map(
                  (course, index) => (
                    <tr
                      key={
                        course._id ||
                        course.slug ||
                        course.title
                      }
                    >
                      <td>
                        <strong>
                          {index + 1}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {course.title}
                        </strong>
                      </td>

                      <td>
                        {course.mentor?.name ||
                          "Unknown"}
                      </td>

                      <td>
                        {course.category?.name ||
                          "Uncategorized"}
                      </td>

                      <td>
                        <strong>
                          {(
                            course.stats
                              ?.enrollmentCount ||
                            0
                          ).toLocaleString()}
                        </strong>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;