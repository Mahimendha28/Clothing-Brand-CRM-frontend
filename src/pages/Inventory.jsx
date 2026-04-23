import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { getStoredUser } from "../utils/auth";
import {
  getInventoryLowStock,
  getInventorySummary,
  getInventoryTransactions
} from "../services/inventoryService";
import { getInventoryReport } from "../services/reportService";

const formatStatusLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

function Inventory() {
  const [activeTab, setActiveTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getStoredUser();
  const canOpenProductDetail = user?.role === "admin";

  const loadInventory = async (tab = activeTab) => {
    try {
      setLoading(true);
      setError("");

      if (tab === "summary") {
        const response = await getInventorySummary();
        setSummary(response.summary || null);
      }

      if (tab === "low-stock") {
        const response = await getInventoryLowStock();
        setLowStockItems(response.lowStockItems || []);
      }

      if (tab === "transactions") {
        const response = await getInventoryTransactions();
        setTransactions(response.transactions || []);
      }

      if (tab === "report") {
        const response = await getInventoryReport();
        setReport(response || null);
      }
    } catch (apiError) {
      setError(apiError.message || "Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "low-stock", label: "Low Stock" },
    { id: "transactions", label: "Transactions" },
    { id: "report", label: "Report" }
  ];

  const reportSummary = report?.summary || {};
  const reportLowStockItems = report?.low_stock_items || [];
  const reportCategoryInventory = report?.category_inventory || [];
  const reportRecentTransactions = report?.recent_transactions || [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inventory Desk"
        title="Inventory management"
        description="Review live stock health and manage movement logs in one consistent table-first workspace."
        actions={
          <div className="flex gap-3">
            <Link to="/inventory/adjustments/new">
              <Button className="ui-compact-button !min-w-[148px]">Record Stock</Button>
            </Link>
            <Button
              type="button"
              variant="secondary"
              className="ui-compact-button !min-w-[148px]"
              onClick={() => setActiveTab("report")}
            >
              Inventory Report
            </Button>
          </div>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-5 !p-5">
        <div className="flex flex-wrap gap-2 border-b border-line pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id ? "bg-ink text-white" : "bg-page text-secondary hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? <p className="text-sm text-secondary">Loading inventory data...</p> : null}

        {!loading && activeTab === "summary" && summary ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[16px] border border-line bg-page px-4 py-4">
              <p className="ui-eyebrow">Total Products</p>
              <p className="mt-2 text-[1.55rem] font-semibold leading-none text-ink">{summary.totalProducts}</p>
            </div>
            <div className="rounded-[16px] border border-line bg-page px-4 py-4">
              <p className="ui-eyebrow">Total Variants</p>
              <p className="mt-2 text-[1.55rem] font-semibold leading-none text-ink">{summary.totalVariants}</p>
            </div>
            <div className="rounded-[16px] border border-line bg-page px-4 py-4">
              <p className="ui-eyebrow">Units In Stock</p>
              <p className="mt-2 text-[1.55rem] font-semibold leading-none text-ink">{summary.totalStock}</p>
            </div>
            <div className="rounded-[16px] border border-[#f3d7cf] bg-[#fff7f3] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b44b3a]">Low Stock Variants</p>
              <p className="mt-2 text-[1.55rem] font-semibold leading-none text-[#9b3f32]">{summary.lowStockItems}</p>
            </div>
          </div>
        ) : null}

        {!loading && activeTab === "low-stock" ? (
          <div className="overflow-x-auto rounded-[18px] border border-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-page">
                <tr>
                  <th className="ui-table-head">Product</th>
                  <th className="ui-table-head">SKU</th>
                  <th className="ui-table-head">Variant</th>
                  <th className="ui-table-head">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length ? (
                  lowStockItems.map((item) => (
                    <tr key={item.variant_id} className="border-b border-line last:border-b-0">
                      <td className="ui-table-cell text-ink">
                        {canOpenProductDetail && item.product_id ? (
                          <Link to={`/admin/products/${item.product_id}`} className="hover:underline">
                            {item.product_name}
                          </Link>
                        ) : (
                          item.product_name
                        )}
                      </td>
                      <td className="ui-table-cell text-secondary">{item.sku}</td>
                      <td className="ui-table-cell text-secondary">{item.size} / {item.color}</td>
                      <td className="ui-table-cell">
                        <span className="rounded-full bg-[#fff0eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a54435]">
                          {item.stock} left
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-secondary">
                      No low-stock variants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && activeTab === "transactions" ? (
          <div className="overflow-x-auto rounded-[18px] border border-line">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-page">
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
                {transactions.length ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-line last:border-b-0">
                      <td className="ui-table-cell text-secondary">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                      <td className="ui-table-cell">
                        {canOpenProductDetail && transaction.product_id ? (
                          <Link to={`/admin/products/${transaction.product_id}`} className="font-medium text-ink hover:underline">
                            {transaction.product_name}
                          </Link>
                        ) : (
                          <p className="font-medium text-ink">{transaction.product_name}</p>
                        )}
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">{transaction.sku}</p>
                      </td>
                      <td className="ui-table-cell">
                        <span className="rounded-full bg-page px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                          {transaction.transaction_type.replace("_", " ")}
                        </span>
                      </td>
                      <td className={`ui-table-cell font-semibold ${transaction.quantity_changed > 0 ? "text-success" : "text-danger"}`}>
                        {transaction.quantity_changed > 0 ? `+${transaction.quantity_changed}` : transaction.quantity_changed}
                      </td>
                      <td className="ui-table-cell text-ink">{transaction.stock_after}</td>
                      <td className="ui-table-cell text-secondary">{transaction.notes || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-secondary">
                      No inventory transactions found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && activeTab === "report" ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[16px] border border-line bg-page px-4 py-4">
                <p className="ui-eyebrow">Active Variants</p>
                <p className="mt-2 text-[1.55rem] font-semibold leading-none text-ink">{reportSummary.total_variants || 0}</p>
              </div>
              <div className="rounded-[16px] border border-line bg-page px-4 py-4">
                <p className="ui-eyebrow">Units In Stock</p>
                <p className="mt-2 text-[1.55rem] font-semibold leading-none text-ink">{reportSummary.total_units || 0}</p>
              </div>
              <div className="rounded-[16px] border border-line bg-page px-4 py-4">
                <p className="ui-eyebrow">Low Stock</p>
                <p className="mt-2 text-[1.55rem] font-semibold leading-none text-ink">{reportSummary.low_stock_count || 0}</p>
              </div>
              <div className="rounded-[16px] border border-[#f3d7cf] bg-[#fff7f3] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b44b3a]">Out Of Stock</p>
                <p className="mt-2 text-[1.55rem] font-semibold leading-none text-[#9b3f32]">{reportSummary.out_of_stock_count || 0}</p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-3 rounded-[18px] border border-line p-4">
                <div>
                  <p className="ui-eyebrow">Low Stock List</p>
                  <h2 className="mt-1 text-base font-semibold text-ink">Priority replenishment</h2>
                </div>

                {reportLowStockItems.length ? (
                  reportLowStockItems.map((item) => (
                    <div key={item.variant_id} className="rounded-[16px] border border-line bg-page p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          {canOpenProductDetail && item.product_id ? (
                            <Link to={`/admin/products/${item.product_id}`} className="font-medium text-ink hover:underline">
                              {item.product_name}
                            </Link>
                          ) : (
                            <p className="font-medium text-ink">{item.product_name}</p>
                          )}
                          <p className="text-sm text-secondary">
                            {item.category_name} | {item.sku} | {item.size} / {item.color}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#fff0eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a54435]">
                          {item.stock} left
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-secondary">No low-stock items.</p>
                )}
              </div>

              <div className="space-y-3 rounded-[18px] border border-line p-4">
                <div>
                  <p className="ui-eyebrow">Category Coverage</p>
                  <h2 className="mt-1 text-base font-semibold text-ink">Units by category</h2>
                </div>

                {reportCategoryInventory.length ? (
                  reportCategoryInventory.map((entry) => (
                    <div key={entry.category_name} className="rounded-[16px] border border-line bg-page p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink">{entry.category_name}</p>
                          <p className="text-sm text-secondary">{entry.variant_count} variants</p>
                        </div>
                        <p className="text-lg font-semibold text-ink">{entry.units_in_stock} units</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-secondary">No category inventory data.</p>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-[18px] border border-line">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-page">
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
                  {reportRecentTransactions.length ? (
                    reportRecentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-line last:border-b-0">
                        <td className="ui-table-cell text-secondary">{new Date(transaction.created_at).toLocaleString()}</td>
                        <td className="ui-table-cell">
                          {canOpenProductDetail && transaction.product_id ? (
                            <Link to={`/admin/products/${transaction.product_id}`} className="font-medium text-ink hover:underline">
                              {transaction.product_name}
                            </Link>
                          ) : (
                            <p className="font-medium text-ink">{transaction.product_name}</p>
                          )}
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {transaction.sku} | {transaction.size} / {transaction.color}
                          </p>
                        </td>
                        <td className="ui-table-cell text-ink">{formatStatusLabel(transaction.transaction_type)}</td>
                        <td className={`ui-table-cell font-semibold ${transaction.quantity_changed >= 0 ? "text-success" : "text-danger"}`}>
                          {transaction.quantity_changed >= 0 ? `+${transaction.quantity_changed}` : transaction.quantity_changed}
                        </td>
                        <td className="ui-table-cell text-ink">{transaction.stock_after}</td>
                        <td className="ui-table-cell text-secondary">{transaction.notes || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-secondary">
                        No recent transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default Inventory;
