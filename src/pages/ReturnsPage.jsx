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
          <div className="space-y-4">
            {returns.map((returnRequest) => (
              <article key={returnRequest.id} className="rounded-[24px] bg-page p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="ui-eyebrow">Order {returnRequest.order_number}</p>
                    <h2 className="mt-3 text-2xl font-semibold text-ink">{returnRequest.reason}</h2>
                    <p className="mt-3 text-sm leading-7 text-secondary">
                      Submitted on {formatReturnDate(returnRequest.created_at)} for {returnRequest.item_count} item(s).
                    </p>
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

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[20px] bg-white p-4">
                    <p className="ui-eyebrow">Refund Amount</p>
                    <p className="mt-3 text-xl font-semibold text-ink">
                      {formatCatalogPrice(returnRequest.refund_amount)}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-white p-4">
                    <p className="ui-eyebrow">Payment Status</p>
                    <p className="mt-3 text-xl font-semibold text-ink">{returnRequest.payment_status}</p>
                  </div>
                  <div className="rounded-[20px] bg-white p-4">
                    <p className="ui-eyebrow">Refund Reference</p>
                    <p className="mt-3 text-sm font-semibold text-ink">
                      {returnRequest.refund_reference || "Pending"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default ReturnsPage;
