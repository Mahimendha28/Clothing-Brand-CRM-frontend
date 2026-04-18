import { startTransition, useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Heart, Share2, Star } from "lucide-react";
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
                  if (!ignore) setRelatedProducts((res.products || []).filter(p => p.id !== response.product.id).slice(0, 3));
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
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    // scroll to top on mount/slug change
    window.scrollTo(0,0);
    loadProduct();

    return () => {
      ignore = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!product) return;

    const galleryImages = product.images?.length
      ? product.images
      : product.hero_image
        ? [{ id: "hero", image_url: product.hero_image }]
        : [];
    const firstVariant = product.variants?.[0] || null;

    setActiveImage(galleryImages[0]?.image_url || "");
    setSelectedSize(firstVariant?.size || "");
    setSelectedColor(firstVariant?.color || "");
  }, [product]);

  useEffect(() => {
    if (!product?.variants?.length || !selectedSize) return;

    const availableColorsForSize = product.variants
      .filter((variant) => variant.size === selectedSize)
      .map((variant) => variant.color);

    if (!availableColorsForSize.includes(selectedColor)) {
      setSelectedColor(availableColorsForSize[0] || "");
    }
  }, [product, selectedColor, selectedSize]);

  const handleMouseMove = (e) => {
     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
     const x = ((e.clientX - left) / width) * 100;
     const y = ((e.clientY - top) / height) * 100;
     setMousePos({ x, y });
  }

  if (loading) {
    return (
       <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 mt-20">
          <div className="w-10 h-10 border-4 border-input border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-secondary">Loading product details...</p>
       </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-20 space-y-6">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Collection
        </Link>
        <StatusBanner tone="danger">{error || "Product not found"}</StatusBanner>
        <EmptyState
          title="This item is unavailable"
          description="The requested product could not be loaded. It may have been removed or is currently out of stock."
        />
      </div>
    );
  }

  const galleryImages = product.images?.length
    ? product.images
    : product.hero_image
      ? [{ id: "hero", image_url: product.hero_image }]
      : [];
  const sizeOptions = [...new Set((product.variants || []).map((variant) => variant.size))];
  const colorOptions = [
    ...new Set(
      (product.variants || [])
        .filter((variant) => !selectedSize || variant.size === selectedSize)
        .map((variant) => variant.color)
    )
  ];
  
  const selectedVariant = product.variants?.find((variant) => variant.size === selectedSize && variant.color === selectedColor) || product.variants?.[0] || null;
  const activeImageUrl = buildCatalogImageUrl(activeImage || galleryImages[0]?.image_url || product.hero_image);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price_from || product.base_price;
  const currentStock = selectedVariant ? selectedVariant.stock : null;
  const isAddDisabled = addingToCart || currentStock === 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      setAddingToCart(true);
      const response = await addCartItem({ productId: product.id, variantId: selectedVariant?.id || null, quantity: 1 });
      toastSuccess(response.message || `${product.product_name} added to cart`);
    } catch (apiError) {
      toastError(apiError.message || "Failed to add item to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      setSavingWishlist(true);
      const response = await addWishlistItem({ productId: product.id, variantId: selectedVariant?.id || null });
      toastSuccess(response.message || `${product.product_name} saved to wishlist`);
    } catch (apiError) {
      toastError(apiError.message || "Failed to save to wishlist.");
    } finally {
      setSavingWishlist(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 md:px-10 lg:py-12 space-y-16 selection:bg-accent/20">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-secondary">
         <Link to="/" className="hover:text-primary transition-colors">Home</Link>
         <ChevronRight className="w-3 h-3 text-muted" />
         <Link to="/products" className="hover:text-primary transition-colors">Collection</Link>
         <ChevronRight className="w-3 h-3 text-muted" />
         <span className="text-primary truncate max-w-[200px]">{product.product_name}</span>
      </nav>

      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
         
        {/* Left: Interactive Image Gallery */}
        <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col-reverse lg:flex-row gap-6 h-auto lg:h-[700px]">
           {/* Left side Thumbnails */}
           <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto scrollbar-hide py-1 px-1 lg:w-28 shrink-0">
              {galleryImages.map((image) => {
                 const thumbnailUrl = buildCatalogImageUrl(image.image_url);
                 const isActive = activeImage === image.image_url || (!activeImage && galleryImages[0]?.id === image.id);
                 return (
                    <button
                       key={image.id}
                       onClick={() => setActiveImage(image.image_url)}
                       className={`relative w-20 h-24 lg:w-full lg:h-36 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${isActive ? "border-primary shadow-md scale-100 ring-2 ring-primary/20 ring-offset-2" : "border-transparent opacity-70 hover:opacity-100 bg-input hover:scale-[1.02]"}`}
                    >
                       {thumbnailUrl ? (
                         <img src={thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                       ) : (
                         <div className="flex items-center justify-center h-full w-full bg-input text-xs text-muted">Preview</div>
                       )}
                    </button>
                 );
              })}
           </div>

           {/* Main Zoomable Image */}
           <div 
              className="flex-1 bg-input rounded-[32px] overflow-hidden relative group cursor-crosshair border border-soft shadow-inner h-[500px] lg:h-full w-full"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
           >
              <AnimatePresence mode="wait">
                 <motion.img 
                    key={activeImageUrl}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={activeImageUrl || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80"} 
                    alt={product.product_name} 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-300 ease-out"
                    style={{
                       transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                       scale: isZoomed ? 2 : 1
                    }}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"; }}
                 />
              </AnimatePresence>

              {/* Hover Zoom Hint */}
              <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur text-primary text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider opacity-100 group-hover:opacity-0 transition-opacity">
                Hover to Zoom
              </div>
           </div>
        </div>

        {/* Right: Product Details & Controls */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-start py-4 sticky top-32 lg:h-[calc(100vh-160px)] overflow-y-auto scrollbar-hide pr-2">
           <div className="flex justify-between items-start gap-4 mb-2">
             <p className="text-xs font-bold uppercase tracking-widest text-accent">{product.category_name}</p>
             <button className="text-secondary hover:text-primary transition-colors p-2 -mr-2 bg-input rounded-full hover:bg-soft">
                <Share2 className="w-4 h-4" />
             </button>
           </div>
           
           <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-primary leading-[1.1] mb-3">{product.product_name}</h1>
           
           <div className="flex items-center gap-2 mb-6">
              <div className="flex text-accent drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
              <span className="text-sm font-medium text-secondary ml-1">4.9 / 5.0 (128 Reviews)</span>
           </div>

           <p className="text-3xl font-bold text-primary mb-6">{formatCatalogPrice(currentPrice)}</p>
           
           <p className="text-base leading-relaxed text-secondary mb-10">
              {product.description || "A highly versatile piece designed with premium materials. Its meticulous construction ensures effortless style and lasting comfort for any occasion."}
           </p>

           {sizeOptions.length ? (
             <div className="mb-8">
               <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-primary">Size</p>
                  <button className="text-xs text-secondary underline hover:text-primary transition-colors">Size Guide</button>
               </div>
               <div className="flex flex-wrap gap-3">
                 {sizeOptions.map((size) => (
                   <button
                     key={size}
                     onClick={() => setSelectedSize(size)}
                     className={`w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 border-2 ${
                       selectedSize === size
                         ? "border-primary bg-primary text-canvas shadow-md scale-105"
                         : "border-soft bg-canvas text-secondary hover:border-strong hover:text-primary"
                     }`}
                   >
                     {size}
                   </button>
                 ))}
               </div>
             </div>
           ) : null}

           {colorOptions.length ? (
             <div className="mb-10">
               <p className="text-sm font-bold text-primary mb-4">Color</p>
               <div className="flex flex-wrap gap-3">
                 {colorOptions.map((color) => (
                   <button
                     key={color}
                     onClick={() => setSelectedColor(color)}
                     title={color}
                     className={`px-6 py-3 rounded-[var(--radius-sm)] text-sm font-bold transition-all duration-200 border-2 ${
                       selectedColor === color
                         ? "border-primary bg-input text-primary shadow-sm"
                         : "border-soft bg-canvas text-secondary hover:border-strong"
                     } hover:-translate-y-0.5`}
                   >
                     {color}
                   </button>
                 ))}
               </div>
             </div>
           ) : null}

           <div className="flex flex-col sm:flex-row gap-4 mb-10 pt-6 border-t border-soft">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isAddDisabled}
                className={`flex-1 py-4 px-8 rounded-[var(--radius-sm)] font-semibold flex items-center justify-center gap-2 shadow-soft transition-all ${
                   isAddDisabled ? 'bg-input text-muted border border-strong cursor-not-allowed' : 'bg-primary text-canvas hover:shadow-float hover:-translate-y-0.5'
                }`}
              >
                {addingToCart ? (
                   <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Adding...</>
                ) : currentStock === 0 ? "Out of Stock" : "Add to Cart"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToWishlist}
                disabled={savingWishlist}
                className="w-14 h-14 sm:w-auto sm:h-auto sm:px-6 sm:py-4 rounded-[var(--radius-sm)] border border-strong bg-canvas text-primary hover:bg-input transition-colors flex items-center justify-center shadow-sm shrink-0"
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 transition-transform ${savingWishlist ? 'animate-pulse fill-accent text-accent' : ''}`} />
              </motion.button>
           </div>
           
           <div className="space-y-4 pt-8 border-t border-soft">
              <div className="flex items-center justify-between text-sm">
                 <span className="text-secondary font-medium">Availability</span>
                 <span className={`font-bold ${currentStock > 0 ? "text-success" : "text-danger"}`}>
                    {currentStock === null ? "Available on request" : currentStock > 0 ? `In Stock` : "Currently Unavailable"}
                 </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                 <span className="text-secondary font-medium">SKU</span>
                 <span className="font-mono text-muted">{selectedVariant?.sku || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                 <span className="text-secondary font-medium">Shipping</span>
                 <span className="text-primary font-medium">Free standard delivery</span>
              </div>
           </div>

        </div>
      </div>

      <div className="border-t border-soft pt-16">
         <ProductReviewsSection productId={product.id} productName={product.product_name} />
      </div>

      {relatedProducts.length > 0 && (
         <div className="border-t border-soft pt-20 pb-10">
            <h2 className="font-display text-4xl font-bold text-primary mb-10 text-center">Complete the Look</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
               {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
               ))}
            </div>
         </div>
      )}

    </div>
  );
}

export default ProductDetail;
