import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { createBrand, getBrands, updateBrand } from "../services/authService";

const initialFormData = {
  name: "",
  description: ""
};

function BrandFormPage() {
  const navigate = useNavigate();
  const { brandId } = useParams();
  const isEditMode = Boolean(brandId);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let ignore = false;

    const loadBrand = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getBrands();
        const brand = (response.brands || []).find((entry) => String(entry.id) === String(brandId));

        if (!brand) {
          throw new Error("Brand not found");
        }

        if (!ignore) {
          setFormData({
            name: brand.name || "",
            description: brand.description || ""
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load brand");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadBrand();

    return () => {
      ignore = true;
    };
  }, [brandId, isEditMode]);

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

    try {
      if (isEditMode) {
        await updateBrand(brandId, formData);
      } else {
        await createBrand(formData);
      }

      navigate("/admin/brands");
    } catch (apiError) {
      setError(apiError.message || "Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading brand form...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Brand Master"
        title={isEditMode ? "Edit brand" : "Create brand"}
        description="Use a dedicated form page for brand changes and return to the table after saving."
        actions={
          <Link to="/admin/brands">
            <Button variant="secondary">Back to brand list</Button>
          </Link>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Brand Name" name="name" value={formData.name} onChange={handleChange} />
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
            {saving ? "Saving..." : isEditMode ? "Update Brand" : "Create Brand"}
          </Button>
        </form>
      </SurfaceCard>
    </div>
  );
}

export default BrandFormPage;
