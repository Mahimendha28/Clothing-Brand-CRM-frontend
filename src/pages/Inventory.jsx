import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import {
  addOpeningStock,
  adjustInventoryStock,
  getInventoryLowStock,
  getInventorySummary,
  getInventoryTransactions
} from "../services/inventoryService";

const initialForm = {
  variantId: "",
  type: "opening_stock",
  quantity: "",
  notes: ""
};

function Inventory() {
  const [activeTab, setActiveTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);

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
    } catch (apiError) {
      setError(apiError.message || "Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory(activeTab);
  }, [activeTab]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (form.type === "opening_stock") {
        await addOpeningStock({
          variantId: Number(form.variantId),
          quantity: Number(form.quantity),
          notes: form.notes
        });
      } else {
        await adjustInventoryStock({
          variantId: Number(form.variantId),
          quantity: Number(form.quantity),
          type: form.type,
          notes: form.notes
        });
      }

      setMessage("Inventory updated successfully");
      setForm(initialForm);
      await loadInventory(activeTab);
    } catch (apiError) {
      setError(apiError.message || "Failed to update inventory");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "low-stock", label: "Low Stock" },
    { id: "transactions", label: "Transactions" }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inventory Desk"
        title="Inventory management"
        description="Review live stock health, check low-stock variants, and record opening stock or manual adjustments from one workspace."
        actions={
          <Link to="/dashboard/inventory">
            <Button variant="secondary" className="ui-compact-button !min-w-[148px]">
              Inventory Report
            </Button>
          </Link>
        }
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
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
                        <td className="ui-table-cell text-ink">{item.product_name}</td>
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
                          <p className="font-medium text-ink">{transaction.product_name}</p>
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
        </SurfaceCard>

        <SurfaceCard className="!p-5">
          <p className="ui-eyebrow">Stock Adjustment Form</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Record stock movement</h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="ui-label">Variant ID</label>
              <input
                name="variantId"
                type="number"
                min="1"
                required
                value={form.variantId}
                onChange={handleChange}
                className="ui-input"
                placeholder="Enter the variant id"
              />
            </div>

            <div>
              <label className="ui-label">Transaction Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="ui-input">
                <option value="opening_stock">Opening Stock</option>
                <option value="adjustment">Adjustment</option>
                <option value="restock">Restock</option>
                <option value="sale">Sale / Reduction</option>
              </select>
            </div>

            <div>
              <label className="ui-label">Quantity</label>
              <input
                name="quantity"
                type="number"
                required
                value={form.quantity}
                onChange={handleChange}
                className="ui-input"
                placeholder={form.type === "adjustment" ? "Use + or - values" : "Enter quantity"}
              />
            </div>

            <div>
              <label className="ui-label">Notes</label>
              <textarea
                name="notes"
                rows="4"
                value={form.notes}
                onChange={handleChange}
                className="ui-input min-h-[120px] resize-none"
                placeholder="Optional stock note"
              />
            </div>

            <Button type="submit" disabled={saving} className="ui-compact-button w-full">
              {saving ? "Saving..." : "Apply Inventory Update"}
            </Button>
          </form>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default Inventory;
