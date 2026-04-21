import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Trash2, UploadCloud, X } from "lucide-react";

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
  uploadProductImages,
  deleteProductImage
} from "../services/authService";
import {
  getHierarchyCategories,
  getHierarchySubcategories,
  getHierarchyTypes
} from "../services/hierarchyService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [categoryLabel, setCategoryLabel] = useState("");
  const [subcategoryLabel, setSubcategoryLabel] = useState("");
  const [typeLabel, setTypeLabel] = useState("");
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(productId);
      const nextProduct = response.product;
      setProduct(nextProduct);

      const categoriesResponse = await getHierarchyCategories();
      const selectedCategory = (categoriesResponse.categories || []).find(
        (category) => Number(category.id) === Number(nextProduct?.category_id)
      );
      setCategoryLabel(selectedCategory?.name || "");

      if (nextProduct?.category_id) {
        const subcategoriesResponse = await getHierarchySubcategories(nextProduct.category_id);
        const selectedSubcategory = (subcategoriesResponse.subcategories || []).find(
          (subcategory) => Number(subcategory.id) === Number(nextProduct?.subcategory_id)
        );
        setSubcategoryLabel(selectedSubcategory?.name || "");
      } else {
        setSubcategoryLabel("");
      }

      if (nextProduct?.subcategory_id) {
        const typesResponse = await getHierarchyTypes(nextProduct.subcategory_id);
        const selectedType = (typesResponse.types || []).find(
          (itemType) => Number(itemType.id) === Number(nextProduct?.type_id)
        );
        setTypeLabel(selectedType?.name || "");
      } else {
        setTypeLabel("");
      }
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

  // MULTI-IMAGE DRAG & DROP HANDLers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
       setSelectedImages(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleImageSelection = (event) => {
    if (event.target.files?.length) {
       setSelectedImages(prev => [...prev, ...Array.from(event.target.files)]);
    }
    event.target.value = null; // reset so same file can be re-selected if removed
  };

  const removeSelectedImage = (index) => {
     setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async () => {
    if (!selectedImages.length) {
      setError("Please choose images to upload");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setMessage("");
      await uploadProductImages(productId, selectedImages);
      setSelectedImages([]);
      setMessage("Product images uploaded successfully");
      await loadProduct();
    } catch (apiError) {
      setError(apiError.message || "Some images failed to upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteUploadedImage = async (imageId) => {
      if (!window.confirm("Are you sure you want to delete this image?")) return;
      try {
         setError(""); setMessage("");
         await deleteProductImage(productId, imageId);
         setMessage("Product image removed.");
         await loadProduct();
      } catch (err) {
         setError(err.message || "Failed to delete product image.");
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
    { label: "Category", value: categoryLabel || "-" },
    { label: "Subcategory", value: subcategoryLabel || "-" },
    { label: "Type", value: typeLabel || "-" },
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
              <div key={item.label} className="rounded-card bg-canvas p-4 border border-soft shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary">
            {editingVariantId ? "Edit variant" : "Add variant"}
          </h2>
          <form onSubmit={handleVariantSubmit} className="mt-6 space-y-4">
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

            <div className="flex flex-wrap gap-3 mt-4">
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
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary mb-6">Variant list</h2>
          <div className="space-y-4">
            {product.variants?.length ? null : (
              <p className="text-sm font-medium text-secondary bg-input p-6 rounded-2xl text-center border border-soft">
                No variants added yet. Add size, color, price, and stock to make this product sellable.
              </p>
            )}

            {product.variants?.map((variant) => (
              <div key={variant.id} className="rounded-2xl border border-soft bg-canvas p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-primary">{variant.sku}</h3>
                    <p className="text-sm font-medium text-secondary">
                      Sz: <span className="text-primary">{variant.size}</span> &bull; Col: <span className="text-primary">{variant.color}</span>
                    </p>
                    <p className="text-sm font-medium text-secondary">
                      Rs. {Number(variant.price).toFixed(2)} &bull; {variant.stock} in stock
                    </p>
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest mt-1 ${
                        variant.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {variant.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-soft hover:bg-input text-primary transition-colors" onClick={() => handleEditVariant(variant)}>
                      Edit
                    </button>
                    <button type="button" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-soft hover:bg-input text-primary transition-colors" onClick={() => handleVariantStatusToggle(variant)}>
                      {variant.status === "active" ? "Disable" : "Enable"}
                    </button>
                    <button type="button" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-soft hover:bg-red-50 text-red-600 transition-colors" onClick={() => handleDeleteVariant(variant.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr]">
        <SurfaceCard>
           <h2 className="font-display text-3xl font-bold tracking-tight text-primary mb-6">Multi-Image Gallery</h2>
           
           {/* Multi-Image Drag & Drop Area */}
           <div className="mb-8">
              <div 
                 onDragOver={handleDragOver}
                 onDragLeave={handleDragLeave}
                 onDrop={handleDrop}
                 className={`w-full border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-soft bg-input hover:border-primary/50'}`}
              >
                 <UploadCloud className="w-10 h-10 text-muted mb-4" />
                 <p className="font-bold text-primary mb-2">Drag and drop images here</p>
                 <p className="text-sm font-medium text-secondary mb-6">or click to browse multiple files</p>
                 <label className="bg-primary text-canvas px-6 py-3 rounded-full font-bold text-sm cursor-pointer shadow-float hover:scale-105 transition-transform">
                    Browse Files
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelection} />
                 </label>
              </div>

              {/* Upload Previews */}
              {selectedImages.length > 0 && (
                 <div className="mt-6">
                    <p className="text-sm font-bold text-primary mb-4 flex items-center justify-between">
                       Ready to Upload ({selectedImages.length})
                       <Button type="button" disabled={uploadingImage} onClick={handleImageUpload}>
                          {uploadingImage ? "Uploading..." : `Upload ${selectedImages.length} Image${selectedImages.length > 1 ? 's' : ''}`}
                       </Button>
                    </p>
                    <div className="flex flex-wrap gap-4">
                       {selectedImages.map((file, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-soft shadow-sm group">
                             <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                             <button type="button" onClick={() => removeSelectedImage(i)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-danger opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-white"><X className="w-4 h-4"/></button>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
           </div>

           {/* Uploaded Images Gallery */}
           <div className="mt-10 pt-8 border-t border-soft">
              <p className="font-bold text-primary mb-6">Gallery Images ({product.images?.length || 0})</p>
              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
                {product.images?.length ? null : (
                  <p className="text-sm font-medium text-secondary col-span-full">No product images uploaded yet.</p>
                )}

                {product.images?.map((image) => (
                  <div key={image.id} className="relative group overflow-hidden rounded-2xl border border-soft shadow-sm aspect-[4/5] bg-input">
                    <img
                      src={`${API_BASE_URL}${image.image_url}`}
                      alt={product.product_name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                       <button type="button" onClick={() => handleDeleteUploadedImage(image.id)} className="bg-canvas p-3 rounded-full text-danger shadow-float hover:scale-110 transition-transform">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-canvas/80 backdrop-blur text-[10px] font-bold px-2 py-1 rounded text-primary">
                      ID: {image.id}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default ProductView;
