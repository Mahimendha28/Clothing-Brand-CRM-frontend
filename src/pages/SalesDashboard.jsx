import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import { getCustomerReport, getSalesReport } from "../services/reportService";
import { getStoredUser } from "../utils/auth";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value))
    : "Not available";

const CompactMetric = ({ label, value, note }) => (
  <SurfaceCard className="space-y-2.5 !p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
    <p className="text-[1.75rem] font-semibold leading-none text-ink">{value}</p>
    <p className="text-sm text-secondary">{note}</p>
  </SurfaceCard>
);

function SalesDashboard() {
  const user = getStoredUser();
  const [salesReport, setSalesReport] = useState(null);
  const [customerReport, setCustomerReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");
        const [salesResponse, customerResponse] = await Promise.all([getSalesReport(), getCustomerReport()]);

        if (!ignore) {
          setSalesReport(salesResponse);
          setCustomerReport(customerResponse);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load analytics");
          setSalesReport(null);
          setCustomerReport(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      ignore = true;
    };
  }, []);

  const summary = salesReport?.summary || {};
  const customerSummary = customerReport?.summary || {};
  const topBuyers = salesReport?.top_buyers || [];
  const couponPerformance = salesReport?.coupon_performance || [];
  const recentSignups = customerReport?.recent_signups || [];
  const isMarketingManager = user?.role === "marketing_manager";

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Analytics"
        title={isMarketingManager ? "Sales and campaign analytics" : "Sales analytics"}
        description="A compact reporting view for revenue, customers, and coupon performance. This page stays analytical so it does not repeat the overview workspace."
        actions={
          <>
            <Link to="/dashboard">
              <Button variant="secondary" className="ui-compact-button !min-w-[108px]">
                Overview
              </Button>
            </Link>
            <Link to="/customers">
              <Button className="ui-compact-button !min-w-[108px]">
                Customers
              </Button>
            </Link>
          </>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? <p className="text-sm text-secondary">Loading analytics...</p> : null}

      {!loading && !salesReport ? (
        <EmptyState
          title="Analytics unavailable"
          description="Revenue and customer analytics will appear here once the reporting endpoints respond."
        />
      ) : null}

      {salesReport ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CompactMetric
              label="Revenue"
              value={formatCatalogPrice(summary.total_revenue)}
              note="Non-cancelled order revenue."
            />
            <CompactMetric
              label="Average Order"
              value={formatCatalogPrice(summary.average_order_value)}
              note={`${summary.total_orders || 0} tracked orders.`}
            />
            <CompactMetric
              label="Paid Orders"
              value={String(summary.paid_orders || 0)}
              note="Orders marked as paid."
            />
            <CompactMetric
              label="Repeat Buyers"
              value={String(customerSummary.repeat_buyers || 0)}
              note={`${customerSummary.total_customers || 0} customers in CRM.`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="space-y-4 !p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Top Buyers</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">High-value customers</h2>
                </div>
                <Link to="/customers">
                  <Button variant="secondary" className="ui-compact-button !min-w-[108px]">
                    Open CRM
                  </Button>
                </Link>
              </div>

              {topBuyers.length ? (
                <div className="space-y-3">
                  {topBuyers.slice(0, 5).map((buyer) => (
                    <div key={buyer.id} className="rounded-[16px] border border-line bg-page px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{buyer.name}</p>
                          <p className="mt-1 truncate text-sm text-secondary">{buyer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-ink">{formatCatalogPrice(buyer.total_spent)}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
                            {buyer.order_count} orders
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No top buyers yet"
                  description="Top customer data will appear here after more orders are placed."
                />
              )}
            </SurfaceCard>

            <SurfaceCard className="space-y-4 !p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Coupon Performance</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">Discount usage</h2>
                </div>
                <Link to="/admin/coupons">
                  <Button variant="secondary" className="ui-compact-button !min-w-[108px]">
                    Coupons
                  </Button>
                </Link>
              </div>

              {couponPerformance.length ? (
                <div className="overflow-x-auto rounded-[18px] border border-line">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-page">
                      <tr>
                        <th className="ui-table-head">Coupon</th>
                        <th className="ui-table-head">Title</th>
                        <th className="ui-table-head">Usage</th>
                        <th className="ui-table-head">Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couponPerformance.map((coupon) => (
                        <tr key={coupon.id} className="border-b border-line last:border-b-0">
                          <td className="ui-table-cell font-medium">{coupon.code}</td>
                          <td className="ui-table-cell text-secondary">{coupon.title}</td>
                          <td className="ui-table-cell">{coupon.usage_count}</td>
                          <td className="ui-table-cell">{formatCatalogPrice(coupon.discount_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No coupon usage yet"
                  description="Coupon analytics will show once customers start applying codes."
                />
              )}
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-4 !p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="ui-eyebrow">Customer Activity</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Recent signups</h2>
              </div>
            </div>

            {recentSignups.length ? (
              <div className="overflow-x-auto rounded-[18px] border border-line">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-page">
                    <tr>
                      <th className="ui-table-head">Customer</th>
                      <th className="ui-table-head">Email</th>
                      <th className="ui-table-head">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSignups.slice(0, 6).map((customer) => (
                      <tr key={customer.id} className="border-b border-line last:border-b-0">
                        <td className="ui-table-cell font-medium">{customer.name}</td>
                        <td className="ui-table-cell text-secondary">{customer.email}</td>
                        <td className="ui-table-cell">{formatDate(customer.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No recent signups"
                description="New registrations will appear here when customers join."
              />
            )}
          </SurfaceCard>
        </>
      ) : null}
    </div>
  );
}

export default SalesDashboard;
