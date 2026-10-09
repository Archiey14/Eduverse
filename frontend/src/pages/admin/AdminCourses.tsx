import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./AdminDashboard.css";

interface Course {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  status: "draft" | "published" | "archived";
  mentor?: {
    name?: string;
    email?: string;
  };
  category?: {
    name?: string;
    slug?: string;
  };
  createdAt?: string;
}

interface CoursesResponse {
  data?: {
    courses?: Course[];
    items?: Course[];
    docs?: Course[];
  };
  courses?: Course[];
  items?: Course[];
  docs?: Course[];
}

const getCourseId = (course: Course) => {
  return course._id || course.id || "";
};

const getCoursesFromResponse = (
  response: CoursesResponse | Course[]
): Course[] => {
  if (Array.isArray(response)) {
    return response;
  }

  const data = response?.data;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.courses)) return data.courses;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.docs)) return data.docs;

  if (Array.isArray(response?.courses)) return response.courses;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.docs)) return response.docs;

  return [];
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.admin.getCourses({
        page: 1,
        limit: 50,
        ...(search.trim()
          ? { search: search.trim() }
          : {}),
        ...(statusFilter
          ? { status: statusFilter }
          : {}),
      });

      setCourses(getCoursesFromResponse(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [statusFilter]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadCourses();
  };

  const handleStatusChange = async (
    course: Course,
    newStatus: "draft" | "published" | "archived"
  ) => {
    const courseId = getCourseId(course);

    if (!courseId) {
      alert("Course ID is missing.");
      return;
    }

    try {
      setUpdatingId(courseId);

      await api.admin.updateCourseStatus(
        courseId,
        newStatus
      );

      setCourses((currentCourses) =>
        currentCourses.map((item) =>
          getCourseId(item) === courseId
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Courses</h1>
          <p>
            Manage courses published on the platform.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadCourses}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <form
          onSubmit={handleSearch}
          className="admin-search-form"
        >
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <button type="submit">
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="">
            All Statuses
          </option>

          <option value="draft">
            Draft
          </option>

          <option value="published">
            Published
          </option>

          <option value="archived">
            Archived
          </option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="admin-error">
          <p>{error}</p>

          <button onClick={loadCourses}>
            Try Again
          </button>
        </div>
      )}

      {/* Courses table */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>All Courses</h2>

          <span>
            {courses.length} courses
          </span>
        </div>

        {loading ? (
          <div className="admin-loading">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="admin-empty">
            <h3>No courses found</h3>

            <p>
              Try changing your search or status
              filter.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Mentor</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => {
                  const courseId =
                    getCourseId(course);

                  return (
                    <tr
                      key={
                        courseId ||
                        course.title
                      }
                    >
                      <td>
                        <strong>
                          {course.title}
                        </strong>

                        {course.slug && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "4px",
                            }}
                          >
                            {course.slug}
                          </div>
                        )}
                      </td>

                      <td>
                        {course.mentor?.name ||
                          "Unknown"}

                        {course.mentor?.email && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "4px",
                            }}
                          >
                            {course.mentor.email}
                          </div>
                        )}
                      </td>

                      <td>
                        {course.category?.name ||
                          "Uncategorized"}
                      </td>

                      <td>
                        <select
                          value={course.status}
                          disabled={
                            updatingId ===
                            courseId
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              course,
                              event.target
                                .value as
                                | "draft"
                                | "published"
                                | "archived"
                            )
                          }
                        >
                          <option value="draft">
                            Draft
                          </option>

                          <option value="published">
                            Published
                          </option>

                          <option value="archived">
                            Archived
                          </option>
                        </select>
                      </td>

                      <td>
                        {course.createdAt
                          ? new Date(
                              course.createdAt
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

export default AdminCourses;