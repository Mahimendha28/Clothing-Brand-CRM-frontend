import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { getStoredUser, updateStoredUser } from "../utils/auth";
import { getUserProfile, updateUserProfile } from "../services/authService";

function Profile() {
  const { userId } = useParams();
  const loggedInUser = getStoredUser();
  const targetUserId = userId || loggedInUser?.id;
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getUserProfile(targetUserId);
        setFormData({
          name: response.user.name,
          email: response.user.email
        });
        setUserRole(response.user.role);
      } catch (apiError) {
        setError(apiError.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [targetUserId]);

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
    setMessage("");

    try {
      const response = await updateUserProfile(targetUserId, formData);
      setFormData({
        name: response.user.name,
        email: response.user.email
      });
      setUserRole(response.user.role);

      if (Number(loggedInUser?.id) === Number(targetUserId)) {
        updateStoredUser(response.user);
      }

      setMessage("Profile updated successfully");
    } catch (apiError) {
      setError(apiError.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading profile...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Profile"
        title="User profile"
        description={
          loggedInUser?.role === "admin" && userId
            ? "Admin mode lets you review and update this user's core details."
            : "Update your core account details from one shared profile screen."
        }
      />

      <SurfaceCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Name" name="name" value={formData.name} onChange={handleChange} />
            <FormField label="Email" name="email" value={formData.email} onChange={handleChange} />
          </div>

          <FormField label="Role" value={userRole} readOnly />

          <StatusBanner tone="success">{message}</StatusBanner>
          <StatusBanner tone="danger">{error}</StatusBanner>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </SurfaceCard>
    </div>
  );
}

export default Profile;
