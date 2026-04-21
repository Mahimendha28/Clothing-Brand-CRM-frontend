import React, { useState, useEffect } from "react";
import productService from "../services/productService";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

const AdminProductForm = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [types, setTypes] = useState([]);

    const [form, setForm] = useState({
        name: "",
        description: "",
        categoryId: "",
        subcategoryId: "",
        typeId: "",
        mainImage: "",
        isNewArrival: false,
        isFeatured: false,
        variants: [{ size: "M", color: "Black", price: "", stock: "" }],
        images: [""]
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await productService.getCategories();
                setCategories(res.categories || []);
            } catch (err) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCats();
    }, []);

    useEffect(() => {
        if (form.categoryId) {
            const fetchSubs = async () => {
                const res = await productService.getSubcategories(form.categoryId);
                setSubcategories(res.subcategories || []);
                setTypes([]);
                setForm(prev => ({ ...prev, subcategoryId: "", typeId: "" }));
            };
            fetchSubs();
        }
    }, [form.categoryId]);

    useEffect(() => {
        if (form.subcategoryId) {
            const fetchTypes = async () => {
                const res = await productService.getTypes(form.subcategoryId);
                setTypes(res.types || []);
                setForm(prev => ({ ...prev, typeId: "" }));
            };
            fetchTypes();
        }
    }, [form.subcategoryId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...form.variants];
        updatedVariants[index][field] = value;
        setForm(prev => ({ ...prev, variants: updatedVariants }));
    };

    const addVariant = () => {
        setForm(prev => ({
            ...prev,
            variants: [...prev.variants, { size: "", color: "", price: "", stock: "" }]
        }));
    };

    const removeVariant = (index) => {
        if (form.variants.length > 1) {
            const updated = form.variants.filter((_, i) => i !== index);
            setForm(prev => ({ ...prev, variants: updated }));
        }
    };

    const handleImageChange = (index, value) => {
        const updated = [...form.images];
        updated[index] = value;
        setForm(prev => ({ ...prev, images: updated }));
    };

    const addImageField = () => {
        setForm(prev => ({ ...prev, images: [...prev.images, ""] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await productService.createProduct(form);
            setMessage({ type: "success", text: "Product created successfully!" });
            // Reset form or navigate
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to create product" });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "2rem", backgroundColor: "#f9fafb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>Add New Clothing Product</h1>
            </div>

            {message.text && (
                <div style={{ padding: "1rem", marginBottom: "1.5rem", borderRadius: "4px", backgroundColor: message.type === "success" ? "#ecfdf5" : "#fef2f2", color: message.type === "success" ? "#065f46" : "#991b1b", border: `1px solid ${message.type === "success" ? "#10b981" : "#ef4444"}` }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
                {/* Basic Info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>Product Name</label>
                        <input required name="name" value={form.name} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>Main Image URL</label>
                        <input required name="mainImage" value={form.mainImage} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>Description</label>
                    <textarea name="description" value={form.description} onChange={handleInputChange} rows="3" style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
                </div>

                {/* Hierarchy */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>Category</label>
                        <select required name="categoryId" value={form.categoryId} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}>
                            <option value="">Select</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>Subcategory</label>
                        <select required name="subcategoryId" value={form.subcategoryId} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}>
                            <option value="">Select</option>
                            {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>Type</label>
                        <select required name="typeId" value={form.typeId} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}>
                            <option value="">Select</option>
                            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Flags */}
                <div style={{ display: "flex", gap: "2rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                        <input type="checkbox" name="isNewArrival" checked={form.isNewArrival} onChange={handleInputChange} />
                        New Arrival
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                        <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleInputChange} />
                        Featured
                    </label>
                </div>

                {/* Variants */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ fontSize: "0.875rem", fontWeight: "600" }}>Variants</label>
                        <button type="button" onClick={addVariant} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#2563eb" }}>
                            <Plus size={14} /> Add Variant
                        </button>
                    </div>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        {form.variants.map((v, index) => (
                            <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 30px", gap: "0.5rem", alignItems: "center" }}>
                                <input placeholder="Size" value={v.size} onChange={(e) => handleVariantChange(index, "size", e.target.value)} style={{ padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
                                <input placeholder="Color" value={v.color} onChange={(e) => handleVariantChange(index, "color", e.target.value)} style={{ padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
                                <input placeholder="Price" type="number" value={v.price} onChange={(e) => handleVariantChange(index, "price", e.target.value)} style={{ padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
                                <input placeholder="Stock" type="number" value={v.stock} onChange={(e) => handleVariantChange(index, "stock", e.target.value)} style={{ padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
                                <button type="button" onClick={() => removeVariant(index)} style={{ color: "#ef4444" }}><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Gallery */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ fontSize: "0.875rem", fontWeight: "600" }}>Gallery Images</label>
                        <button type="button" onClick={addImageField} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#2563eb" }}>
                            <Plus size={14} /> Add URL
                        </button>
                    </div>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        {form.images.map((url, index) => (
                            <input key={index} placeholder="Image URL" value={url} onChange={(e) => handleImageChange(index, e.target.value)} style={{ width: "100%", padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={loading} style={{ marginTop: "1rem", width: "100%", backgroundColor: "#111827", color: "white", padding: "0.75rem", borderRadius: "4px", fontWeight: "600", opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Processing..." : "Save Product"}
                </button>
            </form>
        </div>
    );
};

export default AdminProductForm;
