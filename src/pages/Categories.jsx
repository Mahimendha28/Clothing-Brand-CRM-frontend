import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { isAllowedTopLevelCategory } from "../constants/categories";
import { deleteCategory, getCategories } from "../services/authService";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const visibleCategories = useMemo(
    () => categories.filter((category) => isAllowedTopLevelCategory(category.name)),
    [categories]
  );

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getCategories();
      setCategories(response.categories || []);
    } catch (apiError) {
      setError(apiError.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm("Do you want to delete this category?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(categoryId);
      setError("");
      setMessage("");
      await deleteCategory(categoryId);
      setCategories((current) => current.filter((category) => category.id !== categoryId));
      setMessage("Category deleted successfully");
    } catch (apiError) {
      setError(apiError.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Category Master"
        title="Categories"
        description="Manage category records in a consistent table workflow with dedicated create and edit pages."
        actions={
          <Link to="/admin/categories/create">
            <Button className="ui-compact-button !min-w-[148px]">Create Category</Button>
          </Link>
        }
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-5 !p-5 md:!p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[16px] border border-line bg-page px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Total Categories</p>
            <p className="mt-2 text-xl font-semibold text-ink">{visibleCategories.length}</p>
            <p className="mt-1 text-sm text-secondary">Allowed storefront categories currently configured.</p>
          </div>
          <div className="rounded-[16px] border border-line bg-page px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Allowed Set</p>
            <p className="mt-2 text-xl font-semibold text-ink">Men, Women, Kids</p>
            <p className="mt-1 text-sm text-secondary">Only top-level categories are available in this module.</p>
          </div>
          <div className="rounded-[16px] border border-line bg-page px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Workflow</p>
            <p className="mt-2 text-xl font-semibold text-ink">List First</p>
            <p className="mt-1 text-sm text-secondary">Create and edit now open in a dedicated form page.</p>
          </div>
        </div>

        {loading ? <p className="text-sm text-secondary">Loading categories...</p> : null}

        {!loading && !visibleCategories.length ? (
          <EmptyState
            title="No categories yet"
            description="Use Create Category to add Men, Women, or Kids."
          />
        ) : null}

        {visibleCategories.length ? (
          <div className="overflow-x-auto rounded-[18px] border border-line">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-page">
                <tr>
                  <th className="ui-table-head">Category</th>
                  <th className="ui-table-head">Description</th>
                  <th className="ui-table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map((category) => (
                  <tr key={category.id} className="border-b border-line align-top last:border-b-0">
                    <td className="ui-table-cell font-medium text-ink">{category.name}</td>
                    <td className="ui-table-cell text-secondary">{category.description || "No description added yet."}</td>
                    <td className="ui-table-cell">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/admin/categories/${category.id}/edit`}>
                          <Button type="button" variant="secondary">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          disabled={deletingId === category.id}
                        >
                          {deletingId === category.id ? "Deleting..." : "Delete"}
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

export default Categories;
