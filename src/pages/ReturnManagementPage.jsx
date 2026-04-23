import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { formatCatalogPrice } from "../services/catalogService";
import {
  approveReturn,
  getReturns,
  refundReturn,
  rejectReturn,
  updateReturnStatus
} from "../services/returnService";

const statusFilters = [
  { label: "All", value: "" },
  { label: "Requested", value: "requested" },
  { label: "Approved", value: "approved" },
  { label: "Received", value: "received" },
  { label: "Rejected", value: "rejected" }
];

function ReturnManagementPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const loadReturns = async (selectedStatus = statusFilter) => {
    try {
      setLoading(true);
      setError("");
      const response = await getReturns({ returnStatus: selectedStatus });
      setReturns(response.returns || []);
    } catch (apiError) {
      setError(apiError.message || "Failed to load return management data");
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns(statusFilter);
  }, [statusFilter]);

  const runAction = async (key, action) => {
    try {
      setPendingAction(key);
      setError("");
      setMessage("");
      const response = await action();
      setMessage(response.message || "Return updated successfully");
      await loadReturns(statusFilter);
    } catch (apiError) {
      setError(apiError.message || "Failed to update the return request");
    } finally {
      setPendingAction("");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Returns Desk"
        title="Staff return management"
        description="Review incoming return requests, confirm receipt, and close refunds while keeping stock and notifications aligned."
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-6">
        <div className="flex flex-wrap gap-3">
          {statusFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === filter.value ? "bg-ink text-white" : "bg-page text-secondary hover:text-ink"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? <p className="text-sm text-secondary">Loading return requests...</p> : null}

        {!loading && !returns.length ? (
          <EmptyState
            title="No return requests found"
            description="Customer return requests will appear here once delivered orders start generating aftercare activity."
          />
        ) : null}

        {returns.length ? (
          <div className="space-y-4">
            {returns.map((returnRequest) => {
              const approveKey = `approve-${returnRequest.id}`;
              const rejectKey = `reject-${returnRequest.id}`;
              const receiveKey = `receive-${returnRequest.id}`;
              const refundKey = `refund-${returnRequest.id}`;

              return (
                <article key={returnRequest.id} className="rounded-[24px] bg-page p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      {returnRequest.order_id || returnRequest.orderId ? (
                        <Link to={`/orders/${returnRequest.order_id || returnRequest.orderId}`} className="ui-eyebrow hover:underline">
                          {returnRequest.order_number}
                        </Link>
                      ) : (
                        <p className="ui-eyebrow">{returnRequest.order_number}</p>
                      )}
                      <h2 className="mt-3 text-2xl font-semibold text-ink">{returnRequest.customer_name}</h2>
                      <p className="mt-3 text-sm leading-7 text-secondary">{returnRequest.reason}</p>
                      {returnRequest.customer_notes ? (
                        <p className="mt-3 text-sm leading-7 text-secondary">{returnRequest.customer_notes}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
                        {returnRequest.return_status}
                      </span>
                      <span className="rounded-full border border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">
                        Refund {returnRequest.refund_status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-4">
                    <div className="rounded-[20px] bg-white p-4">
                      <p className="ui-eyebrow">Customer</p>
                      <p className="mt-3 text-sm font-semibold text-ink">{returnRequest.customer_email}</p>
                    </div>
                    <div className="rounded-[20px] bg-white p-4">
                      <p className="ui-eyebrow">Items</p>
                      <p className="mt-3 text-xl font-semibold text-ink">{returnRequest.item_count}</p>
                    </div>
                    <div className="rounded-[20px] bg-white p-4">
                      <p className="ui-eyebrow">Refund Amount</p>
                      <p className="mt-3 text-xl font-semibold text-ink">
                        {formatCatalogPrice(returnRequest.refund_amount)}
                      </p>
                    </div>
                    <div className="rounded-[20px] bg-white p-4">
                      <p className="ui-eyebrow">Payment</p>
                      <p className="mt-3 text-xl font-semibold text-ink">{returnRequest.payment_status}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {returnRequest.return_status === "requested" ? (
                      <>
                        <Button
                          type="button"
                          onClick={() => runAction(approveKey, () => approveReturn(returnRequest.id))}
                          disabled={pendingAction === approveKey}
                          className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                        >
                          {pendingAction === approveKey ? "Working..." : "Approve"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => runAction(rejectKey, () => rejectReturn(returnRequest.id))}
                          disabled={pendingAction === rejectKey}
                          className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                        >
                          {pendingAction === rejectKey ? "Working..." : "Reject"}
                        </Button>
                      </>
                    ) : null}

                    {returnRequest.return_status === "approved" ? (
                      <Button
                        type="button"
                        onClick={() => runAction(receiveKey, () => updateReturnStatus(returnRequest.id, "received"))}
                        disabled={pendingAction === receiveKey}
                        className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                      >
                        {pendingAction === receiveKey ? "Working..." : "Mark Received"}
                      </Button>
                    ) : null}

                    {["approved", "received"].includes(returnRequest.return_status) &&
                      returnRequest.refund_status === "pending" ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => runAction(refundKey, () => refundReturn(returnRequest.id))}
                        disabled={pendingAction === refundKey}
                        className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                      >
                        {pendingAction === refundKey ? "Working..." : "Refund"}
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default ReturnManagementPage;
