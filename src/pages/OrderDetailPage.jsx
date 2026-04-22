import { startTransition, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import CancelOrderDialog from "../components/common/CancelOrderDialog";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import { useToast } from "../context/ToastContext";
import { buildCatalogImageUrl, formatCatalogPrice } from "../services/catalogService";
import { cancelOrder, downloadOrderInvoicePdf, getOrderById } from "../services/orderService";

const orderTimelineSteps = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" }
];

const orderStatusIndexMap = orderTimelineSteps.reduce((accumulator, step, index) => {
  accumulator[step.key] = index;
  return accumulator;
}, {});

const formatOrderDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));

const getTimelineStepState = (currentStatus, stepKey) => {
  if (currentStatus === "cancelled") {
    return "cancelled";
  }

  const currentIndex = orderStatusIndexMap[currentStatus] ?? -1;
  const stepIndex = orderStatusIndexMap[stepKey] ?? -1;

  if (stepIndex < currentIndex) {
    return "completed";
  }

  if (stepIndex === currentIndex) {
    return "current";
  }

  return "upcoming";
};

const cleanCancelReason = (value) =>
  String(value || "")
    .replace(/^Customer Cancel:\s*/i, "")
    .replace(/^Admin Cancel:\s*/i, "")
    .replace(/^Reason not provided$/i, "")
    .trim();

