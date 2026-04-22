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
  const latestOrder = orders[0] || null;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Customer Dashboard"
        title={`Welcome back, ${user?.name || "Customer"}`}
        description="Track your recent orders, active returns, and cart progress from one polished customer workspace."
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
        <div className="space-y-8 animate-pulse">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-[120px] rounded-[24px] border border-soft bg-canvas shadow-sm" />
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="h-[360px] rounded-[32px] border border-soft bg-canvas shadow-sm" />
            <div className="h-[360px] rounded-[32px] border border-soft bg-canvas shadow-sm" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              compact
              label="Total Orders"
              value={String(dashboardMetrics.totalOrders)}
              note={`${dashboardMetrics.activeOrders} currently active`}
            />
            <MetricCard
              compact
              label="Active Orders"
              value={String(dashboardMetrics.activeOrders)}
              note="Orders still in progress"
            />
            <MetricCard
              compact
              label="Delivered"
              value={String(dashboardMetrics.deliveredOrders)}
              note="Completed fulfillment orders"
            />
            <MetricCard
              compact
              label="Open Returns"
              value={String(dashboardMetrics.openReturns)}
              note="Return or refund flow in progress"
            />
          </div>

          <SurfaceCard className="space-y-4 !p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="ui-eyebrow">Latest Activity</p>
                <h2 className="mt-2 text-xl font-semibold leading-tight text-ink">Current snapshot</h2>
              </div>
              <Link to={latestOrder ? `/my-orders/${latestOrder.id}` : "/my-orders"}>
                <Button variant="secondary" className="ui-compact-button !min-w-[108px]">
                  View Latest
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[16px] border border-line bg-page px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Recent order</p>
                <p className="mt-2 text-base font-semibold text-ink">
                  {latestOrder ? latestOrder.order_number : "No orders yet"}
                </p>
                <p className="mt-1 text-sm text-secondary">
                  {latestOrder ? formatStatusLabel(latestOrder.order_status) : "Your first order will appear here."}
                </p>
              </div>
              <div className="rounded-[16px] border border-line bg-page px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Order total</p>
                <p className="mt-2 text-base font-semibold text-ink">
                  {latestOrder ? formatCatalogPrice(latestOrder.total_amount) : formatCatalogPrice(0)}
                </p>
                <p className="mt-1 text-sm text-secondary">
                  {latestOrder ? `Placed ${formatDate(latestOrder.created_at)}` : "Checkout summary will appear here."}
                </p>
              </div>
              <div className="rounded-[16px] border border-line bg-page px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Cart snapshot</p>
                <p className="mt-2 text-base font-semibold text-ink">
                  {cart.item_count || 0} item(s)
                </p>
                <p className="mt-1 text-sm text-secondary">
                  Subtotal {formatCatalogPrice(cart.subtotal || 0)}
                </p>
              </div>
            </div>
          </SurfaceCard>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <SurfaceCard className="space-y-4 !p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Recent Orders</p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight text-ink">Latest purchases</h2>
                </div>
                <Link to="/my-orders">
                  <Button variant="secondary" className="ui-compact-button !min-w-[96px]">
                    View All
                  </Button>
                </Link>
              </div>

              {recentOrders.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr>
                        <th className="ui-table-head">Order</th>
                        <th className="ui-table-head">Created</th>
                        <th className="ui-table-head">Total</th>
                        <th className="ui-table-head">Status</th>
                        <th className="ui-table-head">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-line">
                          <td className="ui-table-cell">
                            <Link to={`/my-orders/${order.id}`} className="font-semibold hover:underline">
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="ui-table-cell text-secondary">{formatDate(order.created_at)}</td>
                          <td className="ui-table-cell">{formatCatalogPrice(order.total_amount)}</td>
                          <td className="ui-table-cell uppercase">{order.order_status}</td>
                          <td className="ui-table-cell uppercase text-secondary">{order.payment_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No customer orders yet"
                  description="Your latest orders will appear here as soon as you complete checkout."
                />
              )}
            </SurfaceCard>

            <div className="grid gap-5">
              <SurfaceCard className="space-y-4 !p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="ui-eyebrow">Return Requests</p>
                    <h2 className="mt-2 text-xl font-semibold leading-tight text-ink">Recent returns</h2>
                  </div>
                  <Link to="/returns">
                    <Button variant="secondary" className="ui-compact-button !min-w-[132px]">
                      Manage Returns
                    </Button>
                  </Link>
                </div>

                {recentReturns.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead>
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
                          <tr key={entry.id} className="border-b border-line">
                            <td className="ui-table-cell">{entry.order_number}</td>
                            <td className="ui-table-cell text-secondary">{formatDate(entry.created_at)}</td>
                            <td className="ui-table-cell">{entry.reason}</td>
                            <td className="ui-table-cell uppercase">{entry.return_status}</td>
                            <td className="ui-table-cell uppercase text-secondary">{entry.refund_status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    title="No return requests"
                    description="When you submit return requests they will appear in this table."
                  />
                )}
              </SurfaceCard>

              <SurfaceCard className="space-y-4 !p-5">
                <p className="ui-eyebrow">Quick Actions</p>
                <h2 className="text-xl font-semibold leading-tight text-ink">Keep things moving</h2>
                <p className="text-[13px] leading-6 text-secondary">
                  Shortcuts to the account pages you use most often.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserDashboard;
