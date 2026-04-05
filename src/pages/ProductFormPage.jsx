import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import {
  createProduct,
  getBrands,
  getCategories,
  getProductById,
  updateProduct
} from "../services/authService";

const initialState = {
  category_id: "",
  brand_id: "",
  product_name: "",
  slug: "",
  description: "",
  base_price: "",
  status: "active"
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function ProductFormPage({ mode = "create" }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === "edit";
  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditMode);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesResponse, brandsResponse, productResponse] = await Promise.all([
          getCategories(),
          getBrands(),
          isEditMode ? getProductById(productId) : Promise.resolve(null)
        ]);

        setCategories(categoriesResponse.categories);
        setBrands(brandsResponse.brands);

        if (productResponse?.product) {
          setFormData({
            category_id: String(productResponse.product.category_id),
            brand_id: String(productResponse.product.brand_id),
            product_name: productResponse.product.product_name,
            slug: productResponse.product.slug,
            description: productResponse.product.description || "",
            base_price: String(productResponse.product.base_price),
            status: productResponse.product.status
          });
        }
      } catch (apiError) {
        setError(apiError.message || "Failed to load product form data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEditMode, productId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      const nextState = {
        ...prev,
        [name]: value
      };

      if (name === "product_name" && !slugManuallyEdited) {
        nextState.slug = slugify(value);
      }

      return nextState;
    });

    if (name === "slug") {
      setSlugManuallyEdited(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        brand_id: Number(formData.brand_id),
        slug: slugify(formData.slug),
        base_price: Number(formData.base_price)
      };

      const response = isEditMode
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

      navigate(`/admin/products/${response.product.id}`);
    } catch (apiError) {
      setError(apiError.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading product form...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Product Master"
        title={isEditMode ? "Edit product" : "Add product"}
        description="Capture catalog-ready product details, connect each product to a category and brand, and control availability from one form."
        actions={
          <>
            <Link to="/admin/products">
              <Button variant="secondary">Back to list</Button>
            </Link>
            {isEditMode ? (
              <Link to={`/admin/products/${productId}`}>
                <Button variant="outline">View Product</Button>
              </Link>
            ) : null}
          </>
        }
      />

      <SurfaceCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              as="select"
              label="Category"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              options={[
                { value: "", label: "Select category" },
                ...categories.map((category) => ({
                  value: String(category.id),
                  label: category.name
                }))
              ]}
            />

            <FormField
              as="select"
              label="Brand"
              name="brand_id"
              value={formData.brand_id}
              onChange={handleChange}
              options={[
                { value: "", label: "Select brand" },
                ...brands.map((brand) => ({
                  value: String(brand.id),
                  label: brand.name
                }))
              ]}
            />

            <FormField
              label="Name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
            />

            <FormField label="Slug" name="slug" value={formData.slug} onChange={handleChange} />

            <FormField
              label="Base Price"
              name="base_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.base_price}
              onChange={handleChange}
            />

            <FormField
              as="select"
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]}
            />
          </div>

          <FormField
            as="textarea"
            label="Description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
          />

          <StatusBanner tone="danger">{error}</StatusBanner>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
            </Button>
            <Link to="/admin/products">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}

export default ProductFormPage;
