import { startTransition, useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Heart, Share2, Star, ShoppingBag } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import ProductReviewsSection from "../components/store/ProductReviewsSection";
import ProductCard from "../components/store/ProductCard";
import {
  buildCatalogImageUrl,
  formatCatalogPrice,
  getStoreProductBySlug,
  getStoreProducts
} from "../services/catalogService";
import { addCartItem } from "../services/cartService";
import { addWishlistItem } from "../services/wishlistService";
import { useToast } from "../context/ToastContext";
import { isAuthenticated } from "../utils/auth";

function ProductDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const { toastSuccess, toastError } = useToast();

  useEffect(() => {
    let ignore = false;
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getStoreProductBySlug(slug);
        if (!ignore) {
          startTransition(() => {
            setProduct(response.product || null);
          });
          if (response.product?.category_id) {
             getStoreProducts({ category: response.product.category_id, limit: 4 })
               .then(res => {
                  if (!ignore) setRelatedProducts((res.products || []).filter(p => p.id !== response.product.id).slice(0, 4));
               })
               .catch(() => {});
          }
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load product detail");
          setProduct(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    window.scrollTo(0,0);
    loadProduct();
    return () => { ignore = true; };
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const galleryImages = product.images?.length ? product.images : product.hero_image ? [{ id: "hero", image_url: product.hero_image }] : [];
    const firstVariant = product.variants?.[0] || null;
    setActiveImage(galleryImages[0]?.image_url || "");
    setSelectedSize(firstVariant?.size || "");
    setSelectedColor(firstVariant?.color || "");
  }, [product]);

  if (loading) {
    return (
       <div className="min-h-[60vh] flex flex-col items-center justify-center p-10">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Capturing Essence...</p>
       </div>
    );
  }

  if (!product) {
    return (
      <div className="shop-container py-20">
        <StatusBanner tone="danger">{error || "Product not found"}</StatusBanner>
        <EmptyState title="Item Not Found" description="The product you are looking for might have been moved." />
      </div>
    );
  }

  const galleryImages = product.images?.length ? product.images : product.hero_image ? [{ id: "hero", image_url: product.hero_image }] : [];
  const sizeOptions = [...new Set((product.variants || []).map((variant) => variant.size))];
  const colorOptions = [...new Set((product.variants || []).filter((variant) => !selectedSize || variant.size === selectedSize).map((variant) => variant.color))];
  
  const selectedVariant = product.variants?.find((variant) => variant.size === selectedSize && variant.color === selectedColor) || product.variants?.[0] || null;
  const activeImageUrl = buildCatalogImageUrl(activeImage || galleryImages[0]?.image_url || product.hero_image);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price_from || product.base_price;
  const currentStock = selectedVariant ? selectedVariant.stock : null;

  const handleAddToCart = async () => {
    if (!isAuthenticated()) { navigate("/login", { state: { from: location } }); return; }
    try {
      setAddingToCart(true);
      const response = await addCartItem({ productId: product.id, variantId: selectedVariant?.id || null, quantity: 1 });
      toastSuccess(response.message || "Added to bag");
    } catch (apiError) { toastError(apiError.message); } finally { setAddingToCart(false); }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated()) { navigate("/login", { state: { from: location } }); return; }
    try {
      setSavingWishlist(true);
      await addWishlistItem({ productId: product.id, variantId: selectedVariant?.id || null });
      toastSuccess("Saved to wishlist");
    } catch (apiError) { toastError(apiError.message); } finally { setSavingWishlist(false); }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="shop-container py-6">
        <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-8">
           <Link to="/" className="hover:text-black transition-colors">Home</Link>
           <ChevronRight className="w-3 h-3" />
           <Link to="/products" className="hover:text-black transition-colors">Catalog</Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-black truncate max-w-[200px]">{product.product_name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* IMAGE GALLERY (RETAIL STYLE) */}
          <div className="w-full lg:w-[60%] flex gap-4">
             <div className="hidden md:flex flex-col gap-4 w-24 shrink-0 overflow-y-auto scrollbar-hide max-h-[600px]">
                {galleryImages.map((img) => (
                   <button 
                    key={img.id} 
                    onClick={() => setActiveImage(img.image_url)}
                    className={`aspect-[3/4] rounded-md overflow-hidden border-2 transition-all ${activeImage === img.image_url ? "border-[var(--color-primary)]" : "border-transparent"}`}
                   >
                      <img src={buildCatalogImageUrl(img.image_url)} className="w-full h-full object-cover" />
                   </button>
                ))}
             </div>
             <div className="flex-1 aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden relative">
                <img 
                  src={activeImageUrl} 
                  alt={product.product_name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1539109136881-3be0610917c1?auto=format&fit=crop&q=80&w=800"; }}
                />
                <div className="absolute top-4 right-4">
                  <button onClick={handleAddToWishlist} className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:text-[var(--status-error)] transition-colors">
                    <Heart className={`w-6 h-6 ${savingWishlist ? 'fill-current text-red-500' : ''}`} />
                  </button>
                </div>
             </div>
          </div>

          {/* PRODUCT INFO (RETAIL STYLE) */}
          <div className="w-full lg:w-[40%] space-y-8">
             <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[var(--color-text-main)] mb-1">{product.brand?.name || "BADSHAH"}</h1>
                <h2 className="text-xl font-medium text-[var(--color-text-subtle)] mb-4">{product.product_name}</h2>
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg w-fit border border-gray-100">
                   <div className="flex items-center gap-1 text-[var(--status-warning)] font-black text-sm">
                      4.2 <Star className="w-4 h-4 fill-current" />
                   </div>
                   <div className="h-4 w-px bg-gray-200" />
                   <div className="text-xs font-bold text-gray-400">2.1k Ratings</div>
                </div>
             </div>

             <div className="border-t border-gray-100 pt-6 space-y-2">
                <div className="flex items-baseline gap-4">
                   <span className="text-3xl font-black">{formatCatalogPrice(currentPrice)}</span>
                   <span className="text-xl text-gray-400 line-through font-medium">{formatCatalogPrice(currentPrice * 1.5)}</span>
                   <span className="text-xl text-[var(--color-primary)] font-black uppercase tracking-tight">(50% OFF)</span>
                </div>
                <p className="text-[11px] font-black text-[var(--status-success)] uppercase tracking-widest">Inclusive of all taxes</p>
             </div>

             {/* SIZE SELECTION */}
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-main)]">Select Size</h3>
                   <button className="text-[var(--color-primary)] text-[11px] font-black uppercase tracking-widest">Size Chart</button>
                </div>
                <div className="flex flex-wrap gap-4">
                   {sizeOptions.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all
                          ${selectedSize === size ? "border-[var(--color-primary)] text-[var(--color-primary)] shadow-md" : "border-gray-100 text-gray-400 hover:border-gray-900 hover:text-black"}
                        `}
                      >
                         {size}
                      </button>
                   ))}
                </div>
             </div>

             {/* CTA BUTTONS */}
             <div className="flex gap-4 pt-10">
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart || currentStock === 0}
                  className="btn-primary flex-1 py-5 rounded-md flex items-center justify-center gap-3"
                >
                   <ShoppingBag className="w-5 h-5" />
                   {addingToCart ? "ADDING..." : currentStock === 0 ? "Out of Stock" : "Add to Bag"}
                </button>
                <button 
                  onClick={handleAddToWishlist}
                  className="btn-outline flex-1 py-5 rounded-md flex items-center justify-center gap-3"
                >
                   <Heart className="w-5 h-5" />
                   Wishlist
                </button>
             </div>

             {/* FEATURES / TRUST */}
             <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-10">
                {[
                   { t: '100% Original', d: 'Guaranteed quality' },
                   { t: 'Easy Returns', d: 'Within 30 days' },
                   { t: 'Try at Home', d: 'Free on first order' },
                   { t: 'Fast Delivery', d: 'Within 3-5 days' }
                ].map((item, i) => (
                   <div key={i} className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.t}</span>
                      <span className="text-[9px] text-gray-400 font-bold">{item.d}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-32 pt-20 border-t border-gray-100">
           <h3 className="text-xl font-black uppercase tracking-widest text-center mb-16">Recommended for you</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {relatedProducts.map(p => (
                 <Link key={p.id} to={`/products/${p.slug}`} className="product-card group block">
                    <div className="product-card-image">
                       <img src={buildCatalogImageUrl(p.images?.[0])} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-3">
                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{p.brand?.name || "BADSHAH"}</p>
                       <h4 className="text-xs font-bold truncate mb-1">{p.name}</h4>
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-black">{formatCatalogPrice(p.price)}</span>
                          <span className="text-[10px] text-gray-400 line-through">₹{Number(p.price) * 2}</span>
                       </div>
                    </div>
                 </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
