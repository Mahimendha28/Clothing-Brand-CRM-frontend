import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { getCrmCustomerById } from "../services/crmService";

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value) => {
  if (!value) {
    return "No orders yet";
  }

  return new Date(value).toLocaleString();
};

function CustomerDetailLayout() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getCrmCustomerById(customerId);
      setCustomer(response.customer || null);
    } catch (apiError) {
      setError(apiError.message || "Failed to load customer detail");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  if (loading) {
    return <p className="text-sm text-secondary">Loading customer detail...</p>;
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link to="/customers" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          Back to customer list
        </Link>
        <StatusBanner tone="danger">{error || "Customer not found"}</StatusBanner>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CRM Customer Detail"
        title={customer.name}
        description="Review the customer profile, follow order history, and keep internal CRM notes attached to the same record."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/customers")}
              className="ui-compact-button !px-4 !py-2.5"
            >
              Back to List
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/customers/${customer.id}/notes`)}
              className="ui-compact-button !px-4 !py-2.5"
            >
              Add CRM Note
            </Button>
          </div>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SurfaceCard className="space-y-3">
          <p className="ui-eyebrow">Customer</p>
          <p className="text-2xl font-semibold text-ink">{customer.email}</p>
          <p className="text-sm text-secondary">{customer.status}</p>
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <p className="ui-eyebrow">Order Count</p>
          <p className="text-2xl font-semibold text-ink">{customer.order_count}</p>
          <p className="text-sm text-secondary">{customer.delivered_order_count} delivered</p>
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <p className="ui-eyebrow">Lifetime Value</p>
          <p className="text-2xl font-semibold text-ink">{formatCurrency(customer.total_spent)}</p>
          <p className="text-sm text-secondary">{customer.address_count} saved addresses</p>
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <p className="ui-eyebrow">Last Order</p>
          <p className="text-xl font-semibold text-ink">{formatDateTime(customer.last_order_at)}</p>
          <p className="text-sm text-secondary">Member since {new Date(customer.created_at).toLocaleDateString()}</p>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <NavLink
            end
            to={`/customers/${customer.id}`}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-ink text-white" : "bg-page text-secondary hover:text-ink"
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to={`/customers/${customer.id}/orders`}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-ink text-white" : "bg-page text-secondary hover:text-ink"
              }`
            }
          >
            Order History
          </NavLink>
          <NavLink
            to={`/customers/${customer.id}/notes`}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-ink text-white" : "bg-page text-secondary hover:text-ink"
              }`
            }
          >
            CRM Notes
          </NavLink>
        </div>

        <Outlet context={{ customer, refreshCustomer: loadCustomer }} />
      </SurfaceCard>
    </div>
  );
}

export default CustomerDetailLayout;
