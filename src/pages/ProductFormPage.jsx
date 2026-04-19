import { useEffect, useState } from "react";
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
import {
  createProduct,
  getBrands,
  getCategories,
  getProductById,
  updateProduct,
  getProductVariants,
  createProductVariant,
  deleteVariant,
  uploadProductImages
} from "../services/authService";
import { useToast } from "../context/ToastContext";

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
  const { toastSuccess, toastError } = useToast();
  
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Variants State
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ size: "", color: "", stock: "", price: "", image_url: "" });
  
  // Media State
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, brandsResponse, productResponse] = await Promise.all([
          getCategories(),
          getBrands(),
          isEditMode ? getProductById(productId) : Promise.resolve(null)
        ]);

        setCategories(categoriesResponse.categories || []);
        setBrands(brandsResponse.brands || []);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const nextState = { ...prev, [name]: value };
      if (name === "product_name" && !isEditMode) {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        brand_id: Number(formData.brand_id),
        base_price: Number(formData.base_price)
      };

      const response = isEditMode
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

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
            </div>
          </div>
        </aside>

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
      </div>
    </div>
  );
}

export default ProductFormPage;
