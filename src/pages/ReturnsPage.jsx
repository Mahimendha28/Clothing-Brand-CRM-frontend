import { startTransition, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import CursorPagination from "../components/common/CursorPagination";
import CustomerTableToolbar from "../components/common/CustomerTableToolbar";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import { getReturns } from "../services/returnService";

const formatReturnDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));

const PAGE_SIZE = 5;

function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [returnStatusFilter, setReturnStatusFilter] = useState("");
  const [refundStatusFilter, setRefundStatusFilter] = useState("");
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    let ignore = false;

    const loadReturns = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getReturns();

        if (!ignore) {
          startTransition(() => {
            setReturns(response.returns || []);
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load your returns");
          setReturns([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadReturns();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredReturns = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return returns.filter((returnRequest) => {
      const matchesSearch =
        !search ||
        returnRequest.order_number?.toLowerCase().includes(search) ||
        returnRequest.reason?.toLowerCase().includes(search) ||
        returnRequest.refund_reference?.toLowerCase().includes(search);

      const matchesReturnStatus = !returnStatusFilter || returnRequest.return_status === returnStatusFilter;
      const matchesRefundStatus = !refundStatusFilter || returnRequest.refund_status === refundStatusFilter;

      return matchesSearch && matchesReturnStatus && matchesRefundStatus;
    });
  }, [refundStatusFilter, returnStatusFilter, returns, searchValue]);

  const paginatedReturns = useMemo(
    () => filteredReturns.slice(cursor, cursor + PAGE_SIZE),
    [cursor, filteredReturns]
  );

  useEffect(() => {
    setCursor(0);
  }, [searchValue, returnStatusFilter, refundStatusFilter]);

  useEffect(() => {
    if (cursor >= filteredReturns.length && cursor !== 0) {
      setCursor(Math.max(0, filteredReturns.length - PAGE_SIZE));
    }
  }, [cursor, filteredReturns.length]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Returns"
        title="Your return requests"
        description="Track approval, receipt, and refund progress for items you have sent back after delivery."
        actions={
          <Link to="/my-orders">
            <Button variant="secondary" className="ui-compact-button">
              Back to My Orders
            </Button>
          </Link>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-4 !p-4 md:!p-5">
        {loading ? <p className="text-sm text-secondary">Loading returns...</p> : null}

        {!loading && !returns.length ? (
          <div className="space-y-5">
            <EmptyState
              title="No returns submitted"
              description="Delivered orders can be opened from My Orders whenever you need to request a return."
            />
            <Link to="/my-orders">
              <Button className="ui-compact-button">Open My Orders</Button>
            </Link>
          </div>
        ) : null}

        {returns.length ? (
          <div className="space-y-5">
            <CustomerTableToolbar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder="Search by order number, reason, or reference"
              totalItems={returns.length}
              visibleItems={filteredReturns.length}
              itemLabel="returns"
              filters={[
                {
                  key: "return-status",
                  label: "Return status",
                  value: returnStatusFilter,
                  onChange: setReturnStatusFilter,
                  options: [
                    { value: "", label: "All return statuses" },
                    { value: "requested", label: "Requested" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "received", label: "Received" }
                  ]
                },
                {
                  key: "refund-status",
                  label: "Refund status",
                  value: refundStatusFilter,
                  onChange: setRefundStatusFilter,
                  options: [
                    { value: "", label: "All refund statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "refunded", label: "Refunded" },
                    { value: "rejected", label: "Rejected" },
                    { value: "not_required", label: "Not Required" }
                  ]
                }
              ]}
            />

            {!filteredReturns.length ? (
              <EmptyState
                title="No matching returns"
                description="Adjust the search or filters to find the return request you need."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead>
                      <tr>
                        <th className="ui-table-head">Order</th>
                        <th className="ui-table-head">Created</th>
                        <th className="ui-table-head">Reason</th>
                        <th className="ui-table-head">Items</th>
                        <th className="ui-table-head">Return Status</th>
                        <th className="ui-table-head">Refund Status</th>
                        <th className="ui-table-head">Refund Amount</th>
                        <th className="ui-table-head">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReturns.map((returnRequest) => (
                        <tr key={returnRequest.id} className="border-b border-line align-top">
                          <td className="ui-table-cell font-medium">
                            {returnRequest.order_id || returnRequest.orderId ? (
                              <Link to={`/my-orders/${returnRequest.order_id || returnRequest.orderId}`} className="hover:underline">
                                {returnRequest.order_number}
                              </Link>
                            ) : (
                              returnRequest.order_number
                            )}
                          </td>
                          <td className="ui-table-cell text-secondary">{formatReturnDate(returnRequest.created_at)}</td>
                          <td className="ui-table-cell">
                            <p className="font-medium">{returnRequest.reason}</p>
                            {returnRequest.customer_notes ? (
                              <p className="mt-1 text-[12px] leading-5 text-secondary">{returnRequest.customer_notes}</p>
                            ) : null}
                          </td>
                          <td className="ui-table-cell">{returnRequest.item_count}</td>
                          <td className="ui-table-cell uppercase">{returnRequest.return_status}</td>
                          <td className="ui-table-cell uppercase text-secondary">{returnRequest.refund_status}</td>
                          <td className="ui-table-cell">{formatCatalogPrice(returnRequest.refund_amount)}</td>
                          <td className="ui-table-cell text-secondary">{returnRequest.refund_reference || "Pending"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <CursorPagination
                  cursor={cursor}
                  pageSize={PAGE_SIZE}
                  totalItems={filteredReturns.length}
                  onPrevious={() => setCursor((current) => Math.max(0, current - PAGE_SIZE))}
                  onNext={() => setCursor((current) => current + PAGE_SIZE)}
                />
              </>
            )}
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default ReturnsPage;
