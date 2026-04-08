import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import { getOrderById } from "../services/orderService";
import { createReturnRequest } from "../services/returnService";

function ReturnRequestPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("Damaged item");
  const [customerNotes, setCustomerNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    let ignore = false;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getOrderById(orderId);

        if (!ignore) {
          setOrder(response.order || null);
          setSelectedItems(
            Object.fromEntries(
              (response.order?.items || []).map((item) => [
                item.id,
                {
                  selected: false,
                  quantity: item.quantity,
                  reason: ""
                }
              ])
            )
          );
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load order details for this return");
          setOrder(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      ignore = true;
    };
  }, [orderId]);

  const selectedPayload = useMemo(
    () =>
      Object.entries(selectedItems)
        .filter(([, value]) => value.selected && Number(value.quantity) > 0)
        .map(([itemId, value]) => ({
          orderItemId: Number(itemId),
          quantity: Number(value.quantity),
          reason: value.reason
        })),
    [selectedItems]
  );

  const handleItemToggle = (itemId) => {
    setSelectedItems((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        selected: !current[itemId]?.selected
      }
    }));
  };

  const handleItemFieldChange = (itemId, field, value) => {
    setSelectedItems((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        [field]:
          field === "quantity"
            ? Math.max(1, Number(value || 1))
            : value
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = await createReturnRequest({
        orderId: Number(orderId),
        reason,
        customerNotes,
        items: selectedPayload
      });

      setMessage(response.message || "Return request submitted successfully");
      navigate("/returns");
    } catch (apiError) {
      setError(apiError.message || "Failed to submit the return request");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading return request workspace...</p>;
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <StatusBanner tone="danger">{error || "Order not found"}</StatusBanner>
        <EmptyState
          title="Order unavailable"
          description="Open a delivered order from My Orders before requesting a return."
        />
      </div>
    );
  }

  if (order.order_status !== "delivered") {
    return (
      <div className="space-y-6">
        <StatusBanner tone="danger">Returns are available only after an order has been delivered.</StatusBanner>
        <Link to={`/my-orders/${order.id}`} className="text-sm font-medium text-ink underline-offset-4 hover:underline">
          Return to order detail
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Return Request"
        title={`Request a return for ${order.order_number}`}
        description="Select the delivered items you want to send back, set the return quantity, and add a clear explanation for the staff team."
        actions={
          <Link to={`/my-orders/${order.id}`}>
            <Button variant="secondary" className="!text-sm !font-medium !normal-case !tracking-[0.02em]">
              Back to Order
            </Button>
          </Link>
        }
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard className="space-y-5">
          {order.items.map((item) => {
            const state = selectedItems[item.id] || { selected: false, quantity: item.quantity, reason: "" };

            return (
              <article key={item.id} className="rounded-[24px] bg-page p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={state.selected}
                      onChange={() => handleItemToggle(item.id)}
                      className="mt-1 h-4 w-4 rounded border-line"
                    />
                    <div>
                      <p className="text-lg font-semibold text-ink">{item.product_name}</p>
                      <p className="mt-2 text-sm text-secondary">
                        {item.variant_id
                          ? `${item.size || "Base"} / ${item.color || "Default"}${item.sku ? ` - ${item.sku}` : ""}`
                          : "Base product"}
                      </p>
                    </div>
                  </label>

                  <div className="text-right">
                    <p className="text-sm text-secondary">Purchased</p>
                    <p className="mt-2 text-lg font-semibold text-ink">{item.quantity} item(s)</p>
                    <p className="mt-2 text-sm text-secondary">{formatCatalogPrice(item.line_total)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
                  <div>
                    <label className="ui-label">Return Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={state.quantity}
                      onChange={(event) => handleItemFieldChange(item.id, "quantity", event.target.value)}
                      disabled={!state.selected}
                      className="ui-input"
                    />
                  </div>

                  <div>
                    <label className="ui-label">Item-specific reason</label>
                    <input
                      type="text"
                      value={state.reason}
                      onChange={(event) => handleItemFieldChange(item.id, "reason", event.target.value)}
                      disabled={!state.selected}
                      className="ui-input"
                      placeholder="Optional note for this item"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <div>
            <label className="ui-label">Main Return Reason</label>
            <select value={reason} onChange={(event) => setReason(event.target.value)} className="ui-input">
              <option>Damaged item</option>
              <option>Wrong size or fit</option>
              <option>Wrong item delivered</option>
              <option>Changed my mind</option>
              <option>Quality issue</option>
            </select>
          </div>

          <div>
            <label className="ui-label">Customer Notes</label>
            <textarea
              rows="5"
              value={customerNotes}
              onChange={(event) => setCustomerNotes(event.target.value)}
              className="ui-input min-h-[160px] resize-none"
              placeholder="Share any additional information that will help staff review this return."
            />
          </div>

          <div className="rounded-[22px] bg-page p-4 text-sm leading-7 text-secondary">
            <p>Selected items: {selectedPayload.length}</p>
            <p>Total ordered items: {order.item_count}</p>
            <p>Current payment status: {order.payment_status}</p>
          </div>

          <Button
            type="submit"
            disabled={saving || !selectedPayload.length}
            className="w-full !text-sm !font-medium !normal-case !tracking-[0.02em]"
          >
            {saving ? "Submitting..." : "Submit Return Request"}
          </Button>
        </SurfaceCard>
      </form>
    </div>
  );
}

export default ReturnRequestPage;
