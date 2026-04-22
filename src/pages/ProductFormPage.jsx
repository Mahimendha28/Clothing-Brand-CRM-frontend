import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Layers3,
  PackagePlus,
  Settings2,
  Tags
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { isAllowedTopLevelCategory } from "../constants/categories";
import { useToast } from "../context/ToastContext";
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

const FORM_STEPS = [
  {
    id: "basics",
    number: "01",
    title: "Basics",
    description: "Product name, slug, and description."
  },
  {
    id: "catalog",
    number: "02",
    title: "Category",
    description: "Men, Women, or Kids with hierarchy details."
  },
  {
    id: "variants",
    number: "03",
    title: "Variants",
    description: "Sizes, colors, pricing, and stock."
  },
  {
    id: "media",
    number: "04",
    title: "Media",
    description: "Main image and gallery assets."
  },
  {
    id: "visibility",
    number: "05",
    title: "Visibility",
    description: "Storefront badges and final review."
  }
];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildValidationErrors = (formData, validVariants) => {
  const nextErrors = {};

  if (!formData.name.trim()) {
    nextErrors.name = "Product name is required.";
  }

  if (!formData.slug.trim()) {
    nextErrors.slug = "Slug is required.";
  }

  if (!formData.description.trim()) {
    nextErrors.description = "Description is required.";
  }

  if (!formData.categoryId) {
    nextErrors.categoryId = "Category is required.";
  }

  if (!validVariants.length) {
    nextErrors.variants = "Add at least one complete variant with size, color, price, and stock.";
  }

  return nextErrors;
};

const getStepFields = (stepId) => {
  if (stepId === "basics") {
    return ["name", "slug", "description"];
  }

  if (stepId === "catalog") {
    return ["categoryId"];
  }

  if (stepId === "variants") {
    return ["variants"];
  }

  return [];
};

