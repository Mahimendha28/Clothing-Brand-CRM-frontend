import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { getInventoryReport } from "../services/reportService";

function InventoryDashboardPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getInventoryReport();

        if (!ignore) {
          setReport(response);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load inventory dashboard");
          setReport(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      ignore = true;
    };
  }, []);

  const summary = report?.summary || {};
  const lowStockItems = report?.low_stock_items || [];
  const categoryInventory = report?.category_inventory || [];
  const recentTransactions = report?.recent_transactions || [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inventory Dashboard"
        title="Inventory health and movement"
        description="Follow stock coverage, inspect the low-stock queue, and keep recent inventory transactions visible in the same report view."
        actions={
          <Link to="/inventory">
            <Button className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]">
              Open Inventory Desk
            </Button>
          </Link>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? <p className="text-sm text-secondary">Loading inventory dashboard...</p> : null}

      {!loading && !report ? (
        <EmptyState
          title="Inventory dashboard unavailable"
          description="Stock and transaction metrics will appear here once the report API is available."
        />
      ) : null}

      {report ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Active Variants"
              value={String(summary.total_variants || 0)}
              note="Sellable product variants currently tracked in inventory"
            />
            <MetricCard
              label="Units In Stock"
              value={String(summary.total_units || 0)}
              note="Total on-hand units across active variants"
            />
            <MetricCard
              label="Low Stock"
              value={String(summary.low_stock_count || 0)}
              note="Variants at or below the current low-stock threshold"
            />
            <MetricCard
              label="Out of Stock"
              value={String(summary.out_of_stock_count || 0)}
              note="Variants that need immediate replenishment"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="space-y-5">
              <div>
                <p className="ui-eyebrow">Low Stock List</p>
                <h2 className="mt-3 font-display text-3xl text-ink">Priority replenishment</h2>
              </div>

              {lowStockItems.length ? (
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div key={item.variant_id} className="rounded-card bg-canvas p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-ink">{item.product_name}</p>
                          <p className="text-sm text-secondary">
                            {item.category_name} • {item.sku} • {item.size} / {item.color}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#fff0eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a54435]">
                          {item.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No low-stock items"
                  description="Low-stock variants will appear here when stock falls below the alert threshold."
                />
              )}
            </SurfaceCard>

            <SurfaceCard className="space-y-5">
              <div>
                <p className="ui-eyebrow">Category Coverage</p>
                <h2 className="mt-3 font-display text-3xl text-ink">Units by category</h2>
              </div>

              {categoryInventory.length ? (
                <div className="space-y-4">
                  {categoryInventory.map((entry) => (
                    <div key={entry.category_name} className="rounded-card bg-canvas p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-ink">{entry.category_name}</p>
                          <p className="text-sm text-secondary">{entry.variant_count} variants</p>
                        </div>
                        <p className="text-lg font-semibold text-ink">{entry.units_in_stock} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No category stock yet"
                  description="Category inventory totals will appear once products and variants are available."
                />
              )}
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-5">
            <div>
              <p className="ui-eyebrow">Recent Transactions</p>
              <h2 className="mt-3 font-display text-3xl text-ink">Inventory movement log</h2>
            </div>

            {recentTransactions.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                    <tr>
                      <th className="ui-table-head">Date</th>
                      <th className="ui-table-head">Product</th>
                      <th className="ui-table-head">Type</th>
                      <th className="ui-table-head">Change</th>
                      <th className="ui-table-head">Stock After</th>
                      <th className="ui-table-head">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-line">
                        <td className="px-5 py-4 text-secondary">{new Date(transaction.created_at).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-ink">{transaction.product_name}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {transaction.sku} • {transaction.size} / {transaction.color}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-ink">{transaction.transaction_type}</td>
                        <td className={`px-5 py-4 font-semibold ${transaction.quantity_changed >= 0 ? "text-success" : "text-danger"}`}>
                          {transaction.quantity_changed >= 0 ? `+${transaction.quantity_changed}` : transaction.quantity_changed}
                        </td>
                        <td className="px-5 py-4 text-ink">{transaction.stock_after}</td>
                        <td className="px-5 py-4 text-secondary">{transaction.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No inventory transactions"
                description="Recent stock movements will appear here once opening stock or adjustments are recorded."
              />
            )}
          </SurfaceCard>
        </>
      ) : null}
    </div>
  );
}

export default InventoryDashboardPage;
