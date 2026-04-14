import { useState } from "react";
import { Eye, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { buildCatalogImageUrl, formatCatalogPrice } from "../../services/catalogService";

function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const imageUrl = buildCatalogImageUrl(product.hero_image);
  
  // Use a secondary image for hover, or fallback to a standard related-looking placeholder if none
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
     // Typically open a modal here, but for now we simulate the interaction
     alert("Opening Quick View Modal for: " + product.product_name);
  };

  return (
    <motion.div
      whileHover={{ y: -5, rotateY: 2, rotateX: 2, transformPerspective: 1000 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group flex flex-col bg-canvas rounded-[24px] overflow-hidden border border-soft shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all relative h-full"
    >
      <Link to={`/products/${product.slug}`} className="absolute inset-0 z-0" />
      
      <div className="relative aspect-[4/5] overflow-hidden bg-input/50 z-10 pointer-events-none">
        
        {/* Wishlist Button (absolute top right, high Z, pointer events enabled) */}
        <button 
           onClick={toggleWishlist}
           className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/80 backdrop-blur border border-soft hover:bg-white hover:scale-110 transition-transform shadow-sm pointer-events-auto"
        >
           <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-primary"}`} />
        </button>

        {/* Base Image */}
        <img
          src={imageUrl && !imageUrl.includes('undefined') ? imageUrl : "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"}
          alt={product.product_name}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:opacity-0"
          onError={(e) => {
             e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";
          }}
        />

        {/* Hover / Secondary Image */}
        <img
          src={hoverImageUrl}
          alt={`Hover - ${product.product_name}`}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
        />

        {/* Quick View Overlay (Bottom center of image) */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto flex justify-center z-20">
           <button 
             onClick={handleQuickView}
             className="flex bg-canvas text-primary px-6 py-3 rounded-full font-bold text-[11px] uppercase tracking-widest items-center gap-2 shadow-float border border-soft hover:bg-input transition-colors w-full justify-center"
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
  );
}

export default ProductCard;
