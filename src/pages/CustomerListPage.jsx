import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { getCrmCustomers, getInactiveCustomers, getTopBuyerCustomers } from "../services/crmService";

const segmentFilters = [
  { value: "all", label: "All Customers" },
  { value: "inactive", label: "Inactive Customers" },
  { value: "top-buyers", label: "Top Buyers" }
];

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) {
    return "No orders yet";
  }

  return new Date(value).toLocaleDateString();
};

function CustomerListPage() {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [segmentNote, setSegmentNote] = useState("");

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchInput(query);
    setAppliedSearch(query);
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;

    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");
        setSegmentNote("");

        let response;

        if (activeFilter === "inactive") {
          response = await getInactiveCustomers({ q: appliedSearch });
          if (!ignore) {
            setSegmentNote(response.rule || "");
          }
        } else if (activeFilter === "top-buyers") {
          response = await getTopBuyerCustomers({ q: appliedSearch, limit: 12 });
          if (!ignore) {
            setSegmentNote(
              response.limit ? `Showing the top ${response.limit} customers ranked by total spend.` : ""
            );
          }
        } else {
          response = await getCrmCustomers({ q: appliedSearch });
        }

        if (!ignore) {
          setCustomers(response.customers || []);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load CRM customers");
          setCustomers([]);
          setSegmentNote("");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      ignore = true;
    };
  }, [activeFilter, appliedSearch]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CRM Layer"
        title="Customer list"
        description="Review customer relationships, switch between CRM segments, and open a full customer record with orders and internal notes."
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            {segmentFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeFilter === filter.value ? "bg-ink text-white" : "bg-page text-secondary hover:text-ink"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex w-full max-w-xl gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search customers by name or email"
              className="ui-input"
            />
            <Button type="submit" className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]">
              Search
            </Button>
          </form>
        </div>

        <StatusBanner>{segmentNote}</StatusBanner>

        {loading ? <p className="text-sm text-secondary">Loading CRM customers...</p> : null}

        {!loading && !customers.length ? (
          <EmptyState
            title="No customers found"
            description="Customer records will appear here once your storefront activity and CRM notes start growing."
          />
        ) : null}

        {customers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr>
                  <th className="ui-table-head">Customer</th>
                  <th className="ui-table-head">Account</th>
                  <th className="ui-table-head">Orders</th>
                  <th className="ui-table-head">Total Spent</th>
                  <th className="ui-table-head">Last Order</th>
                  <th className="ui-table-head">Address Count</th>
                  <th className="ui-table-head">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-line">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{customer.name}</p>
                      <p className="text-sm text-secondary">{customer.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          customer.status === "active"
                            ? "bg-[#edf8f1] text-[#1f7a47]"
                            : "bg-[#fff0eb] text-[#a54435]"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink">{customer.order_count}</td>
                    <td className="px-5 py-4 text-ink">{formatCurrency(customer.total_spent)}</td>
                    <td className="px-5 py-4 text-secondary">
                      <p>{formatDate(customer.last_order_at)}</p>
                      {activeFilter === "inactive" && customer.inactive_days !== null ? (
                        <p className="text-xs uppercase tracking-[0.14em] text-muted">
                          {customer.inactive_days} days inactive
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-secondary">{customer.address_count}</td>
                    <td className="px-5 py-4">
                      <Link to={`/customers/${customer.id}`}>
                        <Button
                          variant="secondary"
                          className="!px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                        >
                          Open Detail
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default CustomerListPage;
