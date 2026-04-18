import { useState } from "react";
import { Eye, Heart, Star, ShoppingBag } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

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

  // 3D Tilt Effect
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  
  const rotateX = useTransform(smoothY, [0, 1], [6, -6]);
  const rotateY = useTransform(smoothX, [0, 1], [-6, 6]);
  const imageParallaxX = useTransform(smoothX, [0, 1], [-4, 4]);
  const imageParallaxY = useTransform(smoothY, [0, 1], [-4, 4]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const imageUrl = buildCatalogImageUrl(product.hero_image);
  
  const hoverImageUrl = product.images?.length > 1 
     ? buildCatalogImageUrl(product.images[1]?.image_url) 
     : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80";

  const priceLabel =
    Number(product.price_from) !== Number(product.price_to)
      ? `${formatCatalogPrice(product.price_from)} - ${formatCatalogPrice(product.price_to)}`
      : formatCatalogPrice(product.price_from || product.base_price);
      
  const rating = 4.8;
  const reviews = 124;

  const toggleWishlist = (e) => {
     e.preventDefault();
     e.stopPropagation();
     setIsWishlisted(!isWishlisted);
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
      const response = await addCartItem({ productId: product.id, variantId: product.variants?.[0]?.id || null, quantity: 1 });
      setCartNotice(true);
      toastSuccess(response.message || `${product.product_name} added to cart`);
      setTimeout(() => setCartNotice(false), 2000);
    } catch (apiError) {
      toastError(apiError.message || "Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="group flex flex-col bg-canvas rounded-[24px] overflow-hidden border border-soft shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-shadow relative h-full will-change-transform preserving-3d"
      >
        <Link to={`/products/${product.slug}`} className="absolute inset-0 z-0" />
        
        <div className="relative aspect-[4/5] overflow-hidden bg-input/50 z-10 pointer-events-none">
          
          {/* Wishlist Button */}
          <button 
             onClick={toggleWishlist}
             className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/80 backdrop-blur border border-soft hover:bg-white hover:scale-110 transition-transform shadow-sm pointer-events-auto"
          >
             <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-primary"}`} />
          </button>

          {/* Quick Add To Cart Button (Top Left) */}
          <button 
             onClick={handleAddToCart}
             disabled={addingToCart || cartNotice}
             className={`absolute top-4 left-4 z-30 p-2.5 rounded-full backdrop-blur border transition-all pointer-events-auto overflow-hidden flex items-center gap-2 ${
               cartNotice ? "bg-success text-white border-success scale-105" 
               : "bg-white/80 border-soft hover:bg-primary hover:text-white hover:scale-105 shadow-sm text-primary"
             }`}
          >
             {addingToCart ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div> 
             : cartNotice ? <motion.span initial={{scale:0}} animate={{scale:1}} className="text-xs font-bold px-1 uppercase tracking-wider">Added</motion.span>
             : <ShoppingBag className="w-4 h-4" />}
          </button>

          {/* Base Image */}
          <motion.img
            style={{ x: imageParallaxX, y: imageParallaxY }}
            src={imageUrl && !imageUrl.includes('undefined') ? imageUrl : "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"}
            alt={product.product_name}
            className="absolute inset-[-5%] h-[110%] w-[110%] max-w-none object-cover transition-opacity duration-700 group-hover:opacity-0"
            onError={(e) => {
               e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";
            }}
          />

          {/* Hover / Secondary Image */}
          <motion.img
            style={{ x: imageParallaxX, y: imageParallaxY }}
            src={hoverImageUrl}
            alt={`Hover - ${product.product_name}`}
            className="absolute inset-[-5%] h-[110%] w-[110%] max-w-none object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
          />

          {/* Quick View Overlay (Bottom center of image) */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto flex justify-center z-20">
             <button 
               onClick={handleQuickView}
               className="flex bg-canvas/90 backdrop-blur text-primary px-6 py-3 rounded-full font-bold text-[11px] uppercase tracking-widest items-center gap-2 shadow-float border border-soft hover:bg-canvas transition-colors w-full justify-center"
             >
                <Eye className="w-4 h-4" /> Quick View
             </button>
          </div>
        </div>

        <div className="flex flex-col p-6 grow z-10 pointer-events-none">
          <div className="flex justify-between items-start gap-4 mb-2">
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{product.category_name}</p>
                <h3 className="mt-1.5 text-lg font-bold text-primary truncate max-w-[180px]">{product.product_name}</h3>
             </div>
             <p className="font-bold text-primary shrink-0">{priceLabel}</p>
          </div>

          <div className="flex items-center gap-1.5 mb-5 mt-1">
             <Star className="w-3.5 h-3.5 fill-accent text-accent" />
             <span className="text-xs font-semibold text-primary">{rating}</span>
             <span className="text-xs text-muted">({reviews})</span>
          </div>

          <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-soft/60">
            {product.available_sizes?.slice(0, 3).map((size) => (
              <span
                key={`${product.id}-${size}`}
                className="bg-input text-secondary px-2.5 py-1 rounded text-xs font-medium border border-soft shadow-sm"
              >
                {size}
              </span>
            ))}
            {!product.available_sizes?.length ? (
              <span className="bg-input text-secondary px-2.5 py-1 rounded text-xs font-medium border border-soft shadow-sm">Made to order</span>
            ) : null}
          </div>
        </div>
      </motion.div>

      <ProductQuickViewModal 
         product={product} 
         isOpen={isQuickViewOpen} 
         onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
}

export default ProductCard;