const StepHeader = ({ icon: Icon, step, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#111827] text-white shadow-lg shadow-slate-900/10">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">{step}</p>
      <h2 className="mt-1.5 text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-secondary">{description}</p>
    </div>
  </div>
);

const ToggleCard = ({ checked, name, label, description, onChange }) => (
  <label
    className={`flex cursor-pointer items-start gap-3 rounded-[20px] border px-4 py-4 transition ${
      checked ? "border-[#111827] bg-slate-900 text-white" : "border-line bg-page text-ink hover:border-slate-300"
    }`}
  >
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="mt-1 h-4 w-4 accent-white" />
    <div>
      <p className={`text-sm font-semibold ${checked ? "text-white" : "text-ink"}`}>{label}</p>
      <p className={`mt-1 text-sm leading-6 ${checked ? "text-slate-200" : "text-secondary"}`}>{description}</p>
    </div>
  </label>
);

const FilePicker = ({ label, fileName, onChange, multiple = false, hint = "No file selected" }) => (
  <div className="space-y-2">
    <label className="ui-label">{label}</label>
    <label className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-line bg-white px-3 py-2.5 transition hover:border-slate-300">
      <span className="rounded-[10px] bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
        Choose
      </span>
      <span className="min-w-0 truncate text-sm text-secondary">{fileName || hint}</span>
      <input type="file" accept="image/*" multiple={multiple} onChange={onChange} className="hidden" />
    </label>
  </div>
);

function ProductFormPage({ mode = "create" }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === "edit";
  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditMode);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const { toastError, toastSuccess } = useToast();
  const compactInputClass = "!rounded-[12px] !py-2.5 !text-[13px]";
  const compactTextAreaClass = "!rounded-[12px] !py-2.5 !text-[13px]";

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

  const visibleCategories = useMemo(
    () => categories.filter((category) => isAllowedTopLevelCategory(category.name)),
    [categories]
  );

  const completionState = useMemo(() => {
    const basicsComplete = Boolean(formData.name.trim() && formData.slug.trim() && formData.description.trim());
    const catalogComplete = Boolean(formData.categoryId);
    const variantsComplete = validVariants.length > 0;
    const mediaComplete = Boolean(mainImageFile || formData.mainImage.trim() || galleryImages.length || galleryImageFiles.length);
    const visibilityComplete = Boolean(
      formData.isNewArrival || formData.isFeatured || formData.isTrending
    );

    return {
      basics: basicsComplete,
      catalog: catalogComplete,
      variants: variantsComplete,
      media: mediaComplete,
      visibility: visibilityComplete
    };
  }, [formData, galleryImageFiles.length, galleryImages.length, mainImageFile, validVariants.length]);

  const completionCount = Object.values(completionState).filter(Boolean).length;
  const progressPercent = Math.round((completionCount / FORM_STEPS.length) * 100);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setValidationErrors({});
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

    setValidationErrors((current) => ({ ...current, [name]: "" }));

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
    setValidationErrors((current) => ({ ...current, variants: "" }));
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

  const goToStep = (index) => {
    setActiveStep(index);
  };

  const validateStep = (stepIndex) => {
    const allErrors = buildValidationErrors(formData, validVariants);
    const stepId = FORM_STEPS[stepIndex]?.id;
    const stepFields = getStepFields(stepId);
    const stepErrors = Object.fromEntries(
      Object.entries(allErrors).filter(([key]) => stepFields.includes(key))
    );

    setValidationErrors((current) => ({
      ...current,
      ...stepErrors
    }));

    if (Object.keys(stepErrors).length) {
      setError("Please complete the required fields in this step before moving on.");
      return false;
    }

    setError("");
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setActiveStep((current) => Math.min(current + 1, FORM_STEPS.length - 1));
  };

  const handlePreviousStep = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const nextErrors = buildValidationErrors(formData, validVariants);
    setValidationErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      const firstInvalidStepIndex = FORM_STEPS.findIndex((step) =>
        getStepFields(step.id).some((field) => nextErrors[field])
      );

      if (firstInvalidStepIndex >= 0) {
        setActiveStep(firstInvalidStepIndex);
      }

      setError("Please fix the highlighted form fields before saving.");
      return;
    }

    setSaving(true);

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

      toastSuccess(isEditMode ? "Product updated successfully" : "Product added successfully");
      navigate(nextProductId ? `/admin/products/${nextProductId}` : "/admin/products");
    } catch (apiError) {
      setError(apiError.message || "Failed to save product");
      toastError(apiError.message || "Failed to save product");
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
        title={isEditMode ? "Edit Product" : "Create Product"}
        description="A restored step-by-step product workflow with cleaner progression, fewer distractions, and only the storefront categories you actually use."
        actions={
          <>
            <Link to="/admin/products">
              <Button variant="secondary" className="ui-compact-button">Back to List</Button>
            </Link>
            {isEditMode ? (
              <Link to={`/admin/products/${productId}`}>
                <Button variant="outline" className="ui-compact-button">View Product</Button>
              </Link>
            ) : null}
          </>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="space-y-6">
        <SurfaceCard className="space-y-4 !p-4 md:!p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Workflow Progress</p>
              <p className="mt-1 text-sm text-secondary">
                Step {activeStep + 1} of {FORM_STEPS.length} · {progressPercent}% complete
              </p>
            </div>
            <div className="rounded-full border border-line bg-page px-3 py-1.5 text-xs font-medium text-secondary">
              Only Men, Women, and Kids categories are available
            </div>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-input">
            <div className="h-full rounded-full bg-[#111827] transition-all" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {FORM_STEPS.map((step, index) => {
              const isActive = index === activeStep;
              const isDone = completionState[step.id];

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`min-w-[120px] rounded-[12px] border px-3 py-2.5 text-left transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : isDone
                        ? "border-slate-300 bg-slate-100 text-ink"
                        : "border-line bg-white text-ink hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isActive ? "text-slate-300" : "text-muted"}`}>
                      Step {step.number}
                    </p>
                    {isDone ? (
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${isActive ? "bg-white text-slate-900" : "bg-emerald-500 text-white"}`}>
                        <Check className="h-3 w-3" />
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-1.5 text-sm font-semibold ${isActive ? "text-white" : "text-ink"}`}>{step.title}</p>
                </button>
              );
            })}
          </div>
        </SurfaceCard>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeStep === 0 ? (
            <SurfaceCard className="space-y-5 !p-5 md:!p-6">
              <StepHeader
                icon={PackagePlus}
                step="Step 01"
                title="Basic product details"
                description="Start with the core content that customers and admins will see first. Keep the naming clean and the description specific."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={validationErrors.name}
                  className={compactInputClass}
                  required
                />
                <FormField
                  label="Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  error={validationErrors.slug}
                  className={compactInputClass}
                />
                <FormField
                  as="textarea"
                  label="Description"
                  name="description"
                  rows="7"
                  value={formData.description}
                  onChange={handleChange}
                  error={validationErrors.description}
                  className={compactTextAreaClass}
                  hint="Write the customer-facing description once here so it stays consistent across listing and detail pages."
                  wrapperClassName="md:col-span-2"
                />
              </div>
            </SurfaceCard>
          ) : null}

          {activeStep === 1 ? (
            <SurfaceCard className="space-y-5 !p-5 md:!p-6">
              <StepHeader
                icon={Tags}
                step="Step 02"
                title="Place it in the right category"
                description="This step is locked to your real storefront structure. The top-level category list now shows only Men, Women, and Kids."
              />

              <div className="grid gap-5 md:grid-cols-3">
                <FormField
                  as="select"
                  label="Category"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  error={validationErrors.categoryId}
                  className={compactInputClass}
                  options={[
                    { value: "", label: "Select category" },
                    ...visibleCategories.map((category) => ({
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
                  className={compactInputClass}
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
                  className={compactInputClass}
                  options={[
                    { value: "", label: "Select type" },
                    ...types.map((itemType) => ({
                      value: String(itemType.id),
                      label: itemType.name
                    }))
                  ]}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {visibleCategories.map((category) => {
                  const isSelected = formData.categoryId === String(category.id);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleChange({ target: { name: "categoryId", value: String(category.id), type: "select-one" } })}
                      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                        isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-line bg-page hover:border-slate-300"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </SurfaceCard>
          ) : null}

          {activeStep === 2 ? (
            <SurfaceCard className="space-y-5 !p-5 md:!p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <StepHeader
                  icon={Layers3}
                  step="Step 03"
                  title="Build the sellable variants"
                  description="Every row should represent a real sellable option. This is where stock and price accuracy matters most."
                />
                <Button type="button" variant="secondary" onClick={addVariant} className="ui-compact-button">
                  Add Variant
                </Button>
              </div>

              {validationErrors.variants ? <p className="text-sm font-medium text-danger">{validationErrors.variants}</p> : null}

              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div key={`variant-${index}`} className="rounded-[24px] border border-line bg-page p-4 md:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">Variant {index + 1}</p>
                        <p className="mt-1 text-sm text-secondary">Fill all four fields to include this option in the saved product.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeVariant(index)}
                        disabled={formData.variants.length === 1}
                        className="ui-compact-button"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                  <FormField
                    label="Size"
                    value={variant.size}
                    onChange={(event) => handleVariantChange(index, "size", event.target.value)}
                    className={compactInputClass}
                  />
                  <FormField
                    label="Color"
                    value={variant.color}
                    onChange={(event) => handleVariantChange(index, "color", event.target.value)}
                    className={compactInputClass}
                  />
                  <FormField
                    label="Price"
                        type="number"
                        min="0"
                    step="0.01"
                    value={variant.price}
                    onChange={(event) => handleVariantChange(index, "price", event.target.value)}
                    className={compactInputClass}
                  />
                  <FormField
                    label="Stock"
                        type="number"
                        min="0"
                    step="1"
                    value={variant.stock}
                    onChange={(event) => handleVariantChange(index, "stock", event.target.value)}
                    className={compactInputClass}
                  />
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          ) : null}

          {activeStep === 3 ? (
            <SurfaceCard className="space-y-5 !p-5 md:!p-6">
              <StepHeader
                icon={ImagePlus}
                step="Step 04"
                title="Add product media"
                description="Keep image handling in one place. You can upload files directly and still keep URL fallbacks when needed."
              />

              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <FilePicker
                    label="Main Image File"
                    fileName={mainImageFile?.name || ""}
                    onChange={handleMainImageFileChange}
                  />
                  <FormField
                    label="Main Image URL"
                    name="mainImage"
                    value={formData.mainImage}
                    onChange={handleChange}
                    className={compactInputClass}
                    hint="Optional fallback if you are not uploading a file."
                  />
                </div>

                <FilePicker
                  label="Gallery Image Files"
                  fileName={galleryImageFiles.length ? `${galleryImageFiles.length} file(s) selected` : ""}
                  onChange={handleGalleryFileChange}
                  multiple
                  hint="Choose one or more gallery images"
                />

                {galleryImageFiles.length ? (
                  <div className="space-y-2 rounded-[16px] border border-line bg-page p-3">
                    {galleryImageFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 text-sm text-secondary">
                        <span className="truncate">{file.name}</span>
                        <Button type="button" variant="outline" onClick={() => removeGalleryFile(index)} className="ui-compact-button">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <FormField
                  as="textarea"
                  label="Gallery Image URLs"
                  name="galleryImageText"
                  rows="6"
                  value={formData.galleryImageText}
                  onChange={handleChange}
                  className={compactTextAreaClass}
                  hint="Optional. Add one image URL per line."
                />

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-[14px] border border-line bg-page px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Main</p>
                    <p className="mt-1 text-sm text-secondary">{mainImageFile ? "Ready" : formData.mainImage ? "URL added" : "Not set"}</p>
                  </div>
                  <div className="rounded-[14px] border border-line bg-page px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Gallery Files</p>
                    <p className="mt-1 text-sm text-secondary">{galleryImageFiles.length} selected</p>
                  </div>
                  <div className="rounded-[14px] border border-line bg-page px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Gallery URLs</p>
                    <p className="mt-1 text-sm text-secondary">{galleryImages.length} added</p>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          {activeStep === 4 ? (
            <SurfaceCard className="space-y-5 !p-5 md:!p-6">
              <StepHeader
                icon={Settings2}
                step="Step 05"
                title="Visibility and review"
                description="Choose which promotional badges this product should carry, then save from one final review panel."
              />

              <div className="grid gap-4 md:grid-cols-3">
                <ToggleCard
                  checked={formData.isNewArrival}
                  name="isNewArrival"
                  label="New Arrival"
                  description="Highlight this item in fresh drop sections."
                  onChange={handleChange}
                />
                <ToggleCard
                  checked={formData.isFeatured}
                  name="isFeatured"
                  label="Featured Product"
                  description="Push it into curated storefront placement."
                  onChange={handleChange}
                />
                <ToggleCard
                  checked={formData.isTrending}
                  name="isTrending"
                  label="Trending"
                  description="Mark it as momentum-driven for discovery areas."
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-line bg-page p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Review Snapshot</p>
                  <div className="mt-4 space-y-3 text-sm text-secondary">
                    <p><span className="font-semibold text-ink">Product:</span> {formData.name || "Not added yet"}</p>
                    <p><span className="font-semibold text-ink">Slug:</span> {formData.slug || "Not added yet"}</p>
                    <p><span className="font-semibold text-ink">Category:</span> {visibleCategories.find((category) => String(category.id) === formData.categoryId)?.name || "Not selected"}</p>
                    <p><span className="font-semibold text-ink">Variants:</span> {validVariants.length} complete</p>
                    <p><span className="font-semibold text-ink">Media assets:</span> {galleryImageFiles.length + galleryImages.length + (mainImageFile || formData.mainImage ? 1 : 0)}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-900 bg-slate-900 p-5 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">Ready To Save</p>
                  <p className="mt-4 text-lg font-semibold">The product form is back to a step-by-step flow.</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Review the summary, then save. If anything is missing, the form will jump back to the first incomplete required step.
                  </p>
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          <SurfaceCard className="!p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <Link to="/admin/products">
                  <Button type="button" variant="outline" className="ui-compact-button">Cancel</Button>
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePreviousStep}
                  disabled={activeStep === 0}
                  className="ui-compact-button"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                {activeStep < FORM_STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNextStep} className="ui-compact-button">
                    Next Step
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={saving} className="ui-compact-button !min-w-[148px]">
                    {saving ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
                  </Button>
                )}
              </div>
            </div>
          </SurfaceCard>
        </form>
      </div>
    </div>
  );
}

export default ProductFormPage;
