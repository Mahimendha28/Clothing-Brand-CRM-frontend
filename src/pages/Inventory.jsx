import { useEffect, useState } from "react";

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
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <SurfaceCard className="space-y-6">
          <div className="flex flex-wrap gap-3 border-b border-line pb-4">
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
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-card bg-canvas p-5">
                <p className="ui-eyebrow">Total Products</p>
                <p className="mt-3 text-3xl font-semibold text-ink">{summary.totalProducts}</p>
              </div>
              <div className="rounded-card bg-canvas p-5">
                <p className="ui-eyebrow">Total Variants</p>
                <p className="mt-3 text-3xl font-semibold text-ink">{summary.totalVariants}</p>
              </div>
              <div className="rounded-card bg-canvas p-5">
                <p className="ui-eyebrow">Units In Stock</p>
                <p className="mt-3 text-3xl font-semibold text-ink">{summary.totalStock}</p>
              </div>
              <div className="rounded-card bg-[#fff3f0] p-5">
                <p className="ui-eyebrow !text-[#b44b3a]">Low Stock Variants</p>
                <p className="mt-3 text-3xl font-semibold text-[#9b3f32]">{summary.lowStockItems}</p>
              </div>
            </div>
          ) : null}

          {!loading && activeTab === "low-stock" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
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
                      <tr key={item.variant_id} className="border-b border-line">
                        <td className="px-5 py-4 text-ink">{item.product_name}</td>
                        <td className="px-5 py-4 text-secondary">{item.sku}</td>
                        <td className="px-5 py-4 text-secondary">{item.size} / {item.color}</td>
                        <td className="px-5 py-4">
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
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
                  {transactions.length ? (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-line">
                        <td className="px-5 py-4 text-secondary">
                          {new Date(transaction.created_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-ink">{transaction.product_name}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">{transaction.sku}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-page px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                            {transaction.transaction_type.replace("_", " ")}
                          </span>
                        </td>
                        <td className={`px-5 py-4 font-semibold ${transaction.quantity_changed > 0 ? "text-success" : "text-danger"}`}>
                          {transaction.quantity_changed > 0 ? `+${transaction.quantity_changed}` : transaction.quantity_changed}
                        </td>
                        <td className="px-5 py-4 text-ink">{transaction.stock_after}</td>
                        <td className="px-5 py-4 text-secondary">{transaction.notes || "-"}</td>
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

        <SurfaceCard>
          <p className="ui-eyebrow">Stock Adjustment Form</p>
          <h2 className="mt-3 font-display text-3xl text-ink">Record stock movement</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

            <Button type="submit" disabled={saving} className="w-full !text-sm !font-medium !normal-case !tracking-[0.02em]">
              {saving ? "Saving..." : "Apply Inventory Update"}
            </Button>
          </form>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default Inventory;
