import { startTransition, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import { formatCatalogPrice } from "../services/catalogService";
import { getMyOrders } from "../services/orderService";

const formatOrderDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyOrders();

        if (!ignore) {
          startTransition(() => {
            setOrders(response.orders || []);
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load your orders");
          setOrders([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-secondary">Loading your orders...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ui-eyebrow">My Orders</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.92] text-ink">Order history.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary">
            Review every COD order you have placed, track current status, and open each order for the detailed product and address breakdown.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink shadow-soft transition hover:bg-page"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <StatusBanner tone="danger">{error}</StatusBanner>

      {!orders.length ? (
        <div className="space-y-6">
          <EmptyState
            title="No orders yet"
            description="Your placed COD orders will appear here once checkout is completed."
          />
          <Link to="/products">
            <Button className="!text-sm !font-medium !normal-case !tracking-[0.02em]">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[30px] border border-line bg-white p-6 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Order Number</p>
                  <h2 className="mt-3 font-display text-4xl leading-none text-ink">{order.order_number}</h2>
                  <p className="mt-4 text-sm text-secondary">Placed on {formatOrderDate(order.created_at)}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-page px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
                    {order.order_status}
                  </span>
                  <span className="rounded-full border border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">
                    {order.payment_method}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-[22px] bg-page p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Items</p>
                  <p className="mt-3 text-xl font-semibold text-ink">{order.item_count}</p>
                </div>
                <div className="rounded-[22px] bg-page p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Subtotal</p>
                  <p className="mt-3 text-xl font-semibold text-ink">{formatCatalogPrice(order.subtotal)}</p>
                </div>
                <div className="rounded-[22px] bg-page p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Total</p>
                  <p className="mt-3 text-xl font-semibold text-ink">{formatCatalogPrice(order.total_amount)}</p>
                </div>
                <div className="rounded-[22px] bg-page p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Payment Status</p>
                  <p className="mt-3 text-xl font-semibold text-ink">{order.payment_status}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap gap-3">
                  <Link to={`/my-orders/${order.id}`}>
                    <Button
                      variant="secondary"
                      className="!px-6 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                    >
                      View Order Detail
                    </Button>
                  </Link>
                  {order.order_status === "delivered" ? (
                    <Link to={`/returns/new/${order.id}`}>
                      <Button className="!px-6 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                        Request Return
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrdersPage;
