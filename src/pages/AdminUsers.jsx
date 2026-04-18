import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { deleteAdminUser, getUsers, updateAdminUserStatus } from "../services/authService";
import { getStoredUser } from "../utils/auth";

function AdminUsers() {
  const currentUser = getStoredUser();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async (activeFilters = filters) => {
    try {
      setLoading(true);
      const response = await getUsers(activeFilters);
      setUsers(response.users);
    } catch (apiError) {
      setError(apiError.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const nextFilters = {
      ...filters,
      [name]: value
    };

    setFilters(nextFilters);
    loadUsers(nextFilters);
  };

  const handleStatusToggle = async (user) => {
    try {
      setError("");
      setMessage("");
      const nextStatus = user.status === "active" ? "inactive" : "active";
      await updateAdminUserStatus(user.id, nextStatus);
      setMessage(`User status updated to ${nextStatus}`);
      loadUsers();
    } catch (apiError) {
      setError(apiError.message || "Failed to update user status");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await deleteAdminUser(user.id);
      setMessage("User deleted successfully");
      loadUsers();
    } catch (apiError) {
      setError(apiError.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin User Management"
        title="User list"
        description="View all users, filter by role or status, and move into create or edit flows with the same shared admin styling."
        actions={
          <Link to="/admin/users/create">
            <Button>Create User</Button>
          </Link>
        }
      />

      <SurfaceCard className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <select name="role" value={filters.role} onChange={handleFilterChange} className="ui-input">
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="sales_executive">Sales Executive</option>
            <option value="inventory_manager">Inventory Manager</option>
            <option value="marketing_manager">Marketing Manager</option>
            <option value="fulfillment_executive">Fulfillment Executive</option>
            <option value="admin">Admin</option>
          </select>

          <select name="status" value={filters.status} onChange={handleFilterChange} className="ui-input">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <StatusBanner tone="success">{message}</StatusBanner>
        <StatusBanner tone="danger">{error}</StatusBanner>

        {loading ? <p className="text-sm text-secondary">Loading users...</p> : null}

        {!loading && users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try adjusting the filters or create a new user from the action above."
          />
        ) : null}

        {users.length > 0 ? (
          <div className="space-y-4 md:hidden">
            {users.map((user) => {
              const isCurrentUser = Number(currentUser?.id) === Number(user.id);

              return (
                <article key={user.id} className="rounded-card border border-line bg-page p-4">
                  <p className="text-base font-semibold text-ink">{user.name}</p>
                  <p className="mt-1 break-all text-sm text-secondary">{user.email}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{user.role}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        user.status === "active"
                          ? "bg-success/15 text-success"
                          : "bg-danger/15 text-danger"
                      }`}
                    >
                      {user.status}
                    </span>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link to={`/admin/users/${user.id}/edit`}>
                        <Button variant="secondary">Edit</Button>
                      </Link>
                      <Button type="button" variant="outline" onClick={() => handleStatusToggle(user)}>
                        {user.status === "active" ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isCurrentUser}
                        onClick={() => handleDelete(user)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {users.length > 0 ? (
          <div className="hidden overflow-x-auto md:block">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          user.status === "active"
                            ? "bg-success/15 text-success"
                            : "bg-danger/15 text-danger"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-3">
                        <Link to={`/admin/users/${user.id}/edit`}>
                          <Button variant="secondary">Edit</Button>
                        </Link>
                        <Button type="button" variant="outline" onClick={() => handleStatusToggle(user)}>
                          {user.status === "active" ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={Number(currentUser?.id) === Number(user.id)}
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default AdminUsers;
