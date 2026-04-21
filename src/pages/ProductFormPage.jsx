import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import {
  createProduct,
  getProductById,
  updateProduct,
  uploadProductImage,
  uploadProductImages
} from "../services/authService";
import {
  getHierarchyCategories,
  getHierarchySubcategories,
  getHierarchyTypes
} from "../services/hierarchyService";

const FORM_STEPS = [
  { id: "basic", label: "Basic Info" },
  { id: "taxonomy", label: "Category Mapping" },
  { id: "variants", label: "Variants & Pricing" },
  { id: "media", label: "Media" },
  { id: "flags", label: "Storefront Flags" },
  { id: "review", label: "Review & Submit" }
];

const createEmptyVariant = () => ({
  size: "",
  color: "",
  price: "",
  stock: ""
});

const initialState = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  subcategoryId: "",
  typeId: "",
  mainImage: "",
  isNewArrival: false,
  isFeatured: false,
  isTrending: false,
  variants: [createEmptyVariant()],
  galleryImageText: ""
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
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditMode);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);

  const activeStep = FORM_STEPS[stepIndex];
  const completionPercent = Math.round(((stepIndex + 1) / FORM_STEPS.length) * 100);

  const validVariants = useMemo(
    () =>
      formData.variants
        .filter((variant) => variant.size && variant.color && variant.price !== "" && variant.stock !== "")
        .map((variant) => ({
          size: variant.size,
          color: variant.color,
          price: Number(variant.price),
          stock: Number(variant.stock)
        })),
    [formData.variants]
  );

  const galleryImages = useMemo(
    () =>
      formData.galleryImageText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [formData.galleryImageText]
  );

  const totalGalleryAssets = galleryImages.length + galleryImageFiles.length;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setMainImageFile(null);
        setGalleryImageFiles([]);

        const [categoriesResponse, productResponse] = await Promise.all([
          getHierarchyCategories(),
          isEditMode ? getProductById(productId) : Promise.resolve(null)
        ]);

        setCategories(categoriesResponse.categories || []);

        if (productResponse?.product) {
          const product = productResponse.product;
          const nextCategoryId = String(product.category_id || "");
          const nextSubcategoryId = String(product.subcategory_id || "");

          if (nextCategoryId) {
            const subcategoriesResponse = await getHierarchySubcategories(nextCategoryId);
            setSubcategories(subcategoriesResponse.subcategories || []);
          }

          if (nextSubcategoryId) {
            const typesResponse = await getHierarchyTypes(nextSubcategoryId);
            setTypes(typesResponse.types || []);
          }

          setFormData({
            name: product.product_name || "",
            slug: product.slug || "",
            description: product.description || "",
            categoryId: nextCategoryId,
            subcategoryId: String(product.subcategory_id || ""),
            typeId: String(product.type_id || ""),
            mainImage: product.main_image || "",
            isNewArrival: Boolean(product.is_new_arrival),
            isFeatured: Boolean(product.is_featured),
            isTrending: Boolean(product.is_trending),
            variants: product.variants?.length
              ? product.variants.map((variant) => ({
                  size: variant.size || "",
                  color: variant.color || "",
                  price: String(variant.price ?? ""),
                  stock: String(variant.stock ?? "")
                }))
              : [createEmptyVariant()],
            galleryImageText: product.images?.map((image) => image.image_url).join("\n") || ""
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

  const handleChange = async (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    if (name === "categoryId") {
      setFormData((prev) => ({
        ...prev,
        categoryId: value,
        subcategoryId: "",
        typeId: ""
      }));
      setTypes([]);

      if (!value) {
        setSubcategories([]);
        return;
      }

      try {
        const response = await getHierarchySubcategories(value);
        setSubcategories(response.subcategories || []);
      } catch (apiError) {
        setError(apiError.message || "Failed to load subcategories");
      }

      return;
    }

    if (name === "subcategoryId") {
      setFormData((prev) => ({
        ...prev,
        subcategoryId: value,
        typeId: ""
      }));

      if (!value) {
        setTypes([]);
        return;
      }

      try {
        const response = await getHierarchyTypes(value);
        setTypes(response.types || []);
      } catch (apiError) {
        setError(apiError.message || "Failed to load types");
      }

      return;
    }

    setFormData((prev) => {
      const nextState = {
        ...prev,
        [name]: nextValue
      };

      if (name === "name" && !slugManuallyEdited) {
        nextState.slug = slugify(value);
      }

      return nextState;
    });

    if (name === "slug") {
      setSlugManuallyEdited(true);
    }
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const handleMainImageFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setMainImageFile(file);
    event.target.value = "";
  };

  const handleGalleryFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }
    setGalleryImageFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const removeGalleryFile = (indexToRemove) => {
    setGalleryImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()]
    }));
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.length > 1
        ? prev.variants.filter((_, variantIndex) => variantIndex !== index)
        : prev.variants
    }));
  };

  const validateStep = () => {
    if (activeStep.id === "basic") {
      if (!formData.name.trim()) {
        setError("Product name is required.");
        return false;
      }
      if (!formData.description.trim()) {
        setError("Product description is required.");
        return false;
      }
    }

    if (activeStep.id === "taxonomy" && !formData.categoryId) {
      setError("Category is required.");
      return false;
    }

    if (activeStep.id === "variants" && validVariants.length === 0) {
      setError("Add at least one complete variant with size, color, price, and stock.");
      return false;
    }

    setError("");
    return true;
  };

  const moveStep = (direction) => {
    if (direction > 0 && !validateStep()) {
      return;
    }

    setStepIndex((current) => Math.min(Math.max(current + direction, 0), FORM_STEPS.length - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: formData.name.trim(),
        product_name: formData.name.trim(),
        slug: slugify(formData.slug || formData.name),
        description: formData.description.trim(),
        categoryId: Number(formData.categoryId),
        subcategoryId: formData.subcategoryId ? Number(formData.subcategoryId) : null,
        typeId: formData.typeId ? Number(formData.typeId) : null,
        mainImage: formData.mainImage.trim(),
        isNewArrival: formData.isNewArrival,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        basePrice: validVariants[0]?.price || 0,
        variants: validVariants,
        images: galleryImages
      };

      const response = isEditMode
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

      const nextProductId = response.productId || response.product?.id || productId;
      if (!nextProductId) {
        throw new Error("Product saved, but product id was not returned.");
      }

      if (mainImageFile) {
        await uploadProductImage(nextProductId, mainImageFile);
      }

      if (galleryImageFiles.length) {
        await uploadProductImages(nextProductId, galleryImageFiles);
      }

      navigate(nextProductId ? `/admin/products/${nextProductId}` : "/admin/products");
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
        eyebrow="Product Studio"
        title={isEditMode ? "Edit Product Workflow" : "Create Product Workflow"}
        description="Step-by-step product onboarding with hierarchy mapping, variants, media, and merchandising flags."
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

      <SurfaceCard className="space-y-6">
        <div className="rounded-card border border-line bg-canvas p-5">
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-ink">Step {stepIndex + 1} of {FORM_STEPS.length}: {activeStep.label}</p>
            <p className="text-secondary">{completionPercent}% complete</p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-page">
            <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {FORM_STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setStepIndex(index)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  index === stepIndex ? "bg-ink text-white" : "bg-page text-secondary"
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeStep.id === "basic" ? (
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Product Name" name="name" value={formData.name} onChange={handleChange} required />
              <FormField label="Slug" name="slug" value={formData.slug} onChange={handleChange} />
              <FormField
                as="textarea"
                label="Description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                wrapperClassName="md:col-span-2"
              />
            </div>
          ) : null}

          {activeStep.id === "taxonomy" ? (
            <div className="grid gap-5 md:grid-cols-3">
              <FormField
                as="select"
                label="Category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select category" },
                  ...categories.map((category) => ({
                    value: String(category.id),
                    label: category.name
                  }))
                ]}
                required
              />
              <FormField
                as="select"
                label="Subcategory"
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select subcategory" },
                  ...subcategories.map((subcategory) => ({
                    value: String(subcategory.id),
                    label: subcategory.name
                  }))
                ]}
              />
              <FormField
                as="select"
                label="Type"
                name="typeId"
                value={formData.typeId}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select type" },
                  ...types.map((itemType) => ({
                    value: String(itemType.id),
                    label: itemType.name
                  }))
                ]}
              />
            </div>
          ) : null}

          {activeStep.id === "variants" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Sellable Variants</p>
                <Button type="button" variant="secondary" onClick={addVariant}>Add Variant</Button>
              </div>
              {formData.variants.map((variant, index) => (
                <div key={`variant-${index}`} className="grid gap-4 rounded-card border border-line p-4 md:grid-cols-4">
                  <FormField
                    label="Size"
                    value={variant.size}
                    onChange={(event) => handleVariantChange(index, "size", event.target.value)}
                  />
                  <FormField
                    label="Color"
                    value={variant.color}
                    onChange={(event) => handleVariantChange(index, "color", event.target.value)}
                  />
                  <FormField
                    label="Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.price}
                    onChange={(event) => handleVariantChange(index, "price", event.target.value)}
                  />
                  <div className="flex items-end gap-2">
                    <FormField
                      label="Stock"
                      type="number"
                      min="0"
                      step="1"
                      value={variant.stock}
                      onChange={(event) => handleVariantChange(index, "stock", event.target.value)}
                      wrapperClassName="w-full"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeVariant(index)}
                      disabled={formData.variants.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeStep.id === "media" ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-ink">Main Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageFileChange}
                  className="w-full rounded-card border border-line bg-canvas px-3 py-2 text-sm text-ink"
                />
                <p className="text-xs text-secondary">
                  {mainImageFile ? `Selected: ${mainImageFile.name}` : "No file selected"}
                </p>
              </div>
              <FormField
                label="Main Image URL (optional fallback)"
                name="mainImage"
                value={formData.mainImage}
                onChange={handleChange}
              />
              <div className="rounded-card border border-line bg-canvas p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Gallery Preview</p>
                <p className="mt-2 text-sm text-secondary">{totalGalleryAssets} assets selected</p>
                <p className="text-xs text-secondary">{galleryImageFiles.length} files + {galleryImages.length} URLs</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-ink">Gallery Image Files</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFileChange}
                  className="w-full rounded-card border border-line bg-canvas px-3 py-2 text-sm text-ink"
                />
                {galleryImageFiles.length ? (
                  <div className="max-h-40 space-y-2 overflow-auto rounded-card border border-line bg-page p-3">
                    {galleryImageFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 text-sm text-secondary">
                        <span className="truncate">{file.name}</span>
                        <Button type="button" variant="outline" onClick={() => removeGalleryFile(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-secondary">No gallery files selected</p>
                )}
              </div>
              <FormField
                as="textarea"
                label="Gallery Image URLs (optional, one per line)"
                name="galleryImageText"
                rows="6"
                value={formData.galleryImageText}
                onChange={handleChange}
                wrapperClassName="md:col-span-2"
              />
            </div>
          ) : null}

          {activeStep.id === "flags" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <label className="rounded-card border border-line bg-canvas p-4 text-sm">
                <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} />
                <span className="ml-2 font-semibold text-ink">New Arrival</span>
              </label>
              <label className="rounded-card border border-line bg-canvas p-4 text-sm">
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                <span className="ml-2 font-semibold text-ink">Featured Product</span>
              </label>
              <label className="rounded-card border border-line bg-canvas p-4 text-sm">
                <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} />
                <span className="ml-2 font-semibold text-ink">Trending</span>
              </label>
            </div>
          ) : null}

          {activeStep.id === "review" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-card border border-line p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Product</p>
                <p className="mt-2 font-semibold text-ink">{formData.name || "-"}</p>
                <p className="text-sm text-secondary">{formData.slug || "-"}</p>
                <p className="mt-2 text-sm text-secondary line-clamp-4">{formData.description || "-"}</p>
              </div>
              <div className="rounded-card border border-line p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Merchandising</p>
                <p className="mt-2 text-sm text-secondary">Variants: {validVariants.length}</p>
                <p className="text-sm text-secondary">Gallery Images: {totalGalleryAssets}</p>
                <p className="text-sm text-secondary">Main Image: {mainImageFile || formData.mainImage ? "Yes" : "No"}</p>
                <p className="text-sm text-secondary">
                  Flags: {[formData.isNewArrival && "New Arrival", formData.isFeatured && "Featured", formData.isTrending && "Trending"].filter(Boolean).join(", ") || "None"}
                </p>
              </div>
            </div>
          ) : null}

          <StatusBanner tone="danger">{error}</StatusBanner>

          <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-4">
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => moveStep(-1)} disabled={stepIndex === 0}>
                Previous
              </Button>
              {stepIndex < FORM_STEPS.length - 1 ? (
                <Button type="button" onClick={() => moveStep(1)}>
                  Next Step
                </Button>
              ) : null}
            </div>
            <div className="flex gap-3">
              <Link to="/admin/products">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={saving || stepIndex !== FORM_STEPS.length - 1}>
                {saving ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}

export default ProductFormPage;
