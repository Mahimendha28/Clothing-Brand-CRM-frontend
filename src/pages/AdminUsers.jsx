import { useEffect, useMemo, useState } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import CursorPagination from "../components/common/CursorPagination";
import CustomerTableToolbar from "../components/common/CustomerTableToolbar";
import EmptyState from "../components/common/EmptyState";
import IconActionButton from "../components/common/IconActionButton";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { deleteAdminUser, getUsers, updateAdminUserStatus } from "../services/authService";
import { getStoredUser } from "../utils/auth";

const PAGE_SIZE = 8;

function AdminUsers() {
  const currentUser = getStoredUser();
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getUsers();
      setUsers(response.users || []);
    } catch (apiError) {
      setError(apiError.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search);

      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchValue, statusFilter, users]);

  const paginatedUsers = useMemo(
    () => filteredUsers.slice(cursor, cursor + PAGE_SIZE),
    [cursor, filteredUsers]
  );

  useEffect(() => {
    setCursor(0);
  }, [searchValue, roleFilter, statusFilter]);

  useEffect(() => {
    if (cursor >= filteredUsers.length && cursor !== 0) {
      setCursor(Math.max(0, filteredUsers.length - PAGE_SIZE));
    }
  }, [cursor, filteredUsers.length]);

  const handleStatusToggle = async (user) => {
    try {
      setError("");
      setMessage("");
      const nextStatus = user.status === "active" ? "inactive" : "active";
      await updateAdminUserStatus(user.id, nextStatus);
      setMessage(`User status updated to ${nextStatus}`);
      await loadUsers();
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
      await loadUsers();
    } catch (apiError) {
      setError(apiError.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin User Management"
        title="User list"
        description="Search, filter, and manage users in one clean table without losing the existing flows."
        actions={
          <Link to="/admin/users/create">
            <Button className="ui-compact-button !min-w-[128px]">Create User</Button>
          </Link>
        }
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-5 !p-5">
        <CustomerTableToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search by name, email, or role"
          totalItems={users.length}
          visibleItems={filteredUsers.length}
          itemLabel="users"
          filters={[
            {
              key: "role",
              label: "Role",
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { value: "", label: "All roles" },
                { value: "customer", label: "Customer" },
                { value: "sales_executive", label: "Sales Executive" },
                { value: "inventory_manager", label: "Inventory Manager" },
                { value: "marketing_manager", label: "Marketing Manager" },
                { value: "fulfillment_executive", label: "Fulfillment Executive" },
                { value: "admin", label: "Admin" }
              ]
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]
            }
          ]}
        />

        {loading ? <p className="text-sm text-secondary">Loading users...</p> : null}

        {!loading && !filteredUsers.length ? (
          <EmptyState
            title="No users found"
            description="Try a different search term or clear the active filters."
          />
        ) : null}

        {filteredUsers.length ? (
          <>
            <div className="overflow-x-auto rounded-[18px] border border-line">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-page">
                  <tr>
                    <th className="ui-table-head">Name</th>
                    <th className="ui-table-head">Email</th>
                    <th className="ui-table-head">Role</th>
                    <th className="ui-table-head">Status</th>
                    <th className="ui-table-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-line last:border-b-0">
                      <td className="ui-table-cell font-medium text-ink">{user.name}</td>
                      <td className="ui-table-cell text-secondary">{user.email}</td>
                      <td className="ui-table-cell text-ink">{user.role}</td>
                      <td className="ui-table-cell">
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
                      <td className="ui-table-cell">
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/admin/users/${user.id}/edit`}>
                            <IconActionButton icon={Pencil} label="Edit user" variant="secondary" />
                          </Link>
                          <IconActionButton
                            icon={Power}
                            label={user.status === "active" ? "Disable user" : "Enable user"}
                            onClick={() => handleStatusToggle(user)}
                          />
                          <IconActionButton
                            icon={Trash2}
                            label="Delete user"
                            disabled={Number(currentUser?.id) === Number(user.id)}
                            onClick={() => handleDelete(user)}
                            className="!border-danger/30 !text-danger hover:!bg-danger/5"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <CursorPagination
              cursor={cursor}
              pageSize={PAGE_SIZE}
              totalItems={filteredUsers.length}
              onPrevious={() => setCursor((current) => Math.max(0, current - PAGE_SIZE))}
              onNext={() => setCursor((current) => current + PAGE_SIZE)}
            />
          </>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default AdminUsers;
