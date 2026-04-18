import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { createCoupon, getCouponById, updateCoupon } from "../services/couponService";

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
  status: "active",
  showInBanner: false,
  bannerText: "",
  displayPriority: 0
};

function CouponFormPage() {
  const navigate = useNavigate();
  const { couponId } = useParams();
  const isEditMode = Boolean(couponId);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let ignore = false;

    const loadCoupon = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getCouponById(couponId);

        if (!ignore) {
          const coupon = response.coupon;
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
            status: coupon.status,
            showInBanner: Boolean(coupon.show_in_banner),
            bannerText: coupon.banner_text || "",
            displayPriority: coupon.display_priority ?? 0
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load coupon");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadCoupon();

    return () => {
      ignore = true;
    };
  }, [couponId, isEditMode]);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      const payload = { ...form };

      if (isEditMode) {
        await updateCoupon(couponId, payload);
      } else {
        await createCoupon(payload);
      }

      navigate("/admin/coupons");
    } catch (apiError) {
      setError(apiError.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading coupon form...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Promotion Desk"
        title={isEditMode ? "Edit coupon campaign" : "Create coupon campaign"}
        description="Configure coupon details, banner visibility, and lifecycle settings in a dedicated form page."
        actions={
          <Link to="/admin/coupons">
            <Button variant="secondary">Back to coupon list</Button>
          </Link>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-5">
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

          <div className="md:col-span-2">
            <label className="ui-label flex items-center gap-3">
              <input
                type="checkbox"
                name="showInBanner"
                checked={Boolean(form.showInBanner)}
                onChange={handleFormChange}
                className="h-4 w-4"
              />
              <span>Show this coupon in public promo banner</span>
            </label>
          </div>

          <div>
            <label className="ui-label">Banner Text</label>
            <input
              name="bannerText"
              value={form.bannerText}
              onChange={handleFormChange}
              className="ui-input"
              placeholder="Use WELCOME10 and get 10% off"
            />
          </div>

          <div>
            <label className="ui-label">Banner Priority</label>
            <input
              name="displayPriority"
              type="number"
              value={form.displayPriority}
              onChange={handleFormChange}
              className="ui-input"
              placeholder="0"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEditMode ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}

export default CouponFormPage;
