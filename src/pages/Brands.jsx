import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { deleteBrand, getBrands } from "../services/authService";

function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getBrands();
      setBrands(response.brands || []);
    } catch (apiError) {
      setError(apiError.message || "Failed to load brands");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleDelete = async (brandId) => {
    const confirmed = window.confirm("Do you want to delete this brand?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(brandId);
      setError("");
      setMessage("");
      await deleteBrand(brandId);
      setBrands((current) => current.filter((brand) => brand.id !== brandId));
      setMessage("Brand deleted successfully");
    } catch (apiError) {
      setError(apiError.message || "Failed to delete brand");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Brand Master"
        title="Brands"
        description="Manage brand records in a consistent table workflow with dedicated create and edit pages."
        actions={
          <Link to="/admin/brands/create">
            <Button className="ui-compact-button !min-w-[148px]">Create Brand</Button>
          </Link>
        }
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-5 !p-5 md:!p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[16px] border border-line bg-page px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Total Brands</p>
            <p className="mt-2 text-xl font-semibold text-ink">{brands.length}</p>
            <p className="mt-1 text-sm text-secondary">All brand records currently available in catalog master data.</p>
          </div>
          <div className="rounded-[16px] border border-line bg-page px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Workflow</p>
            <p className="mt-2 text-xl font-semibold text-ink">List First</p>
            <p className="mt-1 text-sm text-secondary">Form actions have moved to dedicated create and edit pages.</p>
          </div>
          <div className="rounded-[16px] border border-line bg-page px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Consistency</p>
            <p className="mt-2 text-xl font-semibold text-ink">Order Style</p>
            <p className="mt-1 text-sm text-secondary">Page layout now follows the same table pattern used in Orders.</p>
          </div>
        </div>

        {loading ? <p className="text-sm text-secondary">Loading brands...</p> : null}

        {!loading && !brands.length ? (
          <EmptyState
            title="No brands yet"
            description="Use Create Brand to add your first catalog brand."
          />
        ) : null}

        {brands.length ? (
          <div className="overflow-x-auto rounded-[18px] border border-line">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-page">
                <tr>
                  <th className="ui-table-head">Brand</th>
                  <th className="ui-table-head">Description</th>
                  <th className="ui-table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="border-b border-line align-top last:border-b-0">
                    <td className="ui-table-cell font-medium text-ink">{brand.name}</td>
                    <td className="ui-table-cell text-secondary">{brand.description || "No description added yet."}</td>
                    <td className="ui-table-cell">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/admin/brands/${brand.id}/edit`}>
                          <Button type="button" variant="secondary">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDelete(brand.id)}
                          disabled={deletingId === brand.id}
                        >
                          {deletingId === brand.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </td>
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

export default Brands;
