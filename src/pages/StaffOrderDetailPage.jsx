import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import PageHeader from "../components/common/PageHeader";
import StatusPill from "../components/common/StatusPill";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { useToast } from "../context/ToastContext";
import {
  cancelOrder,
  confirmOrder,
  createShipment,
  deliverOrder,
  getOrderById,
  packOrder,
  shipOrder,
  updateShipmentTracking
} from "../services/orderService";

const initialShipmentForm = {
  trackingNumber: "",
  carrier: "",
  notes: ""
};

function StaffOrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [shipmentForm, setShipmentForm] = useState(initialShipmentForm);
  const [pendingAction, setPendingAction] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { toastError, toastSuccess } = useToast();

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getOrderById(orderId);
      setOrder(response.order || null);
    } catch (apiError) {
      setError(apiError.message || "Failed to load order detail");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (order?.shipment) {
      setShipmentForm({
        trackingNumber: order.shipment.tracking_number || "",
        carrier: order.shipment.carrier || "",
        notes: order.shipment.notes || ""
      });
      return;
    }

    setShipmentForm(initialShipmentForm);
  }, [order]);

  const handleOrderAction = async (actionKey) => {
    if (!order) {
      return;
    }

    if (actionKey === "cancel") {
      setShowCancelConfirm(true);
      return;
    }

    const actionMap = {
      confirm: confirmOrder,
      pack: packOrder,
      ship: shipOrder,
      deliver: deliverOrder
    };

    try {
      setPendingAction(actionKey);
      setError("");
      setMessage("");
      const response = await actionMap[actionKey](order.id);
      setOrder(response.order || null);
      setMessage(`Order ${actionKey} action completed successfully`);
      toastSuccess(`Order ${actionKey} action completed successfully`);
    } catch (apiError) {
      setError(apiError.message || "Failed to update order status");
      toastError(apiError.message || "Failed to update order status");
    } finally {
      setPendingAction("");
    }
  };

  const handleConfirmCancel = async () => {
    if (!order) {
      return;
    }

    try {
      setPendingAction("cancel");
      setError("");
      setMessage("");
      const response = await cancelOrder(order.id);
      setOrder(response.order || null);
      setMessage("Order cancelled successfully");
      toastSuccess("Order cancelled successfully");
      setShowCancelConfirm(false);
    } catch (apiError) {
      setError(apiError.message || "Failed to cancel order");
      toastError(apiError.message || "Failed to cancel order");
    } finally {
      setPendingAction("");
    }
  };

  const handleShipmentChange = (event) => {
    const { name, value } = event.target;
    setShipmentForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleShipmentSubmit = async (event) => {
    event.preventDefault();

    if (!order) {
      return;
    }

    try {
      setPendingAction("shipment");
      setError("");
      setMessage("");

      if (order.shipment?.id) {
        await updateShipmentTracking(order.shipment.id, shipmentForm);
      } else {
        await createShipment({
          orderId: order.id,
          trackingNumber: shipmentForm.trackingNumber,
          carrier: shipmentForm.carrier,
          notes: shipmentForm.notes
        });
      }

      await loadOrder();
      setMessage(order.shipment?.id ? "Shipment tracking updated successfully" : "Shipment created successfully");
    } catch (apiError) {
      setError(apiError.message || "Failed to save shipment details");
    } finally {
      setPendingAction("");
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading order detail...</p>;
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          Back to order queue
        </Link>
        <StatusBanner tone="danger">{error || "Order not found"}</StatusBanner>
      </div>
    );
  }

  const actionButtons = [
    { key: "confirm", label: "Confirm", allowed: order.order_status === "placed" },
    { key: "pack", label: "Pack", allowed: order.order_status === "confirmed" },
    { key: "ship", label: "Ship", allowed: order.order_status === "packed" },
    { key: "deliver", label: "Deliver", allowed: order.order_status === "shipped" },
    { key: "cancel", label: "Cancel", allowed: order.order_status !== "cancelled" }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Order Detail"
        title={order.order_number}
        description="Move the order through confirmation, packing, shipping, and delivery while keeping shipment details attached to the same staff workspace."
        actions={
          <Link to="/orders">
            <Button variant="secondary" className="!text-sm !font-medium !normal-case !tracking-[0.02em]">
              Back to Queue
            </Button>
          </Link>
        }
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="flex flex-wrap gap-3">
        {actionButtons.filter((action) => action.allowed).map((action) => (
          <Button
            key={action.key}
            type="button"
            onClick={() => handleOrderAction(action.key)}
            disabled={pendingAction === action.key}
            className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
          >
            {pendingAction === action.key ? "Working..." : action.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-card bg-canvas p-4">
              <p className="ui-eyebrow">Customer</p>
              <p className="mt-3 text-xl font-semibold text-ink">{order.customer_name}</p>
              <p className="mt-2 text-sm text-secondary">{order.customer_email}</p>
            </div>
            <div className="rounded-card bg-canvas p-4">
              <p className="ui-eyebrow">Order Status</p>
<<<<<<< HEAD
              <div className="mt-3">
                <StatusPill value={order.order_status} />
              </div>
=======
              <p className="mt-3 text-xl font-semibold text-ink uppercase">{order.status || order.order_status}</p>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
              <p className="mt-2 text-sm text-secondary">{order.payment_method}</p>
            </div>
            <div className="rounded-card bg-canvas p-4">
              <p className="ui-eyebrow">Shipment</p>
              <div className="mt-3">
                <StatusPill value={order.shipment?.shipment_status || "Not created"} />
              </div>
              <p className="mt-2 text-sm text-secondary">{order.shipment?.tracking_number || "No tracking number"}</p>
            </div>
          </div>

          {order.is_cancelled && (
            <div className="rounded-card border-red-100 bg-red-50 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-red-600">Cancellation Details</p>
              <p className="mt-3 text-lg font-medium text-red-900">{order.cancel_reason || "No reason provided"}</p>
              {order.cancelled_at && (
                <p className="mt-2 text-sm text-red-700">Cancelled at: {new Date(order.cancelled_at).toLocaleString()}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-card bg-canvas p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-ink">{item.product_name}</p>
                    <p className="mt-2 text-sm text-secondary">
                      {item.sku ? `${item.sku} - ` : ""}
                      {item.size || "Base"} / {item.color || "Default"}
                    </p>
                  </div>
                  <div className="text-sm text-secondary">
                    Qty {item.quantity} | ${Number(item.line_total).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-6">
          <div>
            <p className="ui-eyebrow">Shipment Update Section</p>
            <h2 className="mt-3 font-display text-3xl text-ink">Shipment details</h2>
          </div>

          <form onSubmit={handleShipmentSubmit} className="space-y-4">
            <div>
              <label className="ui-label">Tracking Number</label>
              <input
                name="trackingNumber"
                value={shipmentForm.trackingNumber}
                onChange={handleShipmentChange}
                className="ui-input"
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <label className="ui-label">Carrier</label>
              <input
                name="carrier"
                value={shipmentForm.carrier}
                onChange={handleShipmentChange}
                className="ui-input"
                placeholder="Courier or carrier name"
              />
            </div>

            <div>
              <label className="ui-label">Notes</label>
              <textarea
                name="notes"
                rows="4"
                value={shipmentForm.notes}
                onChange={handleShipmentChange}
                className="ui-input min-h-[120px] resize-none"
                placeholder="Shipment note"
              />
            </div>

            <Button type="submit" disabled={pendingAction === "shipment"} className="w-full !text-sm !font-medium !normal-case !tracking-[0.02em]">
              {pendingAction === "shipment"
                ? "Saving..."
                : order.shipment?.id
                  ? "Update Tracking"
                  : "Create Shipment"}
            </Button>
          </form>

          <div className="rounded-card bg-canvas p-4 text-sm leading-7 text-secondary">
            <p>Delivery address: {order.shipping_address.full_name}, {order.shipping_address.phone}</p>
            <p>{order.shipping_address.address_line_1}, {order.shipping_address.city}, {order.shipping_address.state}</p>
            <p>{order.shipping_address.postal_code}, {order.shipping_address.country}</p>
          </div>
        </SurfaceCard>
      </div>

      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel order"
        description="This will stop fulfilment for the current order. Please confirm before cancelling."
        confirmLabel="Cancel Order"
        loading={pendingAction === "cancel"}
        onConfirm={handleConfirmCancel}
        onClose={() => {
          if (pendingAction !== "cancel") {
            setShowCancelConfirm(false);
          }
        }}
      />
    </div>
  );
}

export default StaffOrderDetailPage;
