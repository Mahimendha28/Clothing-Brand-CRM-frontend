import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import { getCustomerReport, getSalesReport } from "../services/reportService";
import { getStoredUser } from "../utils/auth";

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
          setError(apiError.message || "Failed to load sales dashboard data");
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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sales Dashboard"
        title="Revenue and customer momentum"
        description="Track revenue quality, average order value, repeat customers, and coupon performance from the same reporting workspace."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link to="/customers">
              <Button
                variant="secondary"
                className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                CRM Customers
              </Button>
            </Link>
            {user?.role === "admin" || user?.role === "marketing_manager" ? (
              <Link to="/admin/coupons">
                <Button className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                  Coupons
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? <p className="text-sm text-secondary">Loading sales dashboard...</p> : null}

      {!loading && !salesReport ? (
        <EmptyState
          title="Sales dashboard unavailable"
          description="Revenue and customer metrics will appear here once the reporting endpoints respond."
        />
      ) : null}

      {salesReport ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total Revenue"
              value={formatCatalogPrice(summary.total_revenue)}
              note="Revenue from non-cancelled orders"
            />
            <MetricCard
              label="Average Order"
              value={formatCatalogPrice(summary.average_order_value)}
              note={`${summary.total_orders || 0} total fulfilled or active orders`}
            />
            <MetricCard
              label="Paid Orders"
              value={String(summary.paid_orders || 0)}
              note="Orders fully verified through the demo payment flow"
            />
            <MetricCard
              label="Repeat Buyers"
              value={String(customerSummary.repeat_buyers || 0)}
              note={`${customerSummary.total_customers || 0} customers currently tracked`}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <SurfaceCard className="space-y-5">
              <div>
                <p className="ui-eyebrow">Top Buyers</p>
                <h2 className="mt-3 font-display text-3xl text-ink">High-value customers</h2>
              </div>

              {topBuyers.length ? (
                <div className="space-y-4">
                  {topBuyers.map((buyer) => (
                    <div key={buyer.id} className="rounded-card bg-canvas p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-ink">{buyer.name}</p>
                          <p className="text-sm text-secondary">{buyer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-ink">{formatCatalogPrice(buyer.total_spent)}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">{buyer.order_count} orders</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No top buyers yet"
                  description="Top customers will appear here once orders accumulate."
                />
              )}
            </SurfaceCard>

            <SurfaceCard className="space-y-5">
              <div>
                <p className="ui-eyebrow">Customer Activity</p>
                <h2 className="mt-3 font-display text-3xl text-ink">Recent signups</h2>
              </div>

              {recentSignups.length ? (
                <div className="space-y-4">
                  {recentSignups.map((customer) => (
                    <div key={customer.id} className="rounded-card bg-canvas p-4">
                      <p className="font-medium text-ink">{customer.name}</p>
                      <p className="mt-1 text-sm text-secondary">{customer.email}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                        Joined {new Date(customer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No recent signups"
                  description="Recent customer signups will appear here after new registrations."
                />
              )}
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-5">
            <div>
              <p className="ui-eyebrow">Coupon Performance</p>
              <h2 className="mt-3 font-display text-3xl text-ink">Discount impact</h2>
            </div>

            {couponPerformance.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr>
                      <th className="ui-table-head">Coupon</th>
                      <th className="ui-table-head">Title</th>
                      <th className="ui-table-head">Usage Count</th>
                      <th className="ui-table-head">Discount Given</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponPerformance.map((coupon) => (
                      <tr key={coupon.id} className="border-b border-line">
                        <td className="px-5 py-4 text-ink">{coupon.code}</td>
                        <td className="px-5 py-4 text-secondary">{coupon.title}</td>
                        <td className="px-5 py-4 text-ink">{coupon.usage_count}</td>
                        <td className="px-5 py-4 text-ink">{formatCatalogPrice(coupon.discount_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No coupon usage yet"
                description="Coupon performance will appear here after customers start applying coupon codes."
              />
            )}
          </SurfaceCard>
        </>
      ) : null}
    </div>
  );
}

export default SalesDashboard;
