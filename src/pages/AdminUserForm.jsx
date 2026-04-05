import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { createAdminUser, getUserProfile, updateUserProfile } from "../services/authService";

const initialState = {
  name: "",
  email: "",
  password: "",
  role: "sales_executive",
  status: "active"
};

function AdminUserForm() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(userId);
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      if (!isEditMode) {
        return;
      }

      try {
        const response = await getUserProfile(userId);
        setFormData({
          name: response.user.name,
          email: response.user.email,
          password: "",
          role: response.user.role,
          status: response.user.status
        });
      } catch (apiError) {
        setError(apiError.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [isEditMode, userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEditMode) {
        await updateUserProfile(userId, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        });
      } else {
        await createAdminUser(formData);
      }

      navigate("/admin/users");
    } catch (apiError) {
      setError(apiError.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading user...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin User Management"
        title={isEditMode ? "Edit user" : "Create user"}
        actions={
          <Link to="/admin/users">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />

      <SurfaceCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Name" name="name" value={formData.name} onChange={handleChange} />
            <FormField label="Email" name="email" value={formData.email} onChange={handleChange} />

            {!isEditMode ? (
              <FormField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            ) : null}

            <FormField
              label="Role"
              as="select"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: "customer", label: "Customer" },
                { value: "sales_executive", label: "Sales Executive" },
                { value: "inventory_manager", label: "Inventory Manager" },
                { value: "marketing_manager", label: "Marketing Manager" },
                { value: "fulfillment_executive", label: "Fulfillment Executive" },
                { value: "admin", label: "Admin" }
              ]}
            />

            <FormField
              label="Status"
              as="select"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]}
            />
          </div>

          <StatusBanner tone="danger">{error}</StatusBanner>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditMode ? "Update User" : "Create User"}
          </Button>
        </form>
      </SurfaceCard>
    </div>
  );
}

export default AdminUserForm;
