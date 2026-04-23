import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { ALLOWED_TOP_LEVEL_CATEGORIES, isAllowedTopLevelCategory } from "../constants/categories";
import { createCategory, getCategories, updateCategory } from "../services/authService";

const initialFormData = {
  name: "",
  description: ""
};

function CategoryFormPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const isEditMode = Boolean(categoryId);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let ignore = false;

    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getCategories();
        const category = (response.categories || []).find((entry) => String(entry.id) === String(categoryId));

        if (!category) {
          throw new Error("Category not found");
        }

        if (!ignore) {
          setFormData({
            name: category.name || "",
            description: category.description || ""
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load category");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadCategory();

    return () => {
      ignore = true;
    };
  }, [categoryId, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (!isAllowedTopLevelCategory(formData.name)) {
      setError("Only Men, Women, and Kids categories are allowed.");
      setSaving(false);
      return;
    }

    try {
      if (isEditMode) {
        await updateCategory(categoryId, formData);
      } else {
        await createCategory(formData);
      }

      navigate("/admin/categories");
    } catch (apiError) {
      setError(apiError.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading category form...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Category Master"
        title={isEditMode ? "Edit category" : "Create category"}
        description="Use a dedicated form page for category changes and return to the table after saving."
        actions={
          <Link to="/admin/categories">
            <Button variant="secondary">Back to category list</Button>
          </Link>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
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
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditMode ? "Update Category" : "Create Category"}
          </Button>
        </form>
      </SurfaceCard>
    </div>
  );
}

export default CategoryFormPage;
