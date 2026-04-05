import { useEffect, useState } from "react";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import {
  createUserAddress,
  deleteUserAddress,
  getUserAddresses,
  updateUserAddress
} from "../services/authService";
import { getStoredUser } from "../utils/auth";

const initialFormState = {
  address_type: "home",
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false
};

function Addresses() {
  const user = getStoredUser();
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAddresses = async () => {
    try {
      const response = await getUserAddresses(user.id);
      setAddresses(response.addresses);
    } catch (apiError) {
      setError(apiError.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await updateUserAddress(editingId, formData);
        setMessage("Address updated successfully");
      } else {
        await createUserAddress(user.id, formData);
        setMessage("Address added successfully");
      }

      resetForm();
      await loadAddresses();
    } catch (apiError) {
      setError(apiError.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData({
      address_type: address.address_type || "home",
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line_1: address.address_line_1 || "",
      address_line_2: address.address_line_2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "India",
      is_default: Boolean(address.is_default)
    });
  };

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm("Do you want to delete this address?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteUserAddress(addressId);
      setMessage("Address deleted successfully");
      await loadAddresses();
    } catch (apiError) {
      setError(apiError.message || "Failed to delete address");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Addresses"
        title="Address management"
        description="Add, edit, and remove saved delivery addresses. The layout keeps forms and saved records in one easy-to-scan workspace."
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <h2 className="font-display text-4xl text-ink">{editingId ? "Edit address" : "Add address"}</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <FormField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} />
            <FormField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <FormField label="Address Line 1" name="address_line_1" value={formData.address_line_1} onChange={handleChange} />
            <FormField label="Address Line 2" name="address_line_2" value={formData.address_line_2} onChange={handleChange} />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="City" name="city" value={formData.city} onChange={handleChange} />
              <FormField label="State" name="state" value={formData.state} onChange={handleChange} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Postal Code" name="postal_code" value={formData.postal_code} onChange={handleChange} />
              <FormField label="Country" name="country" value={formData.country} onChange={handleChange} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Address Type"
                as="select"
                name="address_type"
                value={formData.address_type}
                onChange={handleChange}
                options={[
                  { value: "home", label: "Home" },
                  { value: "work", label: "Work" },
                  { value: "other", label: "Other" }
                ]}
              />
              <label className="flex items-center gap-3 rounded-[20px] border border-line bg-input px-4 py-3.5 text-sm text-ink">
                <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleChange} />
                Set as default
              </label>
            </div>

            <StatusBanner tone="success">{message}</StatusBanner>
            <StatusBanner tone="danger">{error}</StatusBanner>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Address" : "Add Address"}
              </Button>
              {editingId ? (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="font-display text-4xl text-ink">Saved addresses</h2>
          {loading ? <p className="mt-4 text-sm text-secondary">Loading addresses...</p> : null}

          <div className="mt-5 space-y-4">
            {!loading && addresses.length === 0 ? (
              <EmptyState
                title="No saved addresses"
                description="Create your first address to start managing delivery details here."
              />
            ) : null}

            {addresses.map((address) => (
              <div key={address.id} className="rounded-card bg-canvas p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-ink">{address.full_name}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent">
                        {address.address_type}
                      </span>
                      {address.is_default ? (
                        <span className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-secondary">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-secondary">
                      {address.address_line_1}
                      {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                      {`, ${address.city}, ${address.state} - ${address.postal_code}, ${address.country}`}
                    </p>
                    <p className="mt-2 text-sm text-secondary">Phone: {address.phone}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => handleEdit(address)}>
                      Edit
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleDelete(address.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default Addresses;
