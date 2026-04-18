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
    const paidOrders = orders.filter((order) => order.payment_status === "paid").length;
    const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.order_status)).length;
    const deliveredOrders = orders.filter((order) => order.order_status === "delivered").length;
    const openReturns = returns.filter((entry) => !["refunded", "rejected"].includes(entry.refund_status)).length;

    return {
      totalOrders,
      paidOrders,
      activeOrders,
      deliveredOrders,
      openReturns
    };
  }, [orders, returns]);

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);
  const recentReturns = useMemo(() => returns.slice(0, 5), [returns]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Customer Dashboard"
        title={`Welcome back, ${user?.name || "Customer"}`}
        description="Track orders, payment progress, cart totals, and return activity from one dashboard with the same table-driven UI style as admin."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link to="/products">
              <Button
                variant="secondary"
                className="!rounded-[10px] !bg-white !px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                Browse Products
              </Button>
            </Link>
            <Link to="/my-orders">
              <Button className="!rounded-[10px] !px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                Open My Orders
              </Button>
            </Link>
          </div>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="h-[120px] rounded-[24px] border border-soft bg-canvas shadow-sm" />
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="h-[360px] rounded-[32px] border border-soft bg-canvas shadow-sm" />
            <div className="h-[360px] rounded-[32px] border border-soft bg-canvas shadow-sm" />
          </div>
        </div>
      ) : null}

      {!loading ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Total Orders"
              value={String(dashboardMetrics.totalOrders)}
              note={`${dashboardMetrics.activeOrders} currently active`}
            />
            <MetricCard
              label="Delivered"
              value={String(dashboardMetrics.deliveredOrders)}
              note="Completed fulfillment orders"
            />
            <MetricCard
              label="Paid Orders"
              value={String(dashboardMetrics.paidOrders)}
              note="Orders with confirmed payment"
            />
            <MetricCard
              label="Open Returns"
              value={String(dashboardMetrics.openReturns)}
              note="Return or refund flow in progress"
            />
            <MetricCard
              label="Cart Snapshot"
              value={`${cart.item_count || 0} item(s)`}
              note={`Subtotal ${formatCatalogPrice(cart.subtotal || 0)}`}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <SurfaceCard className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Recent Orders</p>
                  <h2 className="mt-3 font-display text-3xl text-ink">Latest purchases</h2>
                </div>
                <Link to="/my-orders">
                  <Button
                    variant="secondary"
                    className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                  >
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
                          <td className="px-5 py-4 text-ink">
                            <Link to={`/my-orders/${order.id}`} className="font-semibold hover:underline">
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-secondary">{formatDate(order.created_at)}</td>
                          <td className="px-5 py-4 text-ink">{formatCatalogPrice(order.total_amount)}</td>
                          <td className="px-5 py-4 text-ink uppercase">{order.order_status}</td>
                          <td className="px-5 py-4 text-secondary uppercase">{order.payment_status}</td>
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

            <SurfaceCard className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Return Requests</p>
                  <h2 className="mt-3 font-display text-3xl text-ink">Recent returns</h2>
                </div>
                <Link to="/returns">
                  <Button
                    variant="secondary"
                    className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                  >
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
                          <td className="px-5 py-4 text-ink">{entry.order_number}</td>
                          <td className="px-5 py-4 text-secondary">{formatDate(entry.created_at)}</td>
                          <td className="px-5 py-4 text-ink">{entry.reason}</td>
                          <td className="px-5 py-4 text-ink uppercase">{entry.return_status}</td>
                          <td className="px-5 py-4 text-secondary uppercase">{entry.refund_status}</td>
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
          </div>
        </>
      ) : null}
    </div>
  );
}

export default UserDashboard;
