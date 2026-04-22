import { startTransition, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import { getCart } from "../services/cartService";
import { getMyOrders } from "../services/orderService";
import { getReturns } from "../services/returnService";
import { getStoredUser } from "../utils/auth";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));

const formatStatusLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const statusToneClass = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (["delivered", "paid", "refunded"].includes(normalized)) {
    return "border-success/20 bg-success/10 text-success";
  }

  if (["cancelled", "failed", "rejected"].includes(normalized)) {
    return "border-danger/20 bg-danger/10 text-danger";
  }

  if (["shipped", "confirmed", "packed", "approved", "received"].includes(normalized)) {
    return "border-accent/20 bg-accent/10 text-accent";
  }

  return "border-line bg-page text-secondary";
};

const statusPillClass =
  (value) => `inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusToneClass(value)}`;

function UserDashboard() {
  const user = getStoredUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [cart, setCart] = useState({
    item_count: 0,
    subtotal: 0,
    items: []
  });

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const [ordersResponse, returnsResponse, cartResponse] = await Promise.all([
          getMyOrders(),
          getReturns(),
          getCart()
        ]);

        if (ignore) {
          return;
        }

        startTransition(() => {
          setOrders(ordersResponse.orders || []);
          setReturns(returnsResponse.returns || []);
          setCart(cartResponse.cart || { item_count: 0, subtotal: 0, items: [] });
        });
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load dashboard data");
          setOrders([]);
          setReturns([]);
          setCart({
            item_count: 0,
            subtotal: 0,
            items: []
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const dashboardMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.order_status)).length;
    const deliveredOrders = orders.filter((order) => order.order_status === "delivered").length;
    const openReturns = returns.filter((entry) => !["refunded", "rejected"].includes(entry.refund_status)).length;

    return {
      totalOrders,
      activeOrders,
      deliveredOrders,
      openReturns
    };
  }, [orders, returns]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const recentReturns = useMemo(() => returns.slice(0, 5), [returns]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Customer Dashboard"
        title={`Welcome back, ${user?.name || "Customer"}`}
        description="Track orders and returns in a smaller, cleaner customer workspace."
        actions={
          <>
            <Link to="/products">
              <Button
                variant="secondary"
                className="ui-compact-button !min-w-[136px] !bg-white"
              >
                Browse Products
              </Button>
            </Link>
            <Link to="/my-orders">
              <Button className="ui-compact-button !min-w-[136px]">
                Open My Orders
              </Button>
            </Link>
          </>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="h-[320px] rounded-[24px] border border-soft bg-canvas shadow-sm" />
            <div className="h-[320px] rounded-[24px] border border-soft bg-canvas shadow-sm" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-[84px] rounded-[18px] border border-soft bg-canvas shadow-sm" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              compact
              label="Total Orders"
              value={String(dashboardMetrics.totalOrders)}
              note={`${dashboardMetrics.activeOrders} active`}
            />
            <MetricCard
              compact
              label="Active Orders"
              value={String(dashboardMetrics.activeOrders)}
              note="Still in progress"
            />
            <MetricCard
              compact
              label="Delivered"
              value={String(dashboardMetrics.deliveredOrders)}
              note="Completed"
            />
            <MetricCard
              compact
              label="Open Returns"
              value={String(dashboardMetrics.openReturns)}
              note={`Cart ${cart.item_count || 0} items`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <SurfaceCard className="space-y-4 !p-5 md:!p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Recent Orders</p>
                  <h2 className="mt-1 text-lg font-semibold leading-tight text-ink">Latest purchases</h2>
                  <p className="mt-2 text-sm text-secondary">A compact list of your recent orders.</p>
                </div>
                <Link to="/my-orders">
                  <Button variant="secondary" className="ui-compact-button !min-w-[96px]">
                    View All
                  </Button>
                </Link>
              </div>

              {recentOrders.length ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-[18px] border border-line bg-white p-4 transition-colors hover:bg-page/50"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/my-orders/${order.id}`} className="break-all text-sm font-semibold text-ink hover:underline">
                            {order.order_number}
                          </Link>
                          <p className="mt-1 text-sm text-secondary">Placed on {formatDate(order.created_at)}</p>
                        </div>
                        <p className="text-sm font-semibold text-ink">{formatCatalogPrice(order.total_amount)}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={statusPillClass(order.order_status)}>{formatStatusLabel(order.order_status)}</span>
                        <span className={statusPillClass(order.payment_status)}>{formatStatusLabel(order.payment_status)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No customer orders yet"
                  description="Your latest orders will appear here as soon as you complete checkout."
                />
              )}
            </SurfaceCard>

            <SurfaceCard className="space-y-4 !p-5 md:!p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Return Requests</p>
                  <h2 className="mt-1 text-lg font-semibold leading-tight text-ink">Recent returns</h2>
                  <p className="mt-2 text-sm text-secondary">A cleaner table view for return requests.</p>
                </div>
                <Link to="/returns">
                  <Button variant="secondary" className="ui-compact-button !min-w-[132px]">
                    Manage Returns
                  </Button>
                </Link>
              </div>

              {recentReturns.length ? (
                <div className="overflow-x-auto rounded-[18px] border border-line">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-page">
                      <tr>
                        <th className="ui-table-head">Order</th>
                        <th className="ui-table-head">Submitted</th>
                        <th className="ui-table-head">Reason</th>
                        <th className="ui-table-head">Return</th>
                        <th className="ui-table-head">Refund</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReturns.map((entry) => (
                        <tr key={entry.id} className="border-b border-line last:border-b-0">
                          <td className="ui-table-cell font-medium text-ink">{entry.order_number}</td>
                          <td className="ui-table-cell text-secondary">{formatDate(entry.created_at)}</td>
                          <td className="ui-table-cell text-secondary">{entry.reason}</td>
                          <td className="ui-table-cell">
                            <span className={statusPillClass(entry.return_status)}>{formatStatusLabel(entry.return_status)}</span>
                          </td>
                          <td className="ui-table-cell">
                            <span className={statusPillClass(entry.refund_status)}>{formatStatusLabel(entry.refund_status)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No return requests"
                  description="When you submit return requests they will appear here."
                />
              )}
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-4 !p-5 md:!p-6">
            <p className="ui-eyebrow">Quick Actions</p>
            <h2 className="text-lg font-semibold leading-tight text-ink">Keep things moving</h2>
            <p className="text-[13px] leading-6 text-secondary">
              Shortcuts to the account pages you use most often.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/addresses">
                <Button variant="secondary" className="ui-compact-button w-full">
                  Manage Addresses
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="secondary" className="ui-compact-button w-full">
                  Open Wishlist
                </Button>
              </Link>
              <Link to="/notifications">
                <Button variant="secondary" className="ui-compact-button w-full">
                  Notifications
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="secondary" className="ui-compact-button w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </SurfaceCard>
        </>
      )}
    </div>
  );
}

export default UserDashboard;
