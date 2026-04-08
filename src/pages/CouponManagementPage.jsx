import { useEffect, useState } from "react";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import {
  createCoupon,
  getCouponUsages,
  getCoupons,
  updateCoupon,
  updateCouponStatus
} from "../services/couponService";

const initialForm = {
  code: "",
  title: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minimumOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
  perUserLimit: "",
  startsAt: "",
  expiresAt: "",
  status: "active"
};

function CouponManagementPage() {
  const [coupons, setCoupons] = useState([]);
  const [usages, setUsages] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingUsages, setLoadingUsages] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getCoupons({ status: statusFilter });
      setCoupons(response.coupons || []);
    } catch (apiError) {
      setError(apiError.message || "Failed to load coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [statusFilter]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingCouponId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = {
        ...form
      };
      const response = editingCouponId
        ? await updateCoupon(editingCouponId, payload)
        : await createCoupon(payload);

      setMessage(response.message || "Coupon saved successfully");
      resetForm();
      await loadCoupons();
    } catch (apiError) {
      setError(apiError.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCouponId(coupon.id);
    setForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || "",
      discountType: coupon.discount_type,
      discountValue: String(coupon.discount_value ?? ""),
      minimumOrderAmount: String(coupon.minimum_order_amount ?? ""),
      maxDiscountAmount: coupon.max_discount_amount ?? "",
      usageLimit: coupon.usage_limit ?? "",
      perUserLimit: coupon.per_user_limit ?? "",
      startsAt: coupon.starts_at ? coupon.starts_at.slice(0, 16) : "",
      expiresAt: coupon.expires_at ? coupon.expires_at.slice(0, 16) : "",
      status: coupon.status
    });
  };

  const handleStatusToggle = async (coupon) => {
    try {
      setError("");
      setMessage("");
      const nextStatus = coupon.status === "active" ? "inactive" : "active";
      const response = await updateCouponStatus(coupon.id, nextStatus);
      setMessage(response.message || "Coupon status updated successfully");
      await loadCoupons();
    } catch (apiError) {
      setError(apiError.message || "Failed to update coupon status");
    }
  };

  const handleLoadUsages = async (couponId) => {
    try {
      setLoadingUsages(true);
      setError("");
      const response = await getCouponUsages(couponId);
      setSelectedCouponId(couponId);
      setUsages(response.usages || []);
    } catch (apiError) {
      setError(apiError.message || "Failed to load coupon usages");
      setUsages([]);
    } finally {
      setLoadingUsages(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Promotion Desk"
        title="Coupon management"
        description="Create discount campaigns, activate or pause coupon codes, and review how frequently each coupon is being used."
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-5">
          <div>
            <p className="ui-eyebrow">Create Coupon</p>
            <h2 className="mt-3 font-display text-3xl text-ink">
              {editingCouponId ? "Update existing coupon" : "New coupon campaign"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="ui-label">Code</label>
              <input name="code" value={form.code} onChange={handleFormChange} className="ui-input" placeholder="WELCOME10" />
            </div>

            <div>
              <label className="ui-label">Title</label>
              <input name="title" value={form.title} onChange={handleFormChange} className="ui-input" placeholder="Welcome Discount" />
            </div>

            <div className="md:col-span-2">
              <label className="ui-label">Description</label>
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleFormChange}
                className="ui-input min-h-[110px] resize-none"
                placeholder="Internal description for the campaign"
              />
            </div>

            <div>
              <label className="ui-label">Discount Type</label>
              <select name="discountType" value={form.discountType} onChange={handleFormChange} className="ui-input">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="ui-label">Discount Value</label>
              <input name="discountValue" type="number" step="0.01" value={form.discountValue} onChange={handleFormChange} className="ui-input" placeholder="10" />
            </div>

            <div>
              <label className="ui-label">Minimum Order</label>
              <input
                name="minimumOrderAmount"
                type="number"
                step="0.01"
                value={form.minimumOrderAmount}
                onChange={handleFormChange}
                className="ui-input"
                placeholder="0"
              />
            </div>

            <div>
              <label className="ui-label">Max Discount</label>
              <input
                name="maxDiscountAmount"
                type="number"
                step="0.01"
                value={form.maxDiscountAmount}
                onChange={handleFormChange}
                className="ui-input"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="ui-label">Usage Limit</label>
              <input name="usageLimit" type="number" value={form.usageLimit} onChange={handleFormChange} className="ui-input" placeholder="Optional" />
            </div>

            <div>
              <label className="ui-label">Per User Limit</label>
              <input name="perUserLimit" type="number" value={form.perUserLimit} onChange={handleFormChange} className="ui-input" placeholder="Optional" />
            </div>

            <div>
              <label className="ui-label">Starts At</label>
              <input name="startsAt" type="datetime-local" value={form.startsAt} onChange={handleFormChange} className="ui-input" />
            </div>

            <div>
              <label className="ui-label">Expires At</label>
              <input name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={handleFormChange} className="ui-input" />
            </div>

            <div>
              <label className="ui-label">Status</label>
              <select name="status" value={form.status} onChange={handleFormChange} className="ui-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end gap-3">
              <Button type="submit" disabled={saving} className="flex-1 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                {saving ? "Saving..." : editingCouponId ? "Update Coupon" : "Create Coupon"}
              </Button>
              {editingCouponId ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  className="!text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="ui-eyebrow">Live Coupons</p>
              <h2 className="mt-3 font-display text-3xl text-ink">Campaign list</h2>
            </div>

            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="ui-input max-w-[180px]">
              <option value="">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>

          {loading ? <p className="text-sm text-secondary">Loading coupons...</p> : null}

          {!loading && !coupons.length ? (
            <EmptyState
              title="No coupons yet"
              description="Create the first coupon from the form and it will appear here for campaign management."
            />
          ) : null}

          {coupons.length ? (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="rounded-card bg-canvas p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-ink">{coupon.code}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${coupon.status === "active" ? "bg-[#edf8f1] text-[#1f7a47]" : "bg-[#fff0eb] text-[#a54435]"}`}>
                          {coupon.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-ink">{coupon.title}</p>
                      <p className="mt-2 text-sm leading-6 text-secondary">{coupon.description || "No campaign description"}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-secondary">
                        <span>
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}% off`
                            : `${formatCatalogPrice(coupon.discount_value)} off`}
                        </span>
                        <span>Min order {formatCatalogPrice(coupon.minimum_order_amount)}</span>
                        <span>{coupon.usage_count} uses</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="secondary" onClick={() => handleEdit(coupon)} className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                        Edit
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => handleLoadUsages(coupon.id)} className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                        Usages
                      </Button>
                      <Button type="button" onClick={() => handleStatusToggle(coupon)} className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                        {coupon.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-5">
        <div>
          <p className="ui-eyebrow">Coupon Usages</p>
          <h2 className="mt-3 font-display text-3xl text-ink">Campaign performance</h2>
        </div>

        {loadingUsages ? <p className="text-sm text-secondary">Loading coupon usages...</p> : null}

        {!loadingUsages && !selectedCouponId ? (
          <EmptyState
            title="Select a coupon"
            description="Choose a coupon from the campaign list to inspect customer usage and order impact."
          />
        ) : null}

        {!loadingUsages && selectedCouponId && !usages.length ? (
          <EmptyState
            title="No usage yet"
            description="This coupon has not been applied to any completed checkout flow yet."
          />
        ) : null}

        {usages.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr>
                  <th className="ui-table-head">Customer</th>
                  <th className="ui-table-head">Order</th>
                  <th className="ui-table-head">Discount</th>
                  <th className="ui-table-head">Order Total</th>
                  <th className="ui-table-head">Used At</th>
                </tr>
              </thead>
              <tbody>
                {usages.map((usage) => (
                  <tr key={usage.id} className="border-b border-line">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{usage.customer_name}</p>
                      <p className="text-sm text-secondary">{usage.customer_email}</p>
                    </td>
                    <td className="px-5 py-4 text-ink">{usage.order_number}</td>
                    <td className="px-5 py-4 text-ink">{formatCatalogPrice(usage.discount_amount)}</td>
                    <td className="px-5 py-4 text-ink">{formatCatalogPrice(usage.order_total)}</td>
                    <td className="px-5 py-4 text-secondary">{new Date(usage.used_at).toLocaleString()}</td>
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

export default CouponManagementPage;
