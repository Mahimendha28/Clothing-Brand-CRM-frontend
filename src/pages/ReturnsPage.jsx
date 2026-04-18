import { startTransition, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
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

function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Returns"
        title="Your return requests"
        description="Track approval, receipt, and refund progress for items you have sent back after delivery."
        actions={
          <Link to="/my-orders">
            <Button variant="secondary" className="!text-sm !font-medium !normal-case !tracking-[0.02em]">
              Back to My Orders
            </Button>
          </Link>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-5">
        {loading ? <p className="text-sm text-secondary">Loading returns...</p> : null}

        {!loading && !returns.length ? (
          <div className="space-y-5">
            <EmptyState
              title="No returns submitted"
              description="Delivered orders can be opened from My Orders whenever you need to request a return."
            />
            <Link to="/my-orders">
              <Button className="!text-sm !font-medium !normal-case !tracking-[0.02em]">Open My Orders</Button>
            </Link>
          </div>
        ) : null}

        {returns.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
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
                {returns.map((returnRequest) => (
                  <tr key={returnRequest.id} className="border-b border-line align-top">
                    <td className="px-5 py-4 text-ink">{returnRequest.order_number}</td>
                    <td className="px-5 py-4 text-secondary">{formatReturnDate(returnRequest.created_at)}</td>
                    <td className="px-5 py-4 text-ink">
                      <p className="font-medium">{returnRequest.reason}</p>
                      {returnRequest.customer_notes ? (
                        <p className="mt-1 text-xs leading-5 text-secondary">{returnRequest.customer_notes}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-ink">{returnRequest.item_count}</td>
                    <td className="px-5 py-4 text-ink uppercase">{returnRequest.return_status}</td>
                    <td className="px-5 py-4 text-secondary uppercase">{returnRequest.refund_status}</td>
                    <td className="px-5 py-4 text-ink">{formatCatalogPrice(returnRequest.refund_amount)}</td>
                    <td className="px-5 py-4 text-secondary">{returnRequest.refund_reference || "Pending"}</td>
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

export default ReturnsPage;
