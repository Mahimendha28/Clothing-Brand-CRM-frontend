import { useEffect, useRef, useState } from "react";
import { Edit3, MapPin, Phone, Star, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

const formatAddressDetails = (address) =>
  [
    address.address_line_1,
    address.address_line_2,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.postal_code, address.country].filter(Boolean).join(", ")
  ].filter(Boolean);

const buildAddressPayload = (address) => ({
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

function Addresses() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [defaultingId, setDefaultingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const formCardRef = useRef(null);
  const returnTo = location.state?.returnTo || "";
  const isFromCheckout = Boolean(location.state?.fromCheckout && returnTo);
  const compactButtonClass = "ui-compact-button !min-w-0 !px-4";

  const loadAddresses = async () => {
    try {
      const response = await getUserAddresses(user.id);
      const nextAddresses = response.addresses || [];
      setAddresses(nextAddresses);

      if (location.state?.editAddressId) {
        const addressToEdit = nextAddresses.find((address) => Number(address.id) === Number(location.state.editAddressId));

        if (addressToEdit) {
          setEditingId(addressToEdit.id);
          setFormData(buildAddressPayload(addressToEdit));
        }
      }
    } catch (apiError) {
      setError(apiError.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [location.state?.editAddressId]);

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
    setFormData(buildAddressPayload(address));
    setError("");
    setMessage("Editing address details below");
    window.requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm("Do you want to delete this address?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(addressId);

    try {
      await deleteUserAddress(addressId);
      setMessage("Address deleted successfully");
      await loadAddresses();
    } catch (apiError) {
      setError(apiError.message || "Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (address) => {
    if (address.is_default) {
      setMessage("This address is already your default address");
      setError("");
      return;
    }

    setError("");
    setMessage("");
    setDefaultingId(address.id);

    try {
      await updateUserAddress(address.id, {
        ...buildAddressPayload(address),
        is_default: true
      });
      setMessage("Default address updated successfully");
      await loadAddresses();
    } catch (apiError) {
      setError(apiError.message || "Failed to update default address");
    } finally {
      setDefaultingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Addresses"
        title="Address management"
        description="Add, edit, and remove saved delivery addresses. The layout keeps forms and saved records in one easy-to-scan workspace."
        actions={
          <Link to="/dashboard">
            <Button variant="secondary" className={compactButtonClass}>
              Dashboard
            </Button>
          </Link>
        }
      />

      {isFromCheckout ? (
        <SurfaceCard className="!p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">Managing addresses for checkout</p>
              <p className="mt-1 text-sm text-secondary">
                Add or update a delivery address, then return to checkout to continue placing the order.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={() => navigate(returnTo)} className={compactButtonClass}>
              Back to Checkout
            </Button>
          </div>
        </SurfaceCard>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="!p-5" ref={formCardRef}>
          <h2 className="text-xl font-semibold text-ink">{editingId ? "Edit address" : "Add address"}</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Save complete delivery details here. The form stays on the left, while your saved addresses remain visible on the right for quick editing.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
              <label className="flex items-center gap-3 rounded-[14px] border border-line bg-input px-4 py-3 text-sm text-ink">
                <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleChange} />
                Set as default
              </label>
            </div>

            <StatusBanner tone="success">{message}</StatusBanner>
            <StatusBanner tone="danger">{error}</StatusBanner>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={saving} className={compactButtonClass}>
                {saving ? "Saving..." : editingId ? "Update Address" : "Add Address"}
              </Button>
              {editingId ? (
                <Button type="button" variant="secondary" onClick={resetForm} className={compactButtonClass}>
                  Cancel
                </Button>
              ) : null}
              {isFromCheckout ? (
                <Button
                  type="button"
                  variant="outline"
                  className={compactButtonClass}
                  onClick={() =>
                    navigate(returnTo, {
                      state: {
                        preferredAddressId: editingId
                      }
                    })
                  }
                >
                  Return to Checkout
                </Button>
              ) : null}
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard className="!p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Saved addresses</h2>
              <p className="mt-2 text-sm leading-6 text-secondary">
                Every card shows the full delivery information with cleaner action placement for edit, default, checkout, and delete.
              </p>
            </div>
            <div className="rounded-[16px] bg-page px-4 py-3 text-sm text-secondary">
              {addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}
            </div>
          </div>
          {loading ? <p className="mt-4 text-sm text-secondary">Loading addresses...</p> : null}

          <div className="mt-4 space-y-4">
            {!loading && addresses.length === 0 ? (
              <EmptyState
                title="No saved addresses"
                description="Create your first address to start managing delivery details here."
              />
            ) : null}

            {addresses.map((address) => (
              <article key={address.id} className="rounded-[20px] border border-line bg-page p-5">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-ink">{address.full_name}</p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-accent">
                          {address.address_type}
                        </span>
                        {address.is_default ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-secondary">
                            <Star className="h-3.5 w-3.5" />
                            Default
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
                        <span className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {address.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
                      {isFromCheckout ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className={compactButtonClass}
                          onClick={() =>
                            navigate(returnTo, {
                              state: {
                                preferredAddressId: address.id
                              }
                            })
                          }
                        >
                          Use in Checkout
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="secondary"
                        className={`${compactButtonClass} gap-2`}
                        onClick={() => handleEdit(address)}
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Button>
                      {!address.is_default ? (
                        <Button
                          type="button"
                          variant="outline"
                          className={`${compactButtonClass} gap-2`}
                          onClick={() => handleSetDefault(address)}
                          disabled={defaultingId === address.id}
                        >
                          <Star className="h-4 w-4" />
                          {defaultingId === address.id ? "Updating..." : "Set Default"}
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        className={`${compactButtonClass} gap-2`}
                        onClick={() => handleDelete(address.id)}
                        disabled={deletingId === address.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === address.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[18px] border border-white/70 bg-white px-4 py-4">
                      <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        Address details
                      </p>
                      <div className="mt-3 space-y-1 text-sm leading-6 text-secondary">
                        {formatAddressDetails(address).map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-white/70 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Address summary</p>
                      <div className="mt-3 space-y-3 text-sm text-secondary">
                        <div className="flex items-center justify-between gap-3">
                          <span>Type</span>
                          <span className="font-medium text-ink capitalize">{address.address_type}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Country</span>
                          <span className="font-medium text-ink">{address.country}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Postal Code</span>
                          <span className="font-medium text-ink">{address.postal_code}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Status</span>
                          <span className="font-medium text-ink">{address.is_default ? "Default address" : "Saved address"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default Addresses;
