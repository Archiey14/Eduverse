import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./AdminDashboard.css";

interface Enrollment {
  _id?: string;
  id?: string;
  student?: {
    name?: string;
    email?: string;
  };
  course?: {
    title?: string;
    slug?: string;
  };
  enrolledAt?: string;
  createdAt?: string;
}

interface EnrollmentsResponse {
  data?: {
    enrollments?: Enrollment[];
    items?: Enrollment[];
    docs?: Enrollment[];
  };
  enrollments?: Enrollment[];
  items?: Enrollment[];
  docs?: Enrollment[];
}

const getEnrollmentId = (enrollment: Enrollment) => {
  return enrollment._id || enrollment.id || "";
};

const getEnrollmentsFromResponse = (
  response: EnrollmentsResponse | Enrollment[]
): Enrollment[] => {
  if (Array.isArray(response)) {
    return response;
  }

  const data = response?.data;

  if (Array.isArray(data?.enrollments)) {
    return data.enrollments;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.docs)) {
    return data.docs;
  }

  if (Array.isArray(response?.enrollments)) {
    return response.enrollments;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.docs)) {
    return response.docs;
  }

  return [];
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.admin.getEnrollments({
        page: 1,
        limit: 100,
      });

      setEnrollments(
        getEnrollmentsFromResponse(response)
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Enrollments</h1>

          <p>
            View all course enrollments across the
            platform.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadEnrollments}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <p>{error}</p>

          <button onClick={loadEnrollments}>
            Try Again
          </button>
        </div>
      )}

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>All Enrollments</h2>

          <span>
            {enrollments.length} enrollments
          </span>
        </div>

        {loading ? (
          <div className="admin-loading">
            Loading enrollments...
          </div>
        ) : enrollments.length === 0 ? (
          <div className="admin-empty">
            <h3>No enrollments found</h3>

            <p>
              There are currently no enrollment
              records.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Enrollment Date</th>
                </tr>
              </thead>

              <tbody>
                {enrollments.map((enrollment) => {
                  const enrollmentId =
                    getEnrollmentId(enrollment);

                  const enrollmentDate =
                    enrollment.enrolledAt ||
                    enrollment.createdAt;

                  return (
                    <tr
                      key={
                        enrollmentId ||
                        `${enrollment.student?.email}-${enrollment.course?.title}`
                      }
                    >
                      <td>
                        <div className="admin-user-info">
                          <div className="admin-user-avatar">
                            {enrollment.student?.name
                              ?.charAt(0)
                              .toUpperCase() || "S"}
                          </div>

                          <strong>
                            {enrollment.student?.name ||
                              "Unknown Student"}
                          </strong>
                        </div>
                      </td>

                      <td>
                        {enrollment.student?.email ||
                          "-"}
                      </td>

                      <td>
                        <strong>
                          {enrollment.course?.title ||
                            "Unknown Course"}
                        </strong>

                        {enrollment.course?.slug && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "4px",
                            }}
                          >
                            {enrollment.course.slug}
                          </div>
                        )}
                      </td>

                      <td>
                        {enrollmentDate
                          ? new Date(
                              enrollmentDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollments;