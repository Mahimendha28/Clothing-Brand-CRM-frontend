import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import { getCrmCustomerOrders } from "../services/crmService";
import { getStoredUser } from "../utils/auth";

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

function CustomerOrderHistoryPage() {
  const { customer } = useOutletContext();
  const user = getStoredUser();
  const canOpenOrderDetail = user?.role === "admin" || user?.role === "sales_executive";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getCrmCustomerOrders(customer.id);

        if (!ignore) {
          setOrders(response.orders || []);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load customer order history");
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
  }, [customer.id]);

  return (
    <div className="space-y-4">
      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? <p className="text-sm text-secondary">Loading customer order history...</p> : null}

      {!loading && !orders.length ? (
        <EmptyState
          title="No orders for this customer"
          description="Once the customer places an order, the full order history will be listed here."
        />
      ) : null}

      {orders.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr>
                <th className="ui-table-head">Order</th>
                <th className="ui-table-head">Status</th>
                <th className="ui-table-head">Payment</th>
                <th className="ui-table-head">Shipment</th>
                <th className="ui-table-head">Items</th>
                <th className="ui-table-head">Total</th>
                <th className="ui-table-head">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-line">
                  <td className="px-5 py-4">
                    {canOpenOrderDetail ? (
                      <Link to={`/orders/${order.id}`} className="font-medium text-ink hover:underline">
                        {order.order_number}
                      </Link>
                    ) : (
                      <p className="font-medium text-ink">{order.order_number}</p>
                    )}
                    <p className="text-sm text-secondary">{order.payment_method.toUpperCase()}</p>
                  </td>
                  <td className="px-5 py-4 text-ink">{order.order_status}</td>
                  <td className="px-5 py-4">
                    <p className="text-ink">{order.payment_status}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {formatCurrency(order.subtotal)} subtotal
                    </p>
                  </td>
                  <td className="px-5 py-4 text-secondary">
                    <p>{order.shipment_status || "Not created"}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {order.tracking_number || "No tracking"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-ink">{order.item_count}</td>
                  <td className="px-5 py-4 text-ink">{formatCurrency(order.total_amount)}</td>
                  <td className="px-5 py-4 text-secondary">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default CustomerOrderHistoryPage;
