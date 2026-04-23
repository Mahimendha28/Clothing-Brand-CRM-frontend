import { useState, startTransition } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { buildCatalogImageUrl, formatCatalogPrice } from "../../services/catalogService";
import { addCartItem } from "../../services/cartService";
import { isAuthenticated } from "../../utils/auth";
import { useToast } from "../../context/ToastContext";

function ProductQuickViewModal({ product, isOpen, onClose }) {
  const [addingToCart, setAddingToCart] = useState(false);
  const { toastSuccess, toastError } = useToast();

  if (!product) return null;

  const currentPrice = product.price_from || product.base_price;
  const rating = 4.8;
  const reviews = 124;

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    try {
      setAddingToCart(true);
      const response = await addCartItem({ productId: product.id, variantId: product.variants?.[0]?.id || null, quantity: 1 });
      toastSuccess(response.message || `${product.product_name} added to cart`);
    } catch (apiError) {
      toastError(apiError.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-canvas w-full max-w-4xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row "
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-white/50 backdrop-blur hover:bg-white text-primary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left side Image */}
            <div className="w-full md:w-1/2 h-[300px] md:h-auto bg-input relative group overflow-hidden">
              <img
                src={buildCatalogImageUrl(product.hero_image) || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"}
                alt={product.product_name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {product.images?.length > 1 && (
                <img
                  src={buildCatalogImageUrl(product.images[1]?.image_url)}
                  alt="hover"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                />
              )}
            </div>

            {/* Right side Details */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-muted mb-2">
                {product.category_name}
              </span>
              <h2 className="text-3xl font-display font-bold text-primary mb-3">
                {product.product_name}
              </h2>
              <p className="text-2xl font-bold text-primary mb-6">
                {formatCatalogPrice(currentPrice)}
              </p>

              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-secondary">
                <div className="flex text-accent drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                {rating} ({reviews} reviews)
              </div>

              <p className="text-secondary text-sm leading-relaxed mb-8">
                {product.description || "Premium quality clothing designed with careful attention to detail."}
              </p>

              <div className="mt-auto flex flex-col gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full py-4 bg-primary text-canvas rounded-[var(--radius-sm)] flex justify-center items-center gap-2 font-bold transition-all shadow-float drop-shadow-md hover:-translate-y-1"
                >
                  {addingToCart ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><ShoppingBag className="w-5 h-5" /> Quick Add to Cart</>
                  )}
                </motion.button>
                <Link
                  to={`/products/${product.slug}`}
                  onClick={onClose}
                  className="w-full text-center py-4 bg-canvas text-primary border border-strong rounded-[var(--radius-sm)] font-bold hover:bg-input transition-colors"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ProductQuickViewModal;
