import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { getCrmCustomerNotes, getCrmCustomerOrders } from "../services/crmService";

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

function CustomerDetailOverviewPage() {
  const { customer } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      try {
        setLoading(true);
        setError("");
        const [orderResponse, noteResponse] = await Promise.all([
          getCrmCustomerOrders(customer.id),
          getCrmCustomerNotes(customer.id)
        ]);

        if (!ignore) {
          setOrders((orderResponse.orders || []).slice(0, 5));
          setNotes((noteResponse.notes || []).slice(0, 3));
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load customer overview");
          setOrders([]);
          setNotes([]);
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
  }, [customer.id]);

  return (
    <div className="space-y-6">
      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="ui-eyebrow">Address Selection</p>
              <h2 className="mt-3 font-display text-3xl text-ink">Default address</h2>
            </div>
            <span className="rounded-full bg-page px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              {customer.address_count} saved
            </span>
          </div>

          {customer.default_address ? (
            <div className="rounded-card bg-canvas p-5 text-sm leading-7 text-secondary">
              <p className="font-medium text-ink">{customer.default_address.full_name}</p>
              <p>{customer.default_address.phone}</p>
              <p>{customer.default_address.address_line_1}</p>
              {customer.default_address.address_line_2 ? <p>{customer.default_address.address_line_2}</p> : null}
              <p>
                {customer.default_address.city}, {customer.default_address.state} {customer.default_address.postal_code}
              </p>
              <p>{customer.default_address.country}</p>
            </div>
          ) : (
            <EmptyState
              title="No address saved"
              description="This customer has not saved a default delivery address yet."
            />
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="ui-eyebrow">CRM Snapshot</p>
              <h2 className="mt-3 font-display text-3xl text-ink">Relationship health</h2>
            </div>
            <Link to={`/customers/${customer.id}/notes`}>
              <Button
                variant="secondary"
                className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                Open Notes
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-card bg-canvas p-5">
              <p className="ui-eyebrow">Lifetime Spend</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{formatCurrency(customer.total_spent)}</p>
            </div>
            <div className="rounded-card bg-canvas p-5">
              <p className="ui-eyebrow">Last Order</p>
              <p className="mt-3 text-lg font-semibold text-ink">
                {customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString() : "No orders yet"}
              </p>
            </div>
            <div className="rounded-card bg-canvas p-5">
              <p className="ui-eyebrow">Delivered Orders</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{customer.delivered_order_count}</p>
            </div>
            <div className="rounded-card bg-canvas p-5">
              <p className="ui-eyebrow">Account Status</p>
              <p className="mt-3 text-2xl font-semibold text-ink">{customer.status}</p>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="ui-eyebrow">Customer Order History</p>
              <h2 className="mt-3 font-display text-3xl text-ink">Recent orders</h2>
            </div>
            <Link to={`/customers/${customer.id}/orders`}>
              <Button
                variant="secondary"
                className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                View All Orders
              </Button>
            </Link>
          </div>

          {loading ? <p className="text-sm text-secondary">Loading order preview...</p> : null}

          {!loading && !orders.length ? (
            <EmptyState
              title="No orders recorded"
              description="Once this customer places an order, their order history will appear here."
            />
          ) : null}

          {orders.length ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-card bg-canvas p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-ink">{order.order_number}</p>
                      <p className="mt-1 text-sm text-secondary">
                        {order.item_count} items • {order.order_status} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-ink">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="ui-eyebrow">Customer Notes</p>
              <h2 className="mt-3 font-display text-3xl text-ink">Latest notes</h2>
            </div>
            <Link to={`/customers/${customer.id}/notes`}>
              <Button className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                Add Note
              </Button>
            </Link>
          </div>

          {loading ? <p className="text-sm text-secondary">Loading notes...</p> : null}

          {!loading && !notes.length ? (
            <EmptyState
              title="No notes yet"
              description="Sales and CRM notes will appear here after the team starts logging customer context."
            />
          ) : null}

          {notes.length ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="rounded-card bg-canvas p-4">
                  <p className="text-sm leading-7 text-secondary">{note.note_text}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                    {note.author_name} • {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </SurfaceCard>
      </div>
    </div>
  );
}

export default CustomerDetailOverviewPage;
