import { startTransition, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import { useToast } from "../context/ToastContext";
import { formatCatalogPrice } from "../services/catalogService";
import { cancelOrder, downloadOrderInvoicePdf, getMyOrders } from "../services/orderService";

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
  const [pendingInvoiceOrderId, setPendingInvoiceOrderId] = useState(null);
  const { toastError, toastSuccess } = useToast();

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

  const handleDownloadInvoice = async (orderId) => {
    try {
      setPendingInvoiceOrderId(orderId);
      await downloadOrderInvoicePdf(orderId);
      toastSuccess("Invoice PDF download started");
    } catch (apiError) {
      toastError(apiError.message || "Failed to download invoice");
    } finally {
      setPendingInvoiceOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await cancelOrder(orderId);
      toastSuccess("Order cancelled successfully");
      // Refresh list
      const response = await getMyOrders();
      setOrders(response.orders || []);
    } catch (apiError) {
      toastError(apiError.message || "Failed to cancel order");
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading your orders...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ui-eyebrow">My Orders</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.92] text-ink">Order history.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary">
            View all orders in table format, open details, request returns, and download paid invoice PDFs.
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
            description="Your placed orders will appear here once checkout is completed."
          />
          <Link to="/products">
            <Button className="!text-sm !font-medium !normal-case !tracking-[0.02em]">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-[30px] border border-line bg-white p-5 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead>
                <tr>
                  <th className="ui-table-head">Order Number</th>
                  <th className="ui-table-head">Placed On</th>
                  <th className="ui-table-head">Items</th>
                  <th className="ui-table-head">Total</th>
                  <th className="ui-table-head">Payment</th>
                  <th className="ui-table-head">Status</th>
                  <th className="ui-table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const canDownloadInvoice = order.payment_status === "paid";
                  const hasStripeReceipt = order.payment_method === "stripe" && !!order.stripe_receipt_url;

                  return (
                    <tr key={order.id} className="border-b border-line align-top">
                      <td className="px-5 py-4 font-semibold text-ink">{order.order_number}</td>
                      <td className="px-5 py-4 text-secondary">{formatOrderDate(order.created_at)}</td>
                      <td className="px-5 py-4 text-ink">{order.item_count}</td>
                      <td className="px-5 py-4 text-ink">{formatCatalogPrice(order.total_amount)}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-ink uppercase">{order.payment_method}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          order.order_status === 'cancelled' 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-page text-ink'
                        }`}>
                          {order.status || order.order_status}
                        </span>
                        <div className="mt-2 flex flex-col gap-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Payment</p>
                          <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                            order.payment_status === 'paid' ? 'bg-green-50 text-green-700' :
                            order.payment_status === 'refunded' ? 'bg-orange-50 text-orange-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/my-orders/${order.id}`}>
                            <Button
                              variant="secondary"
                              className="!px-4 !py-2 !text-xs !font-medium !normal-case !tracking-[0.02em]"
                            >
                              View
                            </Button>
                          </Link>
                          {order.order_status === "delivered" ? (
                            <Link to={`/returns/new/${order.id}`}>
                              <Button className="!px-4 !py-2 !text-xs !font-medium !normal-case !tracking-[0.02em]">
                                Return
                              </Button>
                            </Link>
                          ) : null}
                          {["placed", "confirmed", "packed"].includes(order.order_status) ? (
                            <Button
                              variant="outline"
                              onClick={() => handleCancelOrder(order.id)}
                              className="!px-4 !py-2 !text-xs !font-medium !normal-case !tracking-[0.02em] !text-red-500 border-red-100 hover:!bg-red-50"
                            >
                              Cancel
                            </Button>
                          ) : null}
                          {canDownloadInvoice ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleDownloadInvoice(order.id)}
                              disabled={pendingInvoiceOrderId === order.id}
                              className="!px-4 !py-2 !text-xs !font-medium !normal-case !tracking-[0.02em]"
                            >
                              {pendingInvoiceOrderId === order.id ? "Preparing..." : "Invoice PDF"}
                            </Button>
                          ) : null}
                          {hasStripeReceipt ? (
                            <a
                              href={order.stripe_receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-full border border-line bg-white px-4 py-2 text-xs font-medium text-ink transition hover:bg-page"
                            >
                              Stripe Receipt
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrdersPage;
