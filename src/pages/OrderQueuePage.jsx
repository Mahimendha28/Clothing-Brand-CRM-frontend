import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { getOrders } from "../services/orderService";

const statusFilters = [
  { value: "", label: "All" },
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];

function OrderQueuePage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getOrders({ status: statusFilter });

        if (!ignore) {
          setOrders(response.orders || []);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load the order queue");
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
  }, [statusFilter]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Order Desk"
        title="Staff order queue"
        description="Review placed COD orders, move them through confirmation and fulfillment, and open shipment details from the same workspace."
        actions={
          <Link to="/dashboard/returns">
            <Button variant="secondary" className="!text-sm !font-medium !normal-case !tracking-[0.02em]">
              Manage Returns
            </Button>
          </Link>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-6">
        <div className="flex flex-wrap gap-3">
          {statusFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === filter.value ? "bg-ink text-white" : "bg-page text-secondary hover:text-ink"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? <p className="text-sm text-secondary">Loading orders...</p> : null}

        {!loading && !orders.length ? (
          <EmptyState
            title="No staff orders found"
            description="Placed, confirmed, packed, and shipped orders will appear here as the customer checkout flow continues."
          />
        ) : null}

        {orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-card bg-canvas p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="ui-eyebrow">Order</p>
                      <p className="mt-3 text-xl font-semibold text-ink">{order.order_number}</p>
                      <p className="mt-2 text-sm text-secondary">{order.customer_name}</p>
                    </div>
                    <div>
                      <p className="ui-eyebrow">Status</p>
                      <p className="mt-3 text-xl font-semibold text-ink">{order.order_status}</p>
                      <p className="mt-2 text-sm text-secondary">{order.payment_status}</p>
                    </div>
                    <div>
                      <p className="ui-eyebrow">Items / Total</p>
                      <p className="mt-3 text-xl font-semibold text-ink">{order.item_count} items</p>
                      <p className="mt-2 text-sm text-secondary">${Number(order.total_amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="ui-eyebrow">Shipment</p>
                      <p className="mt-3 text-xl font-semibold text-ink">{order.shipment_status || "Not created"}</p>
                      <p className="mt-2 text-sm text-secondary">{order.tracking_number || "No tracking yet"}</p>
                    </div>
                  </div>

                  <Link to={`/orders/${order.id}`}>
                    <Button className="!px-6 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                      Open Order
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default OrderQueuePage;
