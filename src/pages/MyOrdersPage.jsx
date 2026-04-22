import { startTransition, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";

import CancelOrderDialog from "../components/common/CancelOrderDialog";
import CursorPagination from "../components/common/CursorPagination";
import CustomerTableToolbar from "../components/common/CustomerTableToolbar";
import EmptyState from "../components/common/EmptyState";
import IconActionButton from "../components/common/IconActionButton";
import StatusBanner from "../components/common/StatusBanner";
import Button from "../components/common/Button";
import { formatCatalogPrice } from "../services/catalogService";
import { getMyOrders } from "../services/orderService";

const formatOrderDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));

const formatStatusLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const PAGE_SIZE = 5;

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [cursor, setCursor] = useState(0);
  const orderLinkClass =
    "inline-flex items-center gap-2 text-sm font-semibold text-ink underline-offset-4 transition hover:text-accent hover:underline";

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

  const filteredOrders = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.order_number?.toLowerCase().includes(search) ||
        order.payment_method?.toLowerCase().includes(search) ||
        order.order_status?.toLowerCase().includes(search);

      const matchesStatus = !statusFilter || order.order_status === statusFilter;
      const matchesPayment = !paymentFilter || order.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, paymentFilter, searchValue, statusFilter]);

  const paginatedOrders = useMemo(
    () => filteredOrders.slice(cursor, cursor + PAGE_SIZE),
    [cursor, filteredOrders]
  );

  useEffect(() => {
    setCursor(0);
  }, [searchValue, statusFilter, paymentFilter]);

  useEffect(() => {
    if (cursor >= filteredOrders.length && cursor !== 0) {
      setCursor(Math.max(0, filteredOrders.length - PAGE_SIZE));
    }
  }, [cursor, filteredOrders.length]);

  if (loading) {
    return <p className="text-sm text-secondary">Loading your orders...</p>;
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ui-eyebrow">My Orders</p>
          <h1 className="ui-page-title mt-3">Order history.</h1>
          <p className="ui-page-copy mt-3 max-w-2xl">
            Review every order in one clean table. Open any row to see full order details, then manage invoice, Stripe receipt, cancel, and return actions from the detail page.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink shadow-soft transition hover:bg-page"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <StatusBanner tone="danger">{error}</StatusBanner>

      {!orders.length ? (
        <EmptyState
          title="No orders yet"
          description="Your placed orders will appear here once checkout is completed."
        />
      ) : (
        <div className="space-y-4 rounded-[20px] border border-line bg-white p-4 shadow-soft">
          <CustomerTableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Search by order number, method, or status"
            totalItems={orders.length}
            visibleItems={filteredOrders.length}
            itemLabel="orders"
            filters={[
              {
                key: "status",
                label: "Order status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "", label: "All statuses" },
                  { value: "placed", label: "Placed" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "packed", label: "Packed" },
                  { value: "shipped", label: "Shipped" },
                  { value: "delivered", label: "Delivered" },
                  { value: "cancelled", label: "Cancelled" }
                ]
              },
              {
                key: "payment",
                label: "Payment status",
                value: paymentFilter,
                onChange: setPaymentFilter,
                options: [
                  { value: "", label: "All payments" },
                  { value: "pending", label: "Pending" },
                  { value: "paid", label: "Paid" },
                  { value: "failed", label: "Failed" },
                  { value: "refunded", label: "Refunded" }
                ]
              }
            ]}
          />

          {!filteredOrders.length ? (
            <EmptyState
              title="No matching orders"
              description="Try a different search term or clear your filters to see more orders."
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-[18px] border border-line">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-page">
                    <tr>
                      <th className="ui-table-head">Order ID</th>
                      <th className="ui-table-head">Placed On</th>
                      <th className="ui-table-head">Items</th>
                      <th className="ui-table-head">Total</th>
                      <th className="ui-table-head">Payment</th>
                      <th className="ui-table-head">Status</th>
                      <th className="ui-table-head text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => {
                      return (
                        <tr key={order.id} className="border-b border-line align-top transition-colors hover:bg-page/70 last:border-b-0">
                          <td className="ui-table-cell">
                            <Link to={`/my-orders/${order.id}`} className={orderLinkClass}>
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="ui-table-cell text-secondary">{formatOrderDate(order.created_at)}</td>
                          <td className="ui-table-cell">
                            <p className="font-medium text-ink">
                              {order.item_count} {order.item_count === 1 ? "item" : "items"}
                            </p>
                          </td>
                          <td className="ui-table-cell font-medium">{formatCatalogPrice(order.total_amount)}</td>
                          <td className="ui-table-cell">
                            <div className="space-y-1.5">
                              <span className="inline-flex rounded-full bg-page px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
                                {order.payment_method}
                              </span>
                              <p className="text-xs text-secondary">{formatStatusLabel(order.payment_status)}</p>
                            </div>
                          </td>
                          <td className="ui-table-cell">
                            <span className="inline-flex rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
                              {formatStatusLabel(order.order_status)}
                            </span>
                          </td>
                          <td className="ui-table-cell text-right">
                            <Link to={`/my-orders/${order.id}`}>
                              <IconActionButton icon={Eye} label="View order" variant="secondary" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <CursorPagination
                cursor={cursor}
                pageSize={PAGE_SIZE}
                totalItems={filteredOrders.length}
                onPrevious={() => setCursor((current) => Math.max(0, current - PAGE_SIZE))}
                onNext={() => setCursor((current) => current + PAGE_SIZE)}
              />
            </>
          )}
        </div>
      )}

    </div>
  );
}

export default MyOrdersPage;
