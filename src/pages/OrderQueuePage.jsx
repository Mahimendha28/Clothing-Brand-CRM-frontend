import { startTransition, useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import Button from "../components/common/Button";
import CursorPagination from "../components/common/CursorPagination";
import CustomerTableToolbar from "../components/common/CustomerTableToolbar";
import EmptyState from "../components/common/EmptyState";
import IconActionButton from "../components/common/IconActionButton";
import PageHeader from "../components/common/PageHeader";
import StatusPill from "../components/common/StatusPill";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import { getOrders } from "../services/orderService";

<<<<<<< HEAD
const PAGE_SIZE = 8;

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value))
    : "Not available";

const formatStatusLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const CompactSummaryCard = ({ label, value, note }) => (
  <div className="rounded-[16px] border border-line bg-page px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
    <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
    <p className="mt-1 text-sm text-secondary">{note}</p>
  </div>
);
=======
const statusFilters = [
  { value: "", label: "All" },
  { value: "placed", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776

function OrderQueuePage() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [shipmentFilter, setShipmentFilter] = useState("");
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getOrders();

        if (!ignore) {
          startTransition(() => {
            setOrders(response.orders || []);
          });
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
  }, []);

  const filteredOrders = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.order_number?.toLowerCase().includes(search) ||
        order.customer_name?.toLowerCase().includes(search) ||
        order.payment_method?.toLowerCase().includes(search) ||
        order.tracking_number?.toLowerCase().includes(search);

      const matchesStatus = !statusFilter || order.order_status === statusFilter;
      const matchesPayment = !paymentFilter || order.payment_status === paymentFilter;
      const matchesShipment = !shipmentFilter || (order.shipment_status || "not_created") === shipmentFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesShipment;
    });
  }, [orders, paymentFilter, searchValue, shipmentFilter, statusFilter]);

  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const paginatedOrders = useMemo(
    () => filteredOrders.slice(cursor, cursor + PAGE_SIZE),
    [cursor, filteredOrders]
  );

  const summary = useMemo(() => {
    const activeOrders = orders.filter((order) =>
      ["placed", "confirmed", "packed", "shipped"].includes(order.order_status)
    ).length;
    const pendingPayments = orders.filter((order) => order.payment_status === "pending").length;
    const waitingShipment = orders.filter(
      (order) => !order.shipment_status || ["pending", "processing"].includes(order.shipment_status)
    ).length;

    return {
      activeOrders,
      pendingPayments,
      waitingShipment
    };
  }, [orders]);

  useEffect(() => {
    setCursor(0);
  }, [searchValue, statusFilter, paymentFilter, shipmentFilter]);

  useEffect(() => {
    if (cursor >= filteredOrders.length && cursor !== 0) {
      setCursor(Math.max(0, filteredOrders.length - PAGE_SIZE));
    }
  }, [cursor, filteredOrders.length]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Order Desk"
        title="Orders"
        description="A cleaner table view with search, filters, and direct actions placed where the team expects them."
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-4 !p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <CompactSummaryCard
            label="Active Orders"
            value={String(summary.activeOrders)}
            note="Orders currently moving through the queue."
          />
          <CompactSummaryCard
            label="Pending Payments"
            value={String(summary.pendingPayments)}
            note="Orders still waiting on payment confirmation."
          />
          <CompactSummaryCard
            label="Shipment Follow-up"
            value={String(summary.waitingShipment)}
            note="Orders still needing shipment progress."
          />
        </div>

        <CustomerTableToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search by order number, customer, method, or tracking"
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
            },
            {
              key: "shipment",
              label: "Shipment status",
              value: shipmentFilter,
              onChange: setShipmentFilter,
              options: [
                { value: "", label: "All shipments" },
                { value: "not_created", label: "Not created" },
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" }
              ]
            }
          ]}
        />

        {loading ? <p className="text-sm text-secondary">Loading orders...</p> : null}

        {!loading && !filteredOrders.length ? (
          <EmptyState
            title="No matching orders"
            description="Try a different search term or clear one of the filters to bring more orders into view."
          />
        ) : null}

<<<<<<< HEAD
        {filteredOrders.length ? (
          <>
            <div className="overflow-x-auto rounded-[18px] border border-line">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="bg-page">
                  <tr>
                    <th className="ui-table-head">Order</th>
                    <th className="ui-table-head">Customer</th>
                    <th className="ui-table-head">Placed On</th>
                    <th className="ui-table-head">Total</th>
                    <th className="ui-table-head">Payment</th>
                    <th className="ui-table-head">Order Status</th>
                    <th className="ui-table-head">Shipment</th>
                    <th className="ui-table-head">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="border-b border-line align-top last:border-b-0">
                      <td className="ui-table-cell">
                        <Link to={`/orders/${order.id}`} className="font-semibold text-ink hover:underline">
                          {order.order_number}
                        </Link>
                        <p className="mt-1 text-xs text-secondary">
                          {order.item_count} {order.item_count === 1 ? "item" : "items"}
                        </p>
                      </td>
                      <td className="ui-table-cell">
                        <p className="font-medium text-ink">{order.customer_name}</p>
                        <p className="mt-1 text-xs text-secondary">{order.payment_method?.toUpperCase() || "N/A"}</p>
                      </td>
                      <td className="ui-table-cell text-secondary">{formatDate(order.created_at)}</td>
                      <td className="ui-table-cell font-medium">{formatCatalogPrice(order.total_amount)}</td>
                      <td className="ui-table-cell">
                        <StatusPill value={formatStatusLabel(order.payment_status)} />
                      </td>
                      <td className="ui-table-cell">
                        <StatusPill value={formatStatusLabel(order.order_status)} />
                      </td>
                      <td className="ui-table-cell">
                        <StatusPill value={formatStatusLabel(order.shipment_status || "not_created")} />
                        <p className="mt-1 text-xs text-secondary">{order.tracking_number || "No tracking yet"}</p>
                      </td>
                      <td className="ui-table-cell">
                        <Link to={`/orders/${order.id}`}>
                          <IconActionButton icon={Eye} label="View order" variant="secondary" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
=======
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
                      <p className="mt-3 text-xl font-semibold text-ink uppercase">{order.status || order.order_status}</p>
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
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776

            <CursorPagination
              cursor={cursor}
              pageSize={PAGE_SIZE}
              totalItems={filteredOrders.length}
              onPrevious={() => setCursor((current) => Math.max(0, current - PAGE_SIZE))}
              onNext={() => setCursor((current) => current + PAGE_SIZE)}
            />
          </>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default OrderQueuePage;
