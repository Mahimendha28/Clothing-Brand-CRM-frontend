import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PasswordToggleButton from "../components/PasswordToggleButton";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { getStoredUser, updateStoredUser } from "../utils/auth";
import { changePassword, getUserProfile, updateUserProfile } from "../services/authService";

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
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

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

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName]
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

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password must match.");
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordMessage(response.message || "Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (apiError) {
      setPasswordError(apiError.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
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

      <SurfaceCard>
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-ink">Change password</h2>
            <p className="mt-1 text-sm text-secondary">
              Update your password securely from the same dashboard profile screen.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="relative">
              <label className="ui-label" htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.currentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="ui-input pr-12"
                autoComplete="current-password"
                required
              />
              <PasswordToggleButton
                visible={showPasswords.currentPassword}
                onClick={() => togglePasswordVisibility("currentPassword")}
                className="absolute right-3 top-[38px] h-8 w-8 border-0 bg-transparent text-secondary hover:text-ink"
              />
            </div>

            <div className="relative">
              <label className="ui-label" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.newPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="ui-input pr-12"
                autoComplete="new-password"
                required
              />
              <PasswordToggleButton
                visible={showPasswords.newPassword}
                onClick={() => togglePasswordVisibility("newPassword")}
                className="absolute right-3 top-[38px] h-8 w-8 border-0 bg-transparent text-secondary hover:text-ink"
              />
            </div>
          </div>

          <div className="relative md:max-w-[50%]">
            <label className="ui-label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirmPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="ui-input pr-12"
              autoComplete="new-password"
              required
            />
            <PasswordToggleButton
              visible={showPasswords.confirmPassword}
              onClick={() => togglePasswordVisibility("confirmPassword")}
              className="absolute right-3 top-[38px] h-8 w-8 border-0 bg-transparent text-secondary hover:text-ink"
            />
          </div>

          <StatusBanner tone="success">{passwordMessage}</StatusBanner>
          <StatusBanner tone="danger">{passwordError}</StatusBanner>

          <Button type="submit" disabled={passwordSaving}>
            {passwordSaving ? "Updating Password..." : "Change Password"}
          </Button>
        </form>
      </SurfaceCard>
    </div>
  );
}

export default Profile;
