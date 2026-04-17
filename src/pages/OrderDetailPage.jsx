import { startTransition, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import { buildCatalogImageUrl, formatCatalogPrice } from "../services/catalogService";
import { getOrderById } from "../services/orderService";

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

function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/my-orders" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back to my orders
          </Link>
          <p className="mt-6 ui-eyebrow">Order Detail</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.92] text-ink">{order.order_number}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary">
            Placed on {formatOrderDate(order.created_at)}. This detail page shows the final COD order snapshot, item lines, delivery address, and totals.
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

            <div className="mt-8 grid gap-5 md:grid-cols-5">
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
                          isCancelled
                            ? "bg-line"
                            : isCompleted
                              ? "bg-ink"
                              : "bg-line"
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
                              ? "border-[#d7c29f] bg-[#fff7ea]"
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
                                ? "bg-[#1b1408] text-white"
                                : "bg-page text-muted"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                        Step {index + 1}
                      </p>
                      <p
                        className={`mt-2 text-lg font-semibold ${
                          isUpcoming || isCancelled ? "text-secondary" : "text-ink"
                        }`}
                      >
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
            <p className="ui-eyebrow">Ordered Items</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Products in this order</h2>

            <div className="mt-6 space-y-5">
              {order.items.map((item) => {
                const imageUrl = buildCatalogImageUrl(item.hero_image);

                return (
                  <div
                    key={item.id}
                    className="grid gap-4 rounded-[24px] border border-line bg-page p-4 md:grid-cols-[110px_1fr]"
                  >
                    <div className="overflow-hidden rounded-[18px] bg-white">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.product_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex min-h-[110px] items-end bg-[radial-gradient(circle_at_top,#ffffff_0%,#efe6d9_42%,#ddcdb6_100%)] p-4">
                          <p className="font-display text-2xl leading-none text-ink">{item.product_name}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
                          {item.category_name}
                        </p>
                        <h3 className="mt-2 font-display text-3xl leading-none text-ink">{item.product_name}</h3>
                        <p className="mt-3 text-sm text-secondary">{item.brand_name}</p>
                        <p className="mt-3 text-sm leading-6 text-secondary">
                          {item.variant_id
                            ? `Variant: ${item.size} / ${item.color}${item.sku ? ` - SKU ${item.sku}` : ""}`
                            : "Base product selection"}
                        </p>
                        <p className="mt-2 text-sm text-secondary">Quantity: {item.quantity}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-secondary">Line total</p>
                        <p className="mt-2 text-xl font-semibold text-ink">
                          {formatCatalogPrice(item.line_total)}
                        </p>
                        <p className="mt-2 text-sm text-secondary">
                          {formatCatalogPrice(item.unit_price)} each
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              <p className="mt-3 font-display text-5xl leading-none text-ink">
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
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {order.order_status === "delivered" ? (
              <Link to={`/returns/new/${order.id}`}>
                <Button className="w-full !text-sm !font-medium !normal-case !tracking-[0.02em]">
                  Start Return Request
                </Button>
              </Link>
            ) : null}
            <Link to="/notifications">
              <Button
                variant="secondary"
                className="w-full !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                Open Notifications
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default OrderDetailPage;