function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { toastSuccess, toastError } = useToast();

  useEffect(() => {
    let ignore = false;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getOrderById(orderId);

        if (!ignore) {
          startTransition(() => {
            setOrder(response.order || null);
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load order detail");
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

  const handleDownloadInvoice = async () => {
    if (!order?.id) {
      return;
    }

    try {
      setDownloadingInvoice(true);
      await downloadOrderInvoicePdf(order.id);
      toastSuccess("Invoice PDF download started");
    } catch (apiError) {
      toastError(apiError.message || "Failed to download invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order?.id) {
      return;
    }

    try {
      setCancellingOrder(true);
      const response = await cancelOrder(order.id, cancelReason.trim());
      if (response.order) {
        setOrder(response.order);
      }
      toastSuccess("Order cancelled successfully");
      setShowCancelDialog(false);
      setCancelReason("");
    } catch (apiError) {
      toastError(apiError.message || "Failed to cancel order");
    } finally {
      setCancellingOrder(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading order detail...</p>;
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Link to="/my-orders" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <ArrowLeft className="h-4 w-4" />
          Back to my orders
        </Link>
        <StatusBanner tone="danger">{error || "Order not found"}</StatusBanner>
        <EmptyState
          title="This order is unavailable"
          description="The requested order could not be opened. Please return to the My Orders page and try another one."
        />
      </div>
    );
  }

  const canCancelOrder = !order.is_cancelled && ["placed", "confirmed", "packed"].includes(order.order_status);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/my-orders" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back to my orders
          </Link>
          <p className="mt-6 ui-eyebrow">Order Detail</p>
          <h1 className="mt-4 break-all font-display text-4xl leading-[0.95] text-ink sm:text-5xl xl:text-6xl">
            {order.order_number}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary">
            Placed on {formatOrderDate(order.created_at)}. Review the full order timeline, items, address snapshot, and payment summary in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-page px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
            {order.order_status}
          </span>
          <span className="rounded-full border border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">
            {order.payment_method}
          </span>
          {order.order_status === "delivered" ? (
            <Link to={`/returns/new/${order.id}`}>
              <Button
                type="button"
                variant="secondary"
                className="!px-5 !py-2.5 !text-[11px] !font-semibold !uppercase !tracking-[0.18em]"
              >
                Request Return
              </Button>
            </Link>
          ) : null}
          {order.payment_status === "paid" ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="!px-5 !py-2.5 !text-[11px] !font-semibold !uppercase !tracking-[0.18em]"
            >
              {downloadingInvoice ? "Preparing Invoice" : "Invoice PDF"}
            </Button>
          ) : null}
          {canCancelOrder ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCancelReason("");
                setShowCancelDialog(true);
              }}
              disabled={cancellingOrder}
              className="!px-5 !py-2.5 !text-[11px] !font-semibold !uppercase !tracking-[0.18em]"
            >
              Cancel Order
            </Button>
          ) : null}
        </div>
      </div>

      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft">
            <p className="ui-eyebrow">Tracking Timeline</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Order progress</h2>
            <p className="mt-4 text-sm leading-6 text-secondary">
              Follow each fulfillment milestone as the order moves from placement to delivery.
            </p>

            <div className="mt-8 overflow-x-auto pb-2">
              <div className="grid min-w-[920px] gap-5 md:grid-cols-5">
                {orderTimelineSteps.map((step, index) => {
                  const stepState = getTimelineStepState(order.order_status, step.key);
                  const isCompleted = stepState === "completed";
                  const isCurrent = stepState === "current";
                  const isCancelled = stepState === "cancelled";
                  const isUpcoming = stepState === "upcoming";

                  return (
                    <div key={step.key} className="relative">
                      {index < orderTimelineSteps.length - 1 ? (
                        <div
                          className={`absolute left-[calc(50%+20px)] top-5 hidden h-[2px] w-[calc(100%-8px)] md:block ${
                            isCancelled ? "bg-line" : isCompleted ? "bg-ink" : "bg-line"
                          }`}
                        />
                      ) : null}

                      <div
                        className={`relative rounded-[24px] border px-4 py-5 transition-colors ${
                          isCancelled
                            ? "border-line bg-page"
                            : isCurrent
                              ? "border-ink bg-page"
                              : isCompleted
                                ? "border-soft bg-page"
                                : "border-line bg-white"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                            isCancelled
                              ? "bg-white text-muted"
                              : isCurrent
                                ? "bg-ink text-white"
                                : isCompleted
                                  ? "bg-ink text-white"
                                  : "bg-page text-muted"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted">Step {index + 1}</p>
                        <p className={`mt-2 text-lg font-semibold ${isUpcoming || isCancelled ? "text-secondary" : "text-ink"}`}>
                          {step.label}
                        </p>
                        <p className="mt-2 text-sm text-secondary">
                          {isCancelled
                            ? "Order cancelled before completing this milestone."
                            : isCurrent
                              ? "Current stage"
                              : isCompleted
                                ? "Completed"
                                : "Pending"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.order_status === "cancelled" ? (
              <div className="mt-5 rounded-[24px] border border-line bg-page p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Order update</p>
                <p className="mt-2 text-base text-ink">
                  This order was cancelled, so the delivery timeline ended before shipment completion.
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="ui-eyebrow">Ordered Items</p>
                <h2 className="mt-3 font-display text-4xl text-ink">Products in this order</h2>
              </div>
              <p className="text-sm text-secondary">{order.items.length} line item(s)</p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr>
                    <th className="ui-table-head">Product</th>
                    <th className="ui-table-head">Category</th>
                    <th className="ui-table-head">Variant</th>
                    <th className="ui-table-head">Qty</th>
                    <th className="ui-table-head">Unit Price</th>
                    <th className="ui-table-head">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    const imageUrl = buildCatalogImageUrl(item.hero_image);

                    return (
                      <tr key={item.id} className="border-b border-line align-top">
                        <td className="ui-table-cell">
                          <div className="flex items-start gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-[16px] bg-page shrink-0">
                              {imageUrl ? (
                                <img src={imageUrl} alt={item.product_name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center px-2 text-center text-xs text-secondary">
                                  No image
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-ink">{item.product_name}</p>
                              <p className="mt-1 text-xs text-secondary">{item.brand_name || "Brand unavailable"}</p>
                              {item.sku ? <p className="mt-1 text-xs text-secondary">SKU {item.sku}</p> : null}
                            </div>
                          </div>
                        </td>
                        <td className="ui-table-cell">{item.category_name || "Uncategorized"}</td>
                        <td className="ui-table-cell">
                          {item.variant_id ? `${item.size || "-"} / ${item.color || "-"}` : "Base product"}
                        </td>
                        <td className="ui-table-cell">{item.quantity}</td>
                        <td className="ui-table-cell">{formatCatalogPrice(item.unit_price)}</td>
                        <td className="ui-table-cell font-semibold">{formatCatalogPrice(item.line_total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft">
            <p className="ui-eyebrow">Delivery Address</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Shipping snapshot</h2>

            <div className="mt-6 rounded-[24px] bg-page p-5">
              <p className="text-lg font-semibold text-ink">{order.shipping_address.full_name}</p>
              <p className="mt-2 text-sm text-secondary">Phone: {order.shipping_address.phone}</p>
              <p className="mt-4 text-sm leading-6 text-secondary">
                {order.shipping_address.address_line_1}
                {order.shipping_address.address_line_2 ? `, ${order.shipping_address.address_line_2}` : ""}
                {`, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.postal_code}, ${order.shipping_address.country}`}
              </p>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[32px] border border-soft bg-canvas p-6 shadow-sm">
          <p className="ui-eyebrow">Order Summary</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Final totals</h2>

          <div className="mt-8 space-y-4 rounded-[24px] bg-white p-5">
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Items</span>
              <span className="font-semibold text-ink">{order.item_count}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">{formatCatalogPrice(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Shipping</span>
              <span className="font-semibold text-ink">{formatCatalogPrice(order.shipping_fee)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Tax</span>
              <span className="font-semibold text-ink">{formatCatalogPrice(order.tax_total)}</span>
            </div>
            {Number(order.discount_total) > 0 ? (
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Discount</span>
                <span className="font-semibold text-ink">-{formatCatalogPrice(order.discount_total)}</span>
              </div>
            ) : null}
            <div className="border-t border-line pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Order total</p>
              <p className="mt-3 font-display text-4xl leading-none text-ink sm:text-5xl">
                {formatCatalogPrice(order.total_amount)}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-[24px] bg-white p-5">
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Payment Method</span>
              <span className="font-semibold text-ink">{order.payment_method}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Payment Status</span>
              <span className="font-semibold text-ink">{order.payment_status}</span>
            </div>
            {order.stripe_receipt_url ? (
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Stripe Receipt</span>
                <a href={order.stripe_receipt_url} target="_blank" rel="noreferrer" className="font-semibold text-ink underline underline-offset-4">
                  Open
                </a>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Order Status</span>
              <span className="font-semibold text-ink">{order.order_status}</span>
            </div>
            {cleanCancelReason(order.cancel_reason) ? (
              <div className="border-t border-line pt-3">
                <p className="text-sm text-secondary">Cancellation Reason</p>
                <p className="mt-1 text-sm font-medium text-ink">{cleanCancelReason(order.cancel_reason)}</p>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Shipment Status</span>
              <span className="font-semibold text-ink">{order.shipment?.shipment_status || "Pending setup"}</span>
            </div>
            {order.shipment?.tracking_number ? (
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Tracking Number</span>
                <span className="font-semibold text-ink">{order.shipment.tracking_number}</span>
              </div>
            ) : null}
            {order.shipment?.carrier ? (
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Carrier</span>
                <span className="font-semibold text-ink">{order.shipment.carrier}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {order.order_status === "delivered" ? (
              <Link to={`/returns/new/${order.id}`}>
                <Button className="w-full !text-sm !font-medium !normal-case !tracking-[0.02em]">
                  Start Return Request
                </Button>
              </Link>
            ) : null}
            {order.stripe_receipt_url ? (
              <a href={order.stripe_receipt_url} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="w-full !text-sm !font-medium !normal-case !tracking-[0.02em]">
                  Download Stripe Receipt
                </Button>
              </a>
            ) : null}
            <Link to="/notifications">
              <Button variant="secondary" className="w-full !text-sm !font-medium !normal-case !tracking-[0.02em]">
                Open Notifications
              </Button>
            </Link>
          </div>
        </aside>
      </div>

      <CancelOrderDialog
        order={showCancelDialog ? order : null}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onClose={() => {
          if (!cancellingOrder) {
            setShowCancelDialog(false);
            setCancelReason("");
          }
        }}
        onConfirm={handleCancelOrder}
        loading={cancellingOrder}
      />
    </div>
  );
}

export default OrderDetailPage;
