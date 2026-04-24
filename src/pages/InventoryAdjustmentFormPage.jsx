import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { addOpeningStock, adjustInventoryStock } from "../services/inventoryService";

const initialForm = {
  variantId: "",
  type: "opening_stock",
  quantity: "",
  notes: ""
};

function InventoryAdjustmentFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

      navigate("/inventory");
    } catch (apiError) {
      setError(apiError.message || "Failed to update inventory");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inventory Desk"
        title="Record stock movement"
        description="Use this dedicated form to create opening stock entries or manual stock adjustments, then return to the inventory table."
        actions={
          <Link to="/inventory">
            <Button variant="secondary">Back to inventory list</Button>
          </Link>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="!p-5 md:!p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
              placeholder="Enter variant id"
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

          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
            <Button type="submit" disabled={saving} className="ui-compact-button">
              {saving ? "Saving..." : "Save Inventory Entry"}
            </Button>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}

export default InventoryAdjustmentFormPage;
