import { useEffect, useState } from "react";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { ALLOWED_TOP_LEVEL_CATEGORIES, isAllowedTopLevelCategory } from "../constants/categories";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from "../services/authService";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const visibleCategories = categories.filter((category) => isAllowedTopLevelCategory(category.name));

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.categories);
    } catch (apiError) {
      setError(apiError.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
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

    if (!isAllowedTopLevelCategory(formData.name)) {
      setError("Only Men, Women, and Kids categories are allowed.");
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        setMessage("Category updated successfully");
      } else {
        await createCategory(formData);
        setMessage("Category created successfully");
      }

      resetForm();
      loadCategories();
    } catch (apiError) {
      setError(apiError.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || ""
    });
  };

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm("Do you want to delete this category?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await deleteCategory(categoryId);
      setMessage("Category deleted successfully");
      loadCategories();
    } catch (apiError) {
      setError(apiError.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Category Master"
        title="Categories"
        description="Maintain the three storefront categories used across the admin workspace."
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <h2 className="text-base font-semibold text-ink">{editingId ? "Edit category" : "Add category"}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <FormField
              label="Category Name"
              as="select"
              name="name"
              value={formData.name}
              onChange={handleChange}
              options={[
                { value: "", label: "Select category" },
                ...ALLOWED_TOP_LEVEL_CATEGORIES.map((category) => ({
                  value: category,
                  label: category
                }))
              ]}
            />
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
                {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
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
          <h2 className="text-base font-semibold text-ink">Category list</h2>
          {loading ? <p className="mt-4 text-sm text-secondary">Loading categories...</p> : null}

          <div className="mt-4 space-y-3">
            {!loading && visibleCategories.length === 0 ? (
              <EmptyState
                title="No categories yet"
                description="Create Men, Women, or Kids to structure the catalog."
              />
            ) : null}

            {visibleCategories.map((category) => (
              <div key={category.id} className="rounded-card bg-canvas p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-ink">{category.name}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-secondary">
                      {category.description || "No description added yet."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => handleEdit(category)}>
                      Edit
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleDelete(category.id)}>
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

export default Categories;
