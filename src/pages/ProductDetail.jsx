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
              .catch(() => { });
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
    window.scrollTo(0, 0);
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
    <div className="max-w-[1440px] mx-auto px-6 py-6 md:px-10">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-6 uppercase tracking-wider">
        <Link to="/" className="hover:text-[#041e3a] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-[#041e3a] transition-colors">Collection</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#041e3a] font-semibold truncate max-w-[200px]">{product.product_name}</span>
      </nav>

      {error && <StatusBanner tone="danger">{error}</StatusBanner>}

      {/* ── Main: Myntra-style two-column layout ────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

        {/* LEFT: Gallery — fixed size, not full-height */}
        <div className="w-full lg:max-w-[440px] shrink-0 flex gap-2">

          {/* Tiny thumbnails strip */}
          <div className="flex flex-col gap-1.5 w-[52px] shrink-0">
            {galleryImages.map((image) => {
              const thumbUrl = buildCatalogImageUrl(image.image_url);
              const isActive = activeImage === image.image_url || (!activeImage && galleryImages[0]?.id === image.id);
              return (
                <button
                  key={image.id}
                  onClick={() => setActiveImage(image.image_url)}
                  className={`w-full aspect-[3/4] overflow-hidden border transition-all ${isActive ? "border-[#041e3a]" : "border-gray-100 opacity-50 hover:opacity-100"}`}
                >
                  <img src={thumbUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                </button>
              );
            })}
          </div>

          {/* Main image — fixed aspect ratio, no viewport-height stretching */}
          <div
            className="flex-1 aspect-[3/4] relative overflow-hidden bg-gray-50 cursor-crosshair"
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
                transition={{ duration: 0.25 }}
                src={activeImageUrl || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80"}
                alt={product.product_name}
                className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
                style={{ transformOrigin: `${mousePos.x}% ${mousePos.y}%`, scale: isZoomed ? 1.8 : 1, transition: "scale 0.2s ease-out" }}
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80"; }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Product info — compact, no scroll, fits beside image */}
        <div className="flex-1 min-w-0 pt-0 lg:pt-2">

          {/* Category */}
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-violet-600 mb-1.5">
            {product.category_name}
          </p>

          {/* Name */}
          <h1 className="text-[17px] font-semibold text-[#041e3a] leading-snug mb-1.5">
            {product.product_name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-yellow-400 gap-px">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
            </div>
            <span className="text-[10px] text-gray-400">4.9 · 128 reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-gray-100">
            <span className="text-[19px] font-bold text-[#041e3a]">{formatCatalogPrice(currentPrice)}</span>
            <span className="text-[10px] text-green-600 font-semibold">Free delivery</span>
          </div>

          {/* Description */}
          <p className="text-[11px] leading-5 text-gray-400 mb-4">
            {product.description || "Premium quality, crafted for comfort and everyday style."}
          </p>

          {/* Size */}
          {sizeOptions.length ? (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Select Size</span>
                <button className="text-[10px] text-gray-400 underline underline-offset-2 hover:text-[#041e3a]">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-9 h-9 flex items-center justify-center text-[11px] font-medium border transition-all ${
                      selectedSize === size
                        ? "border-[#041e3a] bg-[#041e3a] text-white"
                        : "border-gray-200 text-gray-500 hover:border-[#041e3a]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Color */}
          {colorOptions.length ? (
            <div className="mb-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 block mb-2">Color</span>
              <div className="flex flex-wrap gap-1.5">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 text-[10px] font-medium border transition-all ${
                      selectedColor === color
                        ? "border-[#041e3a] bg-[#041e3a] text-white"
                        : "border-gray-200 text-gray-400 hover:border-[#041e3a]"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* CTA */}
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              className={`flex-1 h-11 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors ${
                isAddDisabled ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-[#041e3a] text-white hover:bg-[#041e3a]/90"
              }`}
            >
              {addingToCart
                ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding…</>
                : currentStock === 0 ? "Out of Stock" : "Add to Bag"}
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={savingWishlist}
              className="w-11 h-11 border border-gray-200 flex items-center justify-center hover:border-[#041e3a] text-gray-400 hover:text-[#041e3a] transition-colors shrink-0"
            >
              <Heart className={`w-3.5 h-3.5 ${savingWishlist ? "fill-red-500 text-red-500 animate-pulse" : ""}`} />
            </button>
          </div>

          {/* Meta */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            {[
              { label: "Availability", value: currentStock === null ? "On request" : currentStock > 0 ? "In Stock" : "Unavailable", cls: currentStock > 0 ? "text-green-600" : "text-red-500" },
              { label: "SKU", value: selectedVariant?.sku || "N/A", cls: "text-gray-400" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between text-[10px]">
                <span className="text-gray-300 uppercase tracking-wider">{label}</span>
                <span className={`font-medium ${cls}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-gray-100 pt-10 mt-12">
        <ProductReviewsSection productId={product.id} productName={product.product_name} />
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-100 pt-10 pb-8 mt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-1 text-center">You May Also Like</p>
          <h2 className="text-lg font-semibold text-[#041e3a] mb-6 text-center">Complete the Look</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
