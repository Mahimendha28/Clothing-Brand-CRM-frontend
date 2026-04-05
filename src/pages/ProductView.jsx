import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import {
  createProductVariant,
  deleteVariant,
  getProductById,
  updateVariant,
  updateVariantStatus,
  uploadProductImage
} from "../services/authService";

const API_BASE_URL = "http://localhost:5000";

const initialVariantForm = {
  sku: "",
  size: "",
  color: "",
  price: "",
  stock: "",
  status: "active"
};

function ProductView() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [variantForm, setVariantForm] = useState(initialVariantForm);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [savingVariant, setSavingVariant] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(productId);
      setProduct(response.product);
    } catch (apiError) {
      setError(apiError.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleVariantChange = (event) => {
    const { name, value } = event.target;
    setVariantForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetVariantForm = () => {
    setVariantForm(initialVariantForm);
    setEditingVariantId(null);
  };

  const handleVariantSubmit = async (event) => {
    event.preventDefault();
    setSavingVariant(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...variantForm,
        price: Number(variantForm.price),
        stock: Number(variantForm.stock)
      };

      if (editingVariantId) {
        await updateVariant(editingVariantId, payload);
        setMessage("Variant updated successfully");
      } else {
        await createProductVariant(productId, payload);
        setMessage("Variant created successfully");
      }

      resetVariantForm();
      await loadProduct();
    } catch (apiError) {
      setError(apiError.message || "Failed to save variant");
    } finally {
      setSavingVariant(false);
    }
  };

  const handleEditVariant = (variant) => {
    setEditingVariantId(variant.id);
    setVariantForm({
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: String(variant.price),
      stock: String(variant.stock),
      status: variant.status
    });
  };

  const handleVariantStatusToggle = async (variant) => {
    try {
      setError("");
      setMessage("");
      const nextStatus = variant.status === "active" ? "inactive" : "active";
      await updateVariantStatus(variant.id, nextStatus);
      setMessage(`Variant status updated to ${nextStatus}`);
      await loadProduct();
    } catch (apiError) {
      setError(apiError.message || "Failed to update variant status");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    const confirmed = window.confirm("Do you want to delete this variant?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await deleteVariant(variantId);
      setMessage("Variant deleted successfully");
      if (editingVariantId === variantId) {
        resetVariantForm();
      }
      await loadProduct();
    } catch (apiError) {
      setError(apiError.message || "Failed to delete variant");
    }
  };

  const handleImageSelection = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedImage(file);
  };

  const handleImageUpload = async (event) => {
    event.preventDefault();

    if (!selectedImage) {
      setError("Please choose an image to upload");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setMessage("");
      await uploadProductImage(productId, selectedImage);
      setSelectedImage(null);
      event.target.reset();
      setMessage("Product image uploaded successfully");
      await loadProduct();
    } catch (apiError) {
      setError(apiError.message || "Failed to upload product image");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading product...</p>;
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Product Master"
          title="Product view"
          actions={
            <Link to="/admin/products">
              <Button variant="secondary">Back to list</Button>
            </Link>
          }
        />
        <StatusBanner tone="danger">{error || "Product not found"}</StatusBanner>
      </div>
    );
  }

  const detailItems = [
    { label: "Category", value: product.category_name },
    { label: "Brand", value: product.brand_name },
    { label: "Name", value: product.product_name },
    { label: "Slug", value: product.slug },
    { label: "Base Price", value: `Rs. ${Number(product.base_price).toFixed(2)}` },
    { label: "Status", value: product.status }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Product Master"
        title="Product view"
        description="Manage real sellable SKUs by adding variants, stock, and product images directly inside this product workspace."
        actions={
          <>
            <Link to="/admin/products">
              <Button variant="secondary">Back to list</Button>
            </Link>
            <Link to={`/admin/products/${product.id}/edit`}>
              <Button>Edit Product</Button>
            </Link>
          </>
        }
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard>
          <h2 className="font-display text-4xl text-ink">{product.product_name}</h2>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted">{product.slug}</p>
          <p className="mt-6 text-sm leading-7 text-secondary">
            {product.description || "No description added for this product yet."}
          </p>
        </SurfaceCard>

        <SurfaceCard>
          <div className="space-y-4">
            {detailItems.map((item) => (
              <div key={item.label} className="rounded-card bg-canvas p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <h2 className="font-display text-4xl text-ink">
            {editingVariantId ? "Edit variant" : "Add variant"}
          </h2>
          <form onSubmit={handleVariantSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="SKU" name="sku" value={variantForm.sku} onChange={handleVariantChange} />
              <FormField label="Size" name="size" value={variantForm.size} onChange={handleVariantChange} />
              <FormField label="Color" name="color" value={variantForm.color} onChange={handleVariantChange} />
              <FormField
                label="Price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={variantForm.price}
                onChange={handleVariantChange}
              />
              <FormField
                label="Stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={variantForm.stock}
                onChange={handleVariantChange}
              />
              <FormField
                as="select"
                label="Status"
                name="status"
                value={variantForm.status}
                onChange={handleVariantChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" }
                ]}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={savingVariant}>
                {savingVariant ? "Saving..." : editingVariantId ? "Update Variant" : "Add Variant"}
              </Button>
              {editingVariantId ? (
                <Button type="button" variant="secondary" onClick={resetVariantForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="font-display text-4xl text-ink">Variant list</h2>
          <div className="mt-5 space-y-4">
            {product.variants?.length ? null : (
              <p className="text-sm text-secondary">
                No variants added yet. Add size, color, price, and stock to make this product sellable.
              </p>
            )}

            {product.variants?.map((variant) => (
              <div key={variant.id} className="rounded-card bg-canvas p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-ink">{variant.sku}</h3>
                    <p className="text-sm text-secondary">
                      Size {variant.size} | Color {variant.color}
                    </p>
                    <p className="text-sm text-secondary">
                      Price Rs. {Number(variant.price).toFixed(2)} | Stock {variant.stock}
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        variant.status === "active"
                          ? "bg-success/15 text-success"
                          : "bg-danger/15 text-danger"
                      }`}
                    >
                      {variant.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" onClick={() => handleEditVariant(variant)}>
                      Edit
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleVariantStatusToggle(variant)}>
                      {variant.status === "active" ? "Disable" : "Enable"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleDeleteVariant(variant.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <SurfaceCard>
          <h2 className="font-display text-4xl text-ink">Upload image</h2>
          <form onSubmit={handleImageUpload} className="mt-5 space-y-4">
            <FormField
              label="Product Image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageSelection}
            />

            {selectedImage ? (
              <p className="text-sm text-secondary">Selected file: {selectedImage.name}</p>
            ) : null}

            <Button type="submit" disabled={uploadingImage}>
              {uploadingImage ? "Uploading..." : "Upload Image"}
            </Button>
          </form>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="font-display text-4xl text-ink">Image preview</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {product.images?.length ? null : (
              <p className="text-sm text-secondary">No product images uploaded yet.</p>
            )}

            {product.images?.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-card bg-canvas">
                <img
                  src={`${API_BASE_URL}${image.image_url}`}
                  alt={product.product_name}
                  className="h-56 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Image #{image.id}</p>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default ProductView;
