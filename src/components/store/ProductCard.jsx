import { useState } from "react";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { buildCatalogImageUrl, formatCatalogPrice } from "../../services/catalogService";
import { addCartItem } from "../../services/cartService";
import { isAuthenticated } from "../../utils/auth";
import { useToast } from "../../context/ToastContext";
import ProductQuickViewModal from "./ProductQuickViewModal";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartNotice, setCartNotice] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const imageUrl = buildCatalogImageUrl(product.hero_image);
  const hoverImageUrl =
    product.images?.length > 1
      ? buildCatalogImageUrl(product.images[1]?.image_url)
      : null;

  const priceLabel =
    Number(product.price_from) !== Number(product.price_to)
      ? `${formatCatalogPrice(product.price_from)} – ${formatCatalogPrice(product.price_to)}`
      : formatCatalogPrice(product.price_from || product.base_price);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((v) => !v);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      setAddingToCart(true);
      const response = await addCartItem({
        productId: product.id,
        variantId: product.variants?.[0]?.id || null,
        quantity: 1,
      });
      setCartNotice(true);
      toastSuccess(response.message || `${product.product_name} added to cart`);
      setTimeout(() => setCartNotice(false), 2200);
    } catch (apiError) {
      toastError(apiError.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const fallbackImg =
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80";

  return (
    <>
      <div className="group relative flex flex-col bg-white cursor-pointer">

        {/* ── Image Block ───────────────────────── */}
        <Link to={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-50">

          {/* Primary image */}
          <img
            src={imageUrl && !imageUrl.includes("undefined") ? imageUrl : fallbackImg}
            alt={product.product_name}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${hoverImageUrl ? "group-hover:opacity-0" : ""}`}
            onError={(e) => { e.target.src = fallbackImg; }}
          />

          {/* Hover image (if available) */}
          {hoverImageUrl && (
            <img
              src={hoverImageUrl}
              alt={product.product_name}
              className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-[1.03]"
            />
          )}

          {/* Wishlist — top right */}
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            />
          </button>

          {/* Bottom action bar — slides up on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <div className="flex">
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || cartNotice}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  cartNotice
                    ? "bg-[#041e3a] text-white"
                    : "bg-white text-[#041e3a] hover:bg-[#041e3a] hover:text-white"
                }`}
              >
                {addingToCart ? (
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : cartNotice ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ Added</motion.span>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Add to Bag
                  </>
                )}
              </button>

              {/* Quick View divider + button */}
              <button
                onClick={handleQuickView}
                className="px-4 py-3 bg-white border-l border-gray-100 text-gray-400 hover:text-[#041e3a] hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Link>

        {/* ── Product Info ─────────────────────── */}
        <div className="pt-2 pb-3 px-0.5">
          {/* Brand */}
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-0.5 truncate">
            {product.brand_name || product.category_name}
          </p>

          {/* Name */}
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-[12px] font-medium text-[#041e3a] leading-snug line-clamp-2 hover:underline underline-offset-2 transition-all mb-1.5">
              {product.product_name}
            </h3>
          </Link>

          {/* Price row */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#041e3a]">{priceLabel}</span>
          </div>

          {/* Sizes */}
          {product.available_sizes?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {product.available_sizes.slice(0, 4).map((size) => (
                <span
                  key={`${product.id}-${size}`}
                  className="text-[8px] uppercase tracking-wider text-gray-400 border border-gray-200 px-1 py-0.5"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductQuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

export default ProductCard;
