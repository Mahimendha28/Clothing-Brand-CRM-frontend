import { startTransition, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import { getOrders } from "../services/orderService";
import { getReturns } from "../services/returnService";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric"
      }).format(new Date(value))
    : "Not available";

const formatStatusLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const MinimalMetric = ({ label, value }) => (
  <div className="rounded-[16px] border border-line bg-page px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
  </div>
);

function SalesExecutiveOverview() {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      try {
        setLoading(true);
        setError("");
        const [ordersResponse, returnsResponse] = await Promise.all([getOrders(), getReturns()]);

        if (!ignore) {
          startTransition(() => {
            setOrders(ordersResponse.orders || []);
            setReturns(returnsResponse.returns || []);
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load overview");
          setOrders([]);
          setReturns([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      ignore = true;
    };
  }, []);

  const overview = useMemo(() => {
    const activeOrders = orders.filter((order) =>
      ["placed", "confirmed", "packed", "shipped"].includes(order.order_status)
    );
    const pendingPayments = orders.filter((order) => order.payment_status === "pending");
    const openReturns = returns.filter((entry) => !["rejected", "refunded"].includes(entry.refund_status));
    const recentOrders = [...orders]
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
      .slice(0, 5);

    return {
      activeOrders,
      pendingPayments,
      openReturns,
      recentOrders
    };
  }, [orders, returns]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Overview"
        title="Sales executive workspace"
        description="A clean daily workspace for orders, customers, and returns. This page stays operational, while Analytics stays reporting-focused."
        actions={
          <>
            <Link to="/orders">
              <Button className="ui-compact-button !min-w-[108px]">Orders</Button>
            </Link>
            <Link to="/dashboard/sales">
              <Button variant="secondary" className="ui-compact-button !min-w-[108px]">
                Analytics
              </Button>
            </Link>
          </>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? <p className="text-sm text-secondary">Loading overview...</p> : null}

      {!loading && !orders.length ? (
        <EmptyState
          title="No orders yet"
          description="Order activity will appear here once the queue starts filling."
        />
      ) : null}

      {orders.length ? (
        <>
          <SurfaceCard className="space-y-4 !p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="ui-eyebrow">Today</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Priority work</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/customers">
                  <Button variant="secondary" className="ui-compact-button !min-w-[108px]">
                    Customers
                  </Button>
                </Link>
                <Link to="/dashboard/returns">
                  <Button variant="secondary" className="ui-compact-button !min-w-[108px]">
                    Returns
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <MinimalMetric label="Active Orders" value={String(overview.activeOrders.length)} />
              <MinimalMetric label="Pending Payments" value={String(overview.pendingPayments.length)} />
              <MinimalMetric label="Open Returns" value={String(overview.openReturns.length)} />
            </div>
          </SurfaceCard>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <SurfaceCard className="space-y-4 !p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Recent Orders</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">Queue snapshot</h2>
                </div>
                <Link to="/orders">
                  <Button variant="secondary" className="ui-compact-button !min-w-[108px]">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto rounded-[18px] border border-line">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-page">
                    <tr>
                      <th className="ui-table-head">Order</th>
                      <th className="ui-table-head">Customer</th>
                      <th className="ui-table-head">Status</th>
                      <th className="ui-table-head">Total</th>
                      <th className="ui-table-head">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-line last:border-b-0">
                        <td className="ui-table-cell">
                          <p className="font-medium text-ink">{order.order_number}</p>
                          <p className="mt-1 text-xs text-secondary">{formatDate(order.created_at)}</p>
                        </td>
                        <td className="ui-table-cell">{order.customer_name}</td>
                        <td className="ui-table-cell">{formatStatusLabel(order.order_status)}</td>
                        <td className="ui-table-cell">{formatCatalogPrice(order.total_amount)}</td>
                        <td className="ui-table-cell">
                          <Link to={`/orders/${order.id}`}>
                            <Button variant="secondary" className="ui-compact-button">
                              Open
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4 !p-5">
              <div>
                <p className="ui-eyebrow">Next Actions</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Keep the layout focused</h2>
              </div>

              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="flex items-center justify-between rounded-[16px] border border-line bg-page px-4 py-3 text-sm text-ink transition hover:border-ink"
                >
                  <span>Open the full order desk</span>
                  <span className="font-medium">{overview.activeOrders.length}</span>
                </Link>
                <Link
                  to="/customers"
                  className="flex items-center justify-between rounded-[16px] border border-line bg-page px-4 py-3 text-sm text-ink transition hover:border-ink"
                >
                  <span>Review customer records</span>
                  <span className="font-medium">CRM</span>
                </Link>
                <Link
                  to="/dashboard/returns"
                  className="flex items-center justify-between rounded-[16px] border border-line bg-page px-4 py-3 text-sm text-ink transition hover:border-ink"
                >
                  <span>Handle return requests</span>
                  <span className="font-medium">{overview.openReturns.length}</span>
                </Link>
              </div>
            </SurfaceCard>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default SalesExecutiveOverview;
