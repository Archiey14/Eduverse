import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./AdminDashboard.css";

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt?: string;
}

interface UsersResponse {
  data?: {
    users?: User[];
    items?: User[];
    docs?: User[];
    total?: number;
  };
  users?: User[];
  items?: User[];
  docs?: User[];
  total?: number;
}

const getUserId = (user: User) => user._id || user.id || "";

const getUsersFromResponse = (response: UsersResponse | User[]): User[] => {
  if (Array.isArray(response)) {
    return response;
  }

  const data = response?.data;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.docs)) return data.docs;

  if (Array.isArray(response?.users)) return response.users;
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

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.admin.getUsers({
        page: 1,
        limit: 50,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
      });

      setUsers(getUsersFromResponse(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadUsers();
  };

  const handleRoleChange = async (
    user: User,
    newRole: string
  ) => {
    const userId = getUserId(user);

    if (!userId) {
      alert("User ID is missing.");
      return;
    }

    try {
      setUpdatingId(userId);

      const currentRoles = user.roles || [];

      let newRoles: string[];

      if (newRole === "student") {
        newRoles = ["student"];
      } else if (newRole === "mentor") {
        newRoles = ["student", "mentor"];
      } else if (newRole === "admin") {
        newRoles = ["student", "admin"];
      } else {
        newRoles = currentRoles;
      }

      await api.admin.updateUser(userId, {
        roles: newRoles,
      });

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          getUserId(item) === userId
            ? { ...item, roles: newRoles }
            : item
        )
      );
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (user: User) => {
    const userId = getUserId(user);

    if (!userId) {
      alert("User ID is missing.");
      return;
    }

    try {
      setUpdatingId(userId);

      const newStatus = !user.isActive;

      await api.admin.updateUser(userId, {
        isActive: newStatus,
      });

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          getUserId(item) === userId
            ? { ...item, isActive: newStatus }
            : item
        )
      );
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const getPrimaryRole = (roles: string[]) => {
    if (roles?.includes("admin")) return "admin";
    if (roles?.includes("mentor")) return "mentor";
    return "student";
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Users</h1>
          <p>Manage platform users and their access.</p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-search-form">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="submit">Search</button>
        </form>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="mentor">Mentors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button onClick={loadUsers}>Try Again</button>
        </div>
      )}

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>All Users</h2>
          <span>{users.length} users</span>
        </div>

        {loading ? (
          <div className="admin-loading">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <h3>No users found</h3>
            <p>Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const userId = getUserId(user);
                  const primaryRole = getPrimaryRole(user.roles);

                  return (
                    <tr key={userId || user.email}>
                      <td>
                        <div className="admin-user-info">
                          <div className="admin-user-avatar">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>

                          <div>
                            <strong>{user.name}</strong>
                          </div>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <select
                          value={primaryRole}
                          disabled={updatingId === userId}
                          onChange={(event) =>
                            handleRoleChange(
                              user,
                              event.target.value
                            )
                          }
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>
                        <span
                          className={`admin-status ${
                            user.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <button
                          className={`admin-action-btn ${
                            user.isActive
                              ? "deactivate"
                              : "activate"
                          }`}
                          disabled={updatingId === userId}
                          onClick={() =>
                            handleStatusChange(user)
                          }
                        >
                          {updatingId === userId
                            ? "Updating..."
                            : user.isActive
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

export default AdminUsers;