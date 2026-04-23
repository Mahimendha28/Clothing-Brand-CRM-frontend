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
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Layers, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Save, 
  X,
  Upload,
  AlertCircle
} from "lucide-react";

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
<<<<<<< HEAD
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
=======
  getProductVariants,
  createProductVariant,
  deleteVariant,
  uploadProductImages
} from "../services/authService";
import { useToast } from "../context/ToastContext";
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776

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
    className={`flex cursor-pointer items-start gap-3 rounded-[20px] border px-4 py-4 transition ${checked ? "border-[#111827] bg-slate-900 text-white" : "border-line bg-page text-ink hover:border-slate-300"
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
  const { toastSuccess, toastError } = useToast();
  
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
<<<<<<< HEAD
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
=======
  
  // Variants State
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ size: "", color: "", stock: "", price: "", image_url: "" });
  
  // Media State
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
<<<<<<< HEAD
        setError("");
        setValidationErrors({});
        setMainImageFile(null);
        setGalleryImageFiles([]);

        const [categoriesResponse, productResponse] = await Promise.all([
          getHierarchyCategories(),
=======
        const [categoriesResponse, brandsResponse, productResponse] = await Promise.all([
          getCategories(),
          getBrands(),
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
          isEditMode ? getProductById(productId) : Promise.resolve(null)
        ]);

        setCategories(categoriesResponse.categories || []);
<<<<<<< HEAD
=======
        setBrands(brandsResponse.brands || []);
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776

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
          
          // Load existing variants if in edit mode
          const variantsRes = await getProductVariants(productId);
          setVariants(variantsRes.variants || []);
        }
      } catch (apiError) {
        setError(apiError.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEditMode, productId]);

<<<<<<< HEAD
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
=======
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const nextState = { ...prev, [name]: value };
      if (name === "product_name" && !isEditMode) {
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
        nextState.slug = slugify(value);
      }
      return nextState;
    });
  };

  const handleAddVariant = async () => {
    if (!newVariant.size || !newVariant.stock) {
      toastError("Size and Stock are required for variants");
      return;
    }
    
    if (isEditMode) {
      try {
        const payload = {
          ...newVariant,
          stock: Number(newVariant.stock),
          price: newVariant.price ? Number(newVariant.price) : Number(formData.base_price),
          image_url: newVariant.image_url
        };
        const res = await createProductVariant(productId, payload);
        setVariants(prev => [...prev, res.variant]);
        setNewVariant({ size: "", color: "", stock: "", price: "", image_url: "" });
        toastSuccess("Variant added successfully");
      } catch (err) {
        toastError(err.message);
      }
    } else {
      // In create mode, just add to local state
      setVariants(prev => [...prev, { ...newVariant, id: Date.now() }]);
      setNewVariant({ size: "", color: "", stock: "", price: "", image_url: "" });
    }
  };

  const handleRemoveVariant = async (id) => {
    if (isEditMode) {
      try {
        await deleteVariant(id);
        setVariants(prev => prev.filter(v => v.id !== id));
        toastSuccess("Variant removed");
      } catch (err) {
        toastError(err.message);
      }
    } else {
      setVariants(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
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
<<<<<<< HEAD
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
=======
        ...formData,
        category_id: Number(formData.category_id),
        brand_id: Number(formData.brand_id),
        base_price: Number(formData.base_price)
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
      };

      const response = isEditMode
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

<<<<<<< HEAD
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
=======
      const savedProductId = response.product.id;

      // In create mode, we need to save variants and images after product is created
      if (!isEditMode) {
        // Save variants
        for (const variant of variants) {
          await createProductVariant(savedProductId, {
            ...variant,
            stock: Number(variant.stock),
            price: variant.price ? Number(variant.price) : Number(formData.base_price)
          });
        }
        
        // Save images
        if (selectedImages.length > 0) {
          await uploadProductImages(savedProductId, selectedImages);
        }
      }

      toastSuccess(isEditMode ? "Product updated" : "Product created successfully");
      navigate(`/inventory`);
    } catch (apiError) {
      setError(apiError.message || "Failed to save product");
      toastError(apiError.message);
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted">Assembling Catalog...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General Info', icon: Package },
    { id: 'variants', label: 'Variants & Stock', icon: Layers },
    { id: 'media', label: 'Product Media', icon: ImageIcon }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <PageHeader
<<<<<<< HEAD
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
=======
        eyebrow="Admin Inventory"
        title={isEditMode ? "Elite Editing" : "New Collection Drop"}
        description="Craft a high-performance listing with full variants and cinematic imagery."
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-12">
        {/* Tab Navigation Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-canvas border border-soft rounded-2xl p-3 shadow-soft sticky top-32">
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-secondary hover:bg-input"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-white" : "text-muted"}`} />
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-soft">
               <button 
                 onClick={handleSubmit} 
                 disabled={saving}
                 className="w-full btn-primary !rounded-xl !py-4 flex items-center justify-center gap-2 shadow-xl shadow-primary/30"
               >
                 {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                 {isEditMode ? "Update" : "Publish"}
               </button>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
            </div>
          </div>
        </aside>

<<<<<<< HEAD
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
                  className={`min-w-[120px] rounded-[12px] border px-3 py-2.5 text-left transition ${isActive
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
                      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-line bg-page hover:border-slate-300"
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
=======
        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SurfaceCard className="!p-8 space-y-8">
                  <div className="flex items-center gap-4 text-primary">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5" /></div>
                    <h3 className="text-xl font-display font-bold">Base Identity</h3>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      as="select" label="Category" name="category_id"
                      value={formData.category_id} onChange={handleChange}
                      options={[
                        { value: "", label: "Select Catalog Branch" },
                        ...categories.map(c => ({ value: String(c.id), label: c.name }))
                      ]}
                    />
                    <FormField
                      as="select" label="Brand" name="brand_id"
                      value={formData.brand_id} onChange={handleChange}
                      options={[
                        { value: "", label: "Select Manufacturer" },
                        ...brands.map(b => ({ value: String(b.id), label: b.name }))
                      ]}
                    />
                    <FormField label="Product Name" name="product_name" value={formData.product_name} onChange={handleChange} placeholder="e.g. Vintage Wash Oversized Tee" />
                    <FormField label="Slug (URL Identity)" name="slug" value={formData.slug} onChange={handleChange} placeholder="vintage-wash-tee" />
                    <FormField label="Listing Base Price" name="base_price" type="number" value={formData.base_price} onChange={handleChange} placeholder="0.00" />
                    <FormField
                      as="select" label="Publication Status" name="status"
                      value={formData.status} onChange={handleChange}
                      options={[{ value: "active", label: "Live in Catalog" }, { value: "inactive", label: "Draft Archive" }]}
                    />
                  </div>
                  
                  <FormField
                    as="textarea" label="Brand Story / Description" name="description"
                    rows="6" value={formData.description} onChange={handleChange}
                    placeholder="Describe the material, fit, and aesthetic..."
                  />
                </SurfaceCard>
              </motion.div>
            )}

            {activeTab === 'variants' && (
              <motion.div key="variants" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SurfaceCard className="!p-8 space-y-10">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4 text-primary">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                       <h3 className="text-xl font-display font-bold">SKU Matrix</h3>
                     </div>
                  </div>

                  <div className="p-6 bg-input rounded-2xl border border-soft space-y-6">
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted italic">Add Dimension to Product</p>
                     <div className="grid gap-4 md:grid-cols-5 items-end">
                        <FormField label="Size" placeholder="XL, 32, etc" value={newVariant.size} onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))} />
                        <FormField label="Color" placeholder="Jet Black" value={newVariant.color} onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))} />
                        <FormField label="Stock Qty" type="number" placeholder="0" value={newVariant.stock} onChange={(e) => setNewVariant(prev => ({ ...prev, stock: e.target.value }))} />
                        <FormField label="Illustration URL" placeholder="Photo Link" value={newVariant.image_url} onChange={(e) => setNewVariant(prev => ({ ...prev, image_url: e.target.value }))} />
                        <button 
                          onClick={handleAddVariant}
                          className="w-full py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10 hover:-translate-y-1 transition-all"
                        >
                          Push Variant
                        </button>
                     </div>
                  </div>

                  {/* Variants List */}
                  <div className="space-y-4">
                     {variants.length > 0 ? variants.map((v, i) => (
                        <div key={v.id || i} className="flex items-center justify-between p-4 bg-canvas border border-soft rounded-xl shadow-soft group">
                           <div className="flex items-center gap-8">
                              {v.image_url && (
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-soft shadow-sm">
                                   <img src={v.image_url} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black uppercase text-muted tracking-widest">Variation</span>
                                 <span className="text-sm font-bold text-primary">{v.size} {v.color ? ` - ${v.color}` : ''}</span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black uppercase text-muted tracking-widest">Inventory</span>
                                 <span className="text-sm font-bold">{v.stock} pcs</span>
                              </div>
                              {v.price && (
                                <div className="flex flex-col">
                                   <span className="text-[9px] font-black uppercase text-muted tracking-widest">Override Price</span>
                                   <span className="text-sm font-bold text-success">₹{v.price}</span>
                                </div>
                              )}
                           </div>
                           <button onClick={() => handleRemoveVariant(v.id)} className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     )) : (
                        <div className="py-12 text-center border-2 border-dashed border-soft rounded-2xl bg-input/20">
                           <AlertCircle className="w-8 h-8 text-muted mx-auto mb-4" />
                           <p className="text-xs font-bold uppercase tracking-widest text-muted">No Variants Defined Yet</p>
                        </div>
                     )}
                  </div>
                </SurfaceCard>
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div key="media" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SurfaceCard className="!p-8 space-y-10">
                  <div className="flex items-center gap-4 text-primary">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><ImageIcon className="w-5 h-5" /></div>
                    <h3 className="text-xl font-display font-bold">Atelier Imagery</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="relative group flex flex-col items-center justify-center py-16 border-2 border-dashed border-strong rounded-[2rem] bg-input/50 hover:bg-canvas transition-all cursor-pointer">
                        <input 
                          type="file" 
                          multiple 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                           <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-tighter">Click or Drag to Upload Multi-Angle Gallery</p>
                        <p className="text-[10px] text-muted font-bold tracking-[0.2em] mt-2 uppercase">RAW High Detail (Max 10 images)</p>
                     </div>

                     <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6 mt-10">
                        {imagePreviews.map((src, i) => (
                           <div key={i} className="aspect-square relative rounded-2xl overflow-hidden shadow-soft border border-soft group">
                              <img src={src} className="w-full h-full object-cover" alt="Preview" />
                              <button 
                                onClick={() => {
                                  setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                                  setSelectedImages(prev => prev.filter((_, idx) => idx !== i));
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-danger"
                              >
                                 <X className="w-3 h-3" />
                              </button>
                              {i === 0 && <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-accent text-white text-[7px] font-black uppercase rounded shadow-lg">Hero Cover</span>}
                           </div>
                        ))}
                     </div>
                  </div>
                </SurfaceCard>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-12 flex items-center justify-between px-6 pt-6 border-t border-soft">
             <Link to="/inventory" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted hover:text-primary transition-all">
                <ChevronRight className="w-4 h-4 rotate-180" /> Discard Changes
             </Link>
             <StatusBanner tone="danger">{error}</StatusBanner>
          </div>
        </div>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
      </div>
    </div>
  );
}

export default ProductFormPage;
