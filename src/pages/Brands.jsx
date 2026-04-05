import { useEffect, useState } from "react";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand
} from "../services/authService";

function Brands() {
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await getBrands();
      setBrands(response.brands);
    } catch (apiError) {
      setError(apiError.message || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: ""
    });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await updateBrand(editingId, formData);
        setMessage("Brand updated successfully");
      } else {
        await createBrand(formData);
        setMessage("Brand created successfully");
      }

      resetForm();
      loadBrands();
    } catch (apiError) {
      setError(apiError.message || "Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.id);
    setFormData({
      name: brand.name,
      description: brand.description || ""
    });
  };

  const handleDelete = async (brandId) => {
    const confirmed = window.confirm("Do you want to delete this brand?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await deleteBrand(brandId);
      setMessage("Brand deleted successfully");
      loadBrands();
    } catch (apiError) {
      setError(apiError.message || "Failed to delete brand");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Brand Master"
        title="Brands"
        description="Create and maintain brand records through the same reusable admin surface and form system."
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <h2 className="font-display text-4xl text-ink">{editingId ? "Edit brand" : "Add brand"}</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <FormField label="Brand Name" name="name" value={formData.name} onChange={handleChange} />
            <FormField
              as="textarea"
              label="Description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />

            <StatusBanner tone="success">{message}</StatusBanner>
            <StatusBanner tone="danger">{error}</StatusBanner>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Brand" : "Create Brand"}
              </Button>
              {editingId ? (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="font-display text-4xl text-ink">Brand list</h2>
          {loading ? <p className="mt-4 text-sm text-secondary">Loading brands...</p> : null}

          <div className="mt-5 space-y-4">
            {!loading && brands.length === 0 ? (
              <EmptyState
                title="No brands yet"
                description="Create a brand record to start populating the master data section."
              />
            ) : null}

            {brands.map((brand) => (
              <div key={brand.id} className="rounded-card bg-canvas p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-ink">{brand.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-secondary">
                      {brand.description || "No description added yet."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => handleEdit(brand)}>
                      Edit
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleDelete(brand.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default Brands;
