import { useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Power, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import IconActionButton from "../components/common/IconActionButton";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import {
  deleteCoupon,
  getCoupons,
  updateCoupon,
  updateCouponStatus
} from "../services/couponService";

function CouponManagementPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
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
    void loadCoupons();
  }, [statusFilter]);

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

  const handleBannerToggle = async (coupon) => {
    try {
      setError("");
      setMessage("");
      const response = await updateCoupon(coupon.id, {
        showInBanner: !coupon.show_in_banner,
        bannerText: coupon.banner_text || coupon.title,
        displayPriority: coupon.display_priority || 0
      });
      setMessage(response.message || "Coupon banner visibility updated successfully");
      await loadCoupons();
    } catch (apiError) {
      setError(apiError.message || "Failed to update coupon banner visibility");
    }
  };

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(`Delete coupon ${coupon.code}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      const response = await deleteCoupon(coupon.id);
      setMessage(response.message || "Coupon deleted successfully");
      await loadCoupons();
    } catch (apiError) {
      setError(apiError.message || "Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Promotion Desk"
        title="Coupon management"
        description="Manage campaigns in a cleaner table view and open create or edit forms on a separate page."
        actions={
          <Link to="/admin/coupons/create">
            <Button>+ Add Coupon</Button>
          </Link>
        }
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ui-eyebrow">Campaign List</p>
            <h2 className="mt-3 font-display text-3xl text-ink">Coupons table</h2>
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
            description="Click Add Coupon to open the form page and create your first campaign."
          />
        ) : null}

        {coupons.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr>
                  <th className="ui-table-head">Code</th>
                  <th className="ui-table-head">Title</th>
                  <th className="ui-table-head">Discount</th>
                  <th className="ui-table-head">Min Order</th>
                  <th className="ui-table-head">Status</th>
                  <th className="ui-table-head">Banner</th>
                  <th className="ui-table-head">Usage</th>
                  <th className="ui-table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-line align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink">{coupon.code}</p>
                      <p className="mt-1 text-xs text-secondary">#{coupon.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{coupon.title}</p>
                      <p className="mt-1 max-w-[260px] truncate text-xs text-secondary">
                        {coupon.description || "No description"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-ink">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : formatCatalogPrice(coupon.discount_value)}
                    </td>
                    <td className="px-5 py-4 text-ink">{formatCatalogPrice(coupon.minimum_order_amount)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          coupon.status === "active" ? "bg-[#edf8f1] text-[#1f7a47]" : "bg-[#fff0eb] text-[#a54435]"
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          coupon.show_in_banner ? "bg-[#eef3ff] text-[#3349a8]" : "bg-[#f5f6f8] text-[#667085]"
                        }`}
                      >
                        {coupon.show_in_banner ? "On" : "Off"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink">{coupon.usage_count} uses</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <IconActionButton
                          icon={Pencil}
                          label="Edit coupon"
                          variant="secondary"
                          onClick={() => navigate(`/admin/coupons/${coupon.id}/edit`)}
                        />
                        <IconActionButton
                          icon={coupon.show_in_banner ? Eye : EyeOff}
                          label={coupon.show_in_banner ? "Hide banner" : "Show banner"}
                          variant="secondary"
                          onClick={() => handleBannerToggle(coupon)}
                        />
                        <IconActionButton
                          icon={Power}
                          label={coupon.status === "active" ? "Deactivate coupon" : "Activate coupon"}
                          onClick={() => handleStatusToggle(coupon)}
                        />
                        <IconActionButton
                          icon={Trash2}
                          label="Delete coupon"
                          onClick={() => handleDelete(coupon)}
                          className="!border-danger/30 !text-danger hover:!bg-danger/5"
                        />
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

export default CouponManagementPage;
