import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./AdminDashboard.css";

interface Mentor {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt?: string;
  mentorProfile?: {
    headline?: string;
    bio?: string;
    expertise?: string[];
  };
}

interface MentorsResponse {
  data?: {
    users?: Mentor[];
    items?: Mentor[];
    docs?: Mentor[];
  };
  users?: Mentor[];
  items?: Mentor[];
  docs?: Mentor[];
}

const getMentorId = (mentor: Mentor) => {
  return mentor._id || mentor.id || "";
};

const getMentorsFromResponse = (
  response: MentorsResponse | Mentor[]
): Mentor[] => {
  if (Array.isArray(response)) {
    return response;
  }

  const data = response?.data;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.docs)) {
    return data.docs;
  }

  if (Array.isArray(response?.users)) {
    return response.users;
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

const AdminMentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadMentors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.admin.getUsers({
        page: 1,
        limit: 100,
        role: "mentor",
        ...(search.trim()
          ? { search: search.trim() }
          : {}),
      });

      setMentors(
        getMentorsFromResponse(response)
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentors();
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadMentors();
  };

  const handleStatusChange = async (
    mentor: Mentor
  ) => {
    const mentorId = getMentorId(mentor);

    if (!mentorId) {
      alert("Mentor ID is missing.");
      return;
    }

    try {
      setUpdatingId(mentorId);

      const newStatus = !mentor.isActive;

      await api.admin.updateUser(mentorId, {
        isActive: newStatus,
      });

      setMentors((currentMentors) =>
        currentMentors.map((item) =>
          getMentorId(item) === mentorId
            ? {
                ...item,
                isActive: newStatus,
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
          <h1>Mentors</h1>

          <p>
            Manage mentors and their platform
            profiles.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadMentors}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Search */}
      <div className="admin-filters">
        <form
          onSubmit={handleSearch}
          className="admin-search-form"
        >
          <input
            type="text"
            placeholder="Search mentors by name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <button type="submit">
            Search
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="admin-error">
          <p>{error}</p>

          <button onClick={loadMentors}>
            Try Again
          </button>
        </div>
      )}

      {/* Mentor table */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>All Mentors</h2>

          <span>
            {mentors.length} mentors
          </span>
        </div>

        {loading ? (
          <div className="admin-loading">
            Loading mentors...
          </div>
        ) : mentors.length === 0 ? (
          <div className="admin-empty">
            <h3>No mentors found</h3>

            <p>
              There are currently no mentors
              matching your search.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Email</th>
                  <th>Headline</th>
                  <th>Expertise</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {mentors.map((mentor) => {
                  const mentorId =
                    getMentorId(mentor);

                  const expertise =
                    mentor.mentorProfile
                      ?.expertise || [];

                  return (
                    <tr
                      key={
                        mentorId ||
                        mentor.email
                      }
                    >
                      <td>
                        <div className="admin-user-info">
                          <div className="admin-user-avatar">
                            {mentor.name
                              ?.charAt(0)
                              .toUpperCase() || "M"}
                          </div>

                          <strong>
                            {mentor.name}
                          </strong>
                        </div>
                      </td>

                      <td>{mentor.email}</td>

                      <td>
                        {mentor.mentorProfile
                          ?.headline || "-"}
                      </td>

                      <td>
                        {expertise.length > 0
                          ? expertise.join(", ")
                          : "-"}
                      </td>

                      <td>
                        <span
                          className={`admin-status ${
                            mentor.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {mentor.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {mentor.createdAt
                          ? new Date(
                              mentor.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <button
                          className={`admin-action-btn ${
                            mentor.isActive
                              ? "deactivate"
                              : "activate"
                          }`}
                          disabled={
                            updatingId ===
                            mentorId
                          }
                          onClick={() =>
                            handleStatusChange(
                              mentor
                            )
                          }
                        >
                          {updatingId === mentorId
                            ? "Updating..."
                            : mentor.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
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

export default AdminMentors;