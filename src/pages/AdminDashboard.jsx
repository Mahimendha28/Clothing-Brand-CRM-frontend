import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import Button from "../components/common/Button";
import CursorPagination from "../components/common/CursorPagination";
import CustomerTableToolbar from "../components/common/CustomerTableToolbar";
import EmptyState from "../components/common/EmptyState";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import StatusPill from "../components/common/StatusPill";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { isAllowedTopLevelCategory } from "../constants/categories";
import { getProducts } from "../services/authService";
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
  const [topProducts, setTopProducts] = useState([]);
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
        const [dashboardResponse, productsResponse] = await Promise.all([getDashboardReport(), getProducts()]);

        if (!ignore) {
          setReport(dashboardResponse);
          setTopProducts(
            (productsResponse.products || [])
              .filter((product) => product.status !== "inactive")
              .filter((product) => isAllowedTopLevelCategory(product.category_name))
              .sort((left, right) => Number(right.base_price || 0) - Number(left.base_price || 0))
              .slice(0, 5)
          );
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load the admin dashboard");
          setReport(null);
          setTopProducts([]);
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
  const salesChartData = monthlySales.map((entry) => ({
    month: entry.month_label,
    revenue: Number(entry.revenue || 0),
    orders: Number(entry.order_count || 0)
  }));

  const visibleCategorySales = categorySales
    .filter((entry) => isAllowedTopLevelCategory(entry.category_name))
    .sort((left, right) => Number(right.revenue || 0) - Number(left.revenue || 0));

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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Overview"
        description="A cleaner overview for revenue, orders, stock, and category performance."
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-[88px] rounded-[16px] border border-soft bg-canvas shadow-sm" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-[240px] rounded-[16px] border border-soft bg-canvas shadow-sm" />
            <div className="h-[240px] rounded-[16px] border border-soft bg-canvas shadow-sm" />
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
              note={`${summary.total_customers || 0} total customer records`}
            />
            <MetricCard
              compact
              label="Pending Orders"
              value={String(summary.pending_orders || 0)}
              note={`${summary.total_orders || 0} orders in the system`}
            />
            <MetricCard
              compact
              label="Low Stock"
              value={String(summary.low_stock_count || 0)}
              note={`${summary.inventory_health || 0}% inventory health`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SurfaceCard className="space-y-4 !p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Sales Trend</p>
                  <h2 className="mt-1 text-base font-semibold text-ink">Monthly revenue</h2>
                </div>
                <p className="text-xs font-medium text-secondary">Last {monthlySales.length} months</p>
              </div>

              {monthlySales.length ? (
                <div className="h-[240px] rounded-[16px] border border-line bg-page px-2 py-3 sm:px-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#78716c", fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "#78716c", fontSize: 12 }} tickLine={false} axisLine={false} width={64} />
                      <Tooltip
                        formatter={(value) => formatCatalogPrice(value)}
                        contentStyle={{ borderRadius: 16, borderColor: "#e7e5e4" }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title="No revenue trend yet"
                  description="Monthly revenue will appear here after orders start accumulating."
                />
              )}
            </SurfaceCard>

            <SurfaceCard className="space-y-4 !p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Orders Count</p>
                  <h2 className="mt-1 text-base font-semibold text-ink">Monthly order volume</h2>
                </div>
                <p className="text-xs font-medium text-secondary">Readable order trend</p>
              </div>

              {monthlySales.length ? (
                <div className="h-[240px] rounded-[16px] border border-line bg-page px-2 py-3 sm:px-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#78716c", fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "#78716c", fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#e7e5e4" }} />
                      <Bar dataKey="orders" fill="#111827" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title="No order volume yet"
                  description="Order count bars will appear here once the report API has order history."
                />
              )}
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="space-y-4 !p-4">
              <div>
                <p className="ui-eyebrow">Category Mix</p>
                <h2 className="mt-1 text-base font-semibold text-ink">Sales by category</h2>
              </div>

              {visibleCategorySales.length ? (
                <div className="space-y-3">
                  {visibleCategorySales.map((entry) => (
                    <div key={entry.category_name} className="rounded-[16px] border border-line bg-page p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-ink">{entry.category_name}</p>
                        <p className="text-sm font-semibold text-ink">{formatCatalogPrice(entry.revenue)}</p>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-input">
                        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${Math.min(entry.share, 100)}%` }} />
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">{entry.share}% share</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No category sales yet"
                  description="Category performance for Men, Women, and Kids will appear here once order items are available."
                />
              )}
            </SurfaceCard>

            <SurfaceCard className="space-y-4 !p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Top Products</p>
                  <h2 className="mt-1 text-base font-semibold text-ink">Top catalogue picks</h2>
                </div>
                <Link to="/admin/products">
                  <Button variant="secondary" className="ui-compact-button">Products</Button>
                </Link>
              </div>

              {topProducts.length ? (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between gap-3 rounded-[16px] border border-line bg-page px-4 py-3">
                      <div className="min-w-0">
                        <Link to={`/admin/products/${product.id}`} className="truncate text-sm font-semibold text-ink hover:underline">
                          {index + 1}. {product.product_name}
                        </Link>
                        <p className="mt-1 text-sm text-secondary">{product.category_name} | {product.brand_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink">{formatCatalogPrice(product.base_price)}</p>
                        <StatusPill value={product.status} className="mt-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No products available"
                  description="Top products will appear here once the catalogue has active records."
                />
              )}
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-4 !p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="ui-eyebrow">Recent Orders</p>
                <h2 className="mt-1 text-base font-semibold text-ink">Latest activity</h2>
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
                    <div className="overflow-x-auto rounded-[16px] border border-line">
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
                              <td className="ui-table-cell font-medium text-ink">
                                <Link to={`/orders/${order.id}`} className="hover:underline">
                                  {order.order_number}
                                </Link>
                              </td>
                              <td className="ui-table-cell text-secondary">{order.customer_name}</td>
                              <td className="ui-table-cell text-secondary">{formatDateTime(order.created_at)}</td>
                              <td className="ui-table-cell text-ink">{formatCatalogPrice(order.total_amount)}</td>
                              <td className="ui-table-cell"><StatusPill value={formatStatusLabel(order.order_status)} /></td>
                              <td className="ui-table-cell"><StatusPill value={formatStatusLabel(order.payment_status)} /></td>
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
