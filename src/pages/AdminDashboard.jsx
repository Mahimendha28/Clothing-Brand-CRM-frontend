import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import { getDashboardReport } from "../services/reportService";

function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDashboardReport();

        if (!ignore) {
          setReport(response);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load the admin dashboard");
          setReport(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      ignore = true;
    };
  }, []);

  const summary = report?.summary || {};
  const monthlySales = report?.monthly_sales || [];
  const categorySales = report?.category_sales || [];
  const recentOrders = report?.recent_orders || [];
  const maxRevenue = monthlySales.reduce((highest, entry) => Math.max(highest, Number(entry.revenue || 0)), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Atelier Overview"
        description="Track revenue, customer growth, fulfillment pressure, and stock health from live operational data instead of static placeholders."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/coupons">
              <Button
                variant="secondary"
                className="!rounded-[10px] !bg-white !px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                Manage Coupons
              </Button>
            </Link>
            <Link to="/dashboard/sales">
              <Button className="!rounded-[10px] !bg-[#6D6C6A] !px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                Sales Dashboard
              </Button>
            </Link>
            <Link to="/dashboard/inventory">
              <Button className="!rounded-[10px] !px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                Inventory Dashboard
              </Button>
            </Link>
          </div>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? <p className="text-sm text-secondary">Loading dashboard report...</p> : null}

      {!loading && !report ? (
        <EmptyState
          title="Dashboard unavailable"
          description="Admin metrics will appear here once the report API responds with live data."
        />
      ) : null}

      {report ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total Revenue"
              value={formatCatalogPrice(summary.total_revenue)}
              note={`${summary.revenue_growth >= 0 ? "+" : ""}${summary.revenue_growth || 0}% vs previous 30 days`}
            />
            <MetricCard
              label="New Customers"
              value={String(summary.new_customers || 0)}
              note={`${summary.total_customers || 0} total customer records in the store`}
            />
            <MetricCard
              label="Pending Orders"
              value={String(summary.pending_orders || 0)}
              note={`${summary.total_orders || 0} total orders currently in the system`}
            />
            <MetricCard
              label="Inventory Health"
              value={`${summary.inventory_health || 0}%`}
              note={`${summary.low_stock_count || 0} active variants are currently low on stock`}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
            <SurfaceCard className="space-y-6 bg-[#f2ede4]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Sales Trend</p>
                  <h2 className="mt-3 font-display text-3xl text-ink">Monthly sales revenue</h2>
                </div>
                <p className="text-sm text-secondary">Last {monthlySales.length} months</p>
              </div>

              {monthlySales.length ? (
                <div className="grid grid-cols-7 items-end gap-4 pt-8">
                  {monthlySales.map((entry) => {
                    const height = maxRevenue ? Math.max(18, Math.round((Number(entry.revenue || 0) / maxRevenue) * 200)) : 18;

                    return (
                      <div key={entry.month_key} className="flex flex-col items-center gap-3">
                        <div className="flex h-[220px] items-end">
                          <div className="w-10 rounded-t-[18px] bg-[#6d6c6a]" style={{ height }}></div>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">{entry.month_label.slice(0, 3)}</p>
                        <p className="text-xs text-secondary">{formatCatalogPrice(entry.revenue)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No revenue trend yet"
                  description="Monthly sales bars will appear here after orders start accumulating."
                />
              )}
            </SurfaceCard>

            <SurfaceCard className="space-y-6 bg-[#f2ede4]">
              <div>
                <p className="ui-eyebrow">Category Mix</p>
                <h2 className="mt-3 font-display text-3xl text-ink">Sales by category</h2>
              </div>

              {categorySales.length ? (
                <div className="space-y-4">
                  {categorySales.map((entry) => (
                    <div key={entry.category_name} className="rounded-card bg-white/80 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-ink">{entry.category_name}</p>
                        <p className="text-sm font-semibold text-ink">{entry.share}%</p>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-white">
                        <div className="h-3 rounded-full bg-[#6d6c6a]" style={{ width: `${Math.min(entry.share, 100)}%` }}></div>
                      </div>
                      <p className="mt-3 text-sm text-secondary">{formatCatalogPrice(entry.revenue)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No category sales yet"
                  description="Category performance will appear here once order items are available."
                />
              )}
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="ui-eyebrow">Recent Orders</p>
                <h2 className="mt-3 font-display text-3xl text-ink">Latest activity</h2>
              </div>
              <Link to="/orders">
                <Button
                  variant="secondary"
                  className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  View Order Queue
                </Button>
              </Link>
            </div>

            {recentOrders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                    <tr>
                      <th className="ui-table-head">Order</th>
                      <th className="ui-table-head">Customer</th>
                      <th className="ui-table-head">Created</th>
                      <th className="ui-table-head">Amount</th>
                      <th className="ui-table-head">Order Status</th>
                      <th className="ui-table-head">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-line">
                        <td className="px-5 py-4 text-ink">{order.order_number}</td>
                        <td className="px-5 py-4 text-secondary">{order.customer_name}</td>
                        <td className="px-5 py-4 text-secondary">{new Date(order.created_at).toLocaleString()}</td>
                        <td className="px-5 py-4 text-ink">{formatCatalogPrice(order.total_amount)}</td>
                        <td className="px-5 py-4 text-ink">{order.order_status}</td>
                        <td className="px-5 py-4 text-secondary">{order.payment_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No orders yet"
                description="Recent order activity will appear here once customer orders start coming in."
              />
            )}
          </SurfaceCard>
        </>
      ) : null}
    </div>
  );
}

export default AdminDashboard;
