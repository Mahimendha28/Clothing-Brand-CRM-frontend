import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import CursorPagination from "../components/common/CursorPagination";
import CustomerTableToolbar from "../components/common/CustomerTableToolbar";
import EmptyState from "../components/common/EmptyState";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import { getDashboardReport } from "../services/reportService";

const PAGE_SIZE = 6;

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(value))
    : "Not available";

const formatStatusLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [cursor, setCursor] = useState(0);

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

  const filteredRecentOrders = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return recentOrders.filter((order) => {
      const matchesSearch =
        !search ||
        order.order_number?.toLowerCase().includes(search) ||
        order.customer_name?.toLowerCase().includes(search) ||
        order.order_status?.toLowerCase().includes(search) ||
        order.payment_status?.toLowerCase().includes(search);

      const matchesStatus = !statusFilter || order.order_status === statusFilter;
      const matchesPayment = !paymentFilter || order.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [paymentFilter, recentOrders, searchValue, statusFilter]);

  const paginatedOrders = useMemo(
    () => filteredRecentOrders.slice(cursor, cursor + PAGE_SIZE),
    [cursor, filteredRecentOrders]
  );

  useEffect(() => {
    setCursor(0);
  }, [searchValue, statusFilter, paymentFilter]);

  useEffect(() => {
    if (cursor >= filteredRecentOrders.length && cursor !== 0) {
      setCursor(Math.max(0, filteredRecentOrders.length - PAGE_SIZE));
    }
  }, [cursor, filteredRecentOrders.length]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Atelier Overview"
        description="Track revenue, customers, orders, and stock in one cleaner admin workspace with less visual noise and better table controls."
        actions={
          <>
            <Link to="/admin/users">
              <Button
                variant="secondary"
                className="ui-compact-button !min-w-[132px] !bg-white"
              >
                Users
              </Button>
            </Link>
            <Link to="/admin/coupons">
              <Button
                variant="secondary"
                className="ui-compact-button !min-w-[132px] !bg-white"
              >
                Coupons
              </Button>
            </Link>
            <Link to="/dashboard/sales">
              <Button className="ui-compact-button !min-w-[132px]">
                Sales
              </Button>
            </Link>
            <Link to="/dashboard/inventory">
              <Button variant="secondary" className="ui-compact-button !min-w-[132px]">
                Inventory
              </Button>
            </Link>
          </>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-[108px] rounded-[20px] bg-canvas border border-soft shadow-sm" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
             <div className="h-[320px] rounded-[24px] bg-canvas border border-soft shadow-sm" />
             <div className="h-[320px] rounded-[24px] bg-canvas border border-soft shadow-sm" />
          </div>
        </div>
      ) : null}

      {!loading && !report ? (
        <EmptyState
          title="Dashboard unavailable"
          description="Admin metrics will appear here once the report API responds with live data."
        />
      ) : null}

      {report ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              compact
              label="Total Revenue"
              value={formatCatalogPrice(summary.total_revenue)}
              note={`${summary.revenue_growth >= 0 ? "+" : ""}${summary.revenue_growth || 0}% vs previous 30 days`}
            />
            <MetricCard
              compact
              label="New Customers"
              value={String(summary.new_customers || 0)}
              note={`${summary.total_customers || 0} total customer records in the store`}
            />
            <MetricCard
              compact
              label="Pending Orders"
              value={String(summary.pending_orders || 0)}
              note={`${summary.total_orders || 0} total orders currently in the system`}
            />
            <MetricCard
              compact
              label="Inventory Health"
              value={`${summary.inventory_health || 0}%`}
              note={`${summary.low_stock_count || 0} active variants are currently low on stock`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
            <SurfaceCard className="space-y-5 !p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Sales Trend</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">Monthly sales revenue</h2>
                </div>
                <p className="text-sm text-secondary">Last {monthlySales.length} months</p>
              </div>

              {monthlySales.length ? (
                <div className="overflow-x-auto pb-1">
                  <div
                    className="grid min-w-[640px] items-end gap-4 pt-8"
                    style={{ gridTemplateColumns: `repeat(${monthlySales.length}, minmax(0, 1fr))` }}
                  >
                  {monthlySales.map((entry) => {
                    const height = maxRevenue ? Math.max(18, Math.round((Number(entry.revenue || 0) / maxRevenue) * 200)) : 18;

                    return (
                      <div key={entry.month_key} className="flex flex-col items-center gap-3">
                        <div className="flex h-[180px] items-end">
                          <div className="w-9 rounded-t-[10px] bg-accent" style={{ height }}></div>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">{entry.month_label.slice(0, 3)}</p>
                        <p className="text-xs text-secondary">{formatCatalogPrice(entry.revenue)}</p>
                      </div>
                    );
                  })}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No revenue trend yet"
                  description="Monthly sales bars will appear here after orders start accumulating."
                />
              )}
            </SurfaceCard>

            <SurfaceCard className="space-y-5 !p-5">
              <div>
                <p className="ui-eyebrow">Category Mix</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Sales by category</h2>
              </div>

              {categorySales.length ? (
                <div className="space-y-3">
                  {categorySales.map((entry) => (
                    <div key={entry.category_name} className="rounded-[16px] border border-line bg-page p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-ink">{entry.category_name}</p>
                        <p className="text-sm font-semibold text-ink">{entry.share}%</p>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-input">
                        <div className="h-3 rounded-full bg-accent" style={{ width: `${Math.min(entry.share, 100)}%` }}></div>
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

          <SurfaceCard className="space-y-4 !p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="ui-eyebrow">Recent Orders</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Latest activity</h2>
              </div>
              <Link to="/orders">
                <Button variant="secondary" className="ui-compact-button !min-w-[132px]">
                  View Order Queue
                </Button>
              </Link>
            </div>

            {recentOrders.length ? (
              <>
                <CustomerTableToolbar
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  searchPlaceholder="Search by order, customer, or status"
                  totalItems={recentOrders.length}
                  visibleItems={filteredRecentOrders.length}
                  itemLabel="orders"
                  filters={[
                    {
                      key: "status",
                      label: "Order status",
                      value: statusFilter,
                      onChange: setStatusFilter,
                      options: [
                        { value: "", label: "All statuses" },
                        { value: "placed", label: "Placed" },
                        { value: "confirmed", label: "Confirmed" },
                        { value: "packed", label: "Packed" },
                        { value: "shipped", label: "Shipped" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" }
                      ]
                    },
                    {
                      key: "payment",
                      label: "Payment status",
                      value: paymentFilter,
                      onChange: setPaymentFilter,
                      options: [
                        { value: "", label: "All payments" },
                        { value: "pending", label: "Pending" },
                        { value: "paid", label: "Paid" },
                        { value: "failed", label: "Failed" },
                        { value: "refunded", label: "Refunded" }
                      ]
                    }
                  ]}
                />

                {!filteredRecentOrders.length ? (
                  <EmptyState
                    title="No matching orders"
                    description="Try a different search term or clear your filters to see more recent orders."
                  />
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-[18px] border border-line">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead className="bg-page">
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
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="border-b border-line last:border-b-0">
                        <td className="ui-table-cell font-medium text-ink">{order.order_number}</td>
                        <td className="ui-table-cell text-secondary">{order.customer_name}</td>
                        <td className="ui-table-cell text-secondary">{formatDateTime(order.created_at)}</td>
                        <td className="ui-table-cell text-ink">{formatCatalogPrice(order.total_amount)}</td>
                        <td className="ui-table-cell text-ink">{formatStatusLabel(order.order_status)}</td>
                        <td className="ui-table-cell text-secondary">{formatStatusLabel(order.payment_status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                    <CursorPagination
                      cursor={cursor}
                      pageSize={PAGE_SIZE}
                      totalItems={filteredRecentOrders.length}
                      onPrevious={() => setCursor((current) => Math.max(0, current - PAGE_SIZE))}
                      onNext={() => setCursor((current) => current + PAGE_SIZE)}
                    />
                  </>
                )}
              </>
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
