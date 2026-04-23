import { startTransition, useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, FileText, RotateCcw, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import CancelOrderDialog from "../components/common/CancelOrderDialog";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import { useToast } from "../context/ToastContext";
import { buildCatalogImageUrl, formatCatalogPrice } from "../services/catalogService";
import { cancelOrder, downloadOrderInvoicePdf, getOrderById } from "../services/orderService";

const orderTimelineSteps = [
<<<<<<< HEAD
  { key: "placed", label: "Placed" },
=======
  { key: "placed", label: "Pending" },
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
  { key: "confirmed", label: "Confirmed" },
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

const formatAddressBlock = (address) => {
  if (!address) {
    return [];
  }

  return [
    address.address_line_1,
    address.address_line_2,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.postal_code, address.country].filter(Boolean).join(", ")
  ].filter(Boolean);
};

function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
<<<<<<< HEAD
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
=======
  const [cancelling, setCancelling] = useState(false);
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
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
<<<<<<< HEAD
    if (!order?.id) {
=======
    if (!order?.id || !window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
      return;
    }

    try {
<<<<<<< HEAD
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
=======
      setCancelling(true);
      const response = await cancelOrder(order.id);
      setOrder(response.order);
      toastSuccess("Order cancelled successfully");
    } catch (apiError) {
      toastError(apiError.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
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
  const canReturnOrder = order.order_status === "delivered";
  const canDownloadInvoice = order.payment_status === "paid";
  const hasStripeReceipt = Boolean(order.stripe_receipt_url);
  const shippingAddressLines = formatAddressBlock(order.shipping_address);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/my-orders" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back to my orders
          </Link>
          <p className="mt-4 ui-eyebrow">Order Detail</p>
          <h1 className="mt-2 break-all text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
            {order.order_number}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
            Placed on {formatOrderDate(order.created_at)}. Review items, progress, shipping, and payment details in one cleaner layout.
          </p>
        </div>

<<<<<<< HEAD
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-page px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
            {order.order_status}
=======
        <div className="flex flex-wrap gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            order.order_status === 'cancelled' 
              ? 'bg-red-50 text-red-600' 
              : 'bg-page text-ink'
          }`}>
            {order.status || order.order_status}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 
            order.payment_status === 'refunded' ? 'bg-orange-50 text-orange-700' : 
            'bg-input text-secondary'
          }`}>
            {order.payment_status}
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
          </span>
          <span className="rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
            {order.payment_method}
          </span>
<<<<<<< HEAD
=======
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
          {["placed", "confirmed", "packed"].includes(order.order_status) ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="border-red-200 !px-5 !py-2.5 !text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-red-600 hover:!bg-red-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          ) : null}
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
        </div>
      </div>

      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="ui-eyebrow">Order Actions</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">Manage this order</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
                  Only the actions you actually need are shown here.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {canDownloadInvoice ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleDownloadInvoice}
                    disabled={downloadingInvoice}
                    className="ui-compact-button gap-2 !px-4 !py-2.5 !normal-case"
                  >
                    <FileText className="h-4 w-4" />
                    {downloadingInvoice ? "Preparing invoice..." : "Download invoice"}
                  </Button>
                ) : null}
                {hasStripeReceipt ? (
                  <a href={order.stripe_receipt_url} target="_blank" rel="noreferrer">
                    <Button
                      type="button"
                      variant="secondary"
                      className="ui-compact-button gap-2 !px-4 !py-2.5 !normal-case"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Stripe receipt
                    </Button>
                  </a>
                ) : null}
                {canReturnOrder ? (
                  <Link to={`/returns/new/${order.id}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="ui-compact-button gap-2 !px-4 !py-2.5 !normal-case"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Return items
                    </Button>
                  </Link>
                ) : null}
                {!order.is_cancelled ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      canCancelOrder
                        ? () => {
                          setCancelReason("");
                          setShowCancelDialog(true);
                        }
                        : undefined
                    }
                    disabled={cancellingOrder || !canCancelOrder}
                    className="ui-compact-button gap-2 !px-4 !py-2.5 !normal-case"
                    title={canCancelOrder ? "Cancel order" : "Orders can only be cancelled before shipment"}
                  >
                    <XCircle className="h-4 w-4" />
                    {canCancelOrder ? (cancellingOrder ? "Cancelling..." : "Cancel order") : "Cancel unavailable"}
                  </Button>
                ) : null}
              </div>
            </div>

            {!canDownloadInvoice && !hasStripeReceipt && !canReturnOrder && order.is_cancelled ? (
              <div className="mt-4 rounded-[16px] border border-line bg-page px-4 py-4 text-sm text-secondary">
                No additional actions are available for this order right now.
              </div>
            ) : null}
          </section>

          <section className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <p className="ui-eyebrow">Tracking Timeline</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Order progress</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              A smaller progress view so the page stays compact.
            </p>

            <div className="mt-5 overflow-x-auto pb-1">
              <div className="flex min-w-[640px] gap-3">
                {orderTimelineSteps.map((step, index) => {
                  const stepState = getTimelineStepState(order.order_status, step.key);
                  const isCompleted = stepState === "completed";
                  const isCurrent = stepState === "current";
                  const isCancelled = stepState === "cancelled";

                  return (
                    <div
                      key={step.key}
                      className={`min-w-[116px] rounded-[16px] border px-3 py-3 ${isCancelled
                          ? "border-line bg-page"
                          : isCurrent
                            ? "border-ink bg-ink text-white"
                            : isCompleted
                              ? "border-slate-300 bg-slate-100"
                              : "border-line bg-white"
                        }`}
                    >
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${isCurrent ? "bg-white text-ink" : isCompleted ? "bg-ink text-white" : "bg-page text-muted"
                        }`}>
                        {index + 1}
                      </div>
                      <p className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] ${isCurrent ? "text-slate-200" : "text-muted"}`}>
                        Step {index + 1}
                      </p>
                      <p className={`mt-1.5 text-sm font-semibold ${isCurrent ? "text-white" : "text-ink"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.order_status === "cancelled" ? (
<<<<<<< HEAD
              <div className="mt-4 rounded-[16px] border border-line bg-page p-4">
                <p className="text-sm text-ink">This order was cancelled before delivery completion.</p>
=======
              <div className="mt-5 space-y-4 rounded-[24px] border border-red-100 bg-red-50 p-5 p-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-red-600">Cancellation status</p>
                  <p className="mt-2 text-lg font-medium text-red-900">
                    This order was cancelled.
                  </p>
                </div>
                {order.cancel_reason && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-red-600">Reason</p>
                    <p className="mt-1 text-sm text-red-700 leading-relaxed italic">
                      "{order.cancel_reason}"
                    </p>
                  </div>
                )}
                {order.cancelled_at && (
                  <p className="mt-2 text-[11px] text-red-400">
                    Cancelled on {formatOrderDate(order.cancelled_at)}
                  </p>
                )}
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
              </div>
            ) : null}
          </section>

          <section className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="ui-eyebrow">Ordered Items</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">Products in this order</h2>
              </div>
              <p className="text-sm text-secondary">{order.items.length} item(s)</p>
            </div>

            <div className="mt-5 space-y-3">
              {order.items.map((item) => {
                const imageUrl = buildCatalogImageUrl(item.hero_image);

                return (
                  <article key={item.id} className="rounded-[18px] border border-line bg-page p-4">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-white">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-secondary">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-ink">{item.product_name}</p>
                            <p className="mt-1 text-sm text-secondary">{item.brand_name || "Brand unavailable"}</p>
                            <p className="mt-1 text-xs text-secondary">
                              {item.category_name || "Uncategorized"} | {item.variant_id ? `${item.size || "-"} / ${item.color || "-"}` : "Base product"}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-ink">{formatCatalogPrice(item.line_total)}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-secondary">
                          <span>Qty {item.quantity}</span>
                          <span>Unit {formatCatalogPrice(item.unit_price)}</span>
                          {item.sku ? <span>SKU {item.sku}</span> : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <p className="ui-eyebrow">Delivery Address</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Shipping snapshot</h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[16px] bg-page p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Recipient</p>
                <p className="mt-2 text-base font-semibold text-ink">{order.shipping_address.full_name}</p>
                <p className="mt-1 text-sm text-secondary">{order.shipping_address.phone}</p>
              </div>
              <div className="rounded-[16px] bg-page p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Full Address</p>
                <div className="mt-2 space-y-1 text-sm leading-6 text-secondary">
                  {shippingAddressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[24px] border border-soft bg-canvas p-5 shadow-sm">
          <p className="ui-eyebrow">Order Summary</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Final totals</h2>

          <div className="mt-5 space-y-3 rounded-[18px] bg-white p-4">
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
            <div className="border-t border-line pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Order total</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{formatCatalogPrice(order.total_amount)}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-[18px] bg-white p-4">
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Payment Method</span>
              <span className="font-semibold text-ink">{order.payment_method}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Payment Status</span>
              <span className="font-semibold text-ink">{order.payment_status}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Order Status</span>
              <span className="font-semibold text-ink">{order.order_status}</span>
            </div>
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
            {cleanCancelReason(order.cancel_reason) ? (
              <div className="border-t border-line pt-3">
                <p className="text-sm text-secondary">Cancellation Reason</p>
                <p className="mt-1 text-sm font-medium text-ink">{cleanCancelReason(order.cancel_reason)}</p>
              </div>
            ) : null}
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
