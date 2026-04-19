import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, Filter, X, ChevronRight } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import ProductCard from "../components/store/ProductCard";
import { formatCatalogPrice, getStoreFilters, getStoreProducts, buildCatalogImageUrl } from "../services/catalogService";

function ProductListing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    size: searchParams.get("size") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || ""
  });
  
  const [sortOption, setSortOption] = useState(searchParams.get("sort") || "new");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [catalogFilters, setCatalogFilters] = useState({
    categories: [], brands: [], sizes: [], price_range: { min: 0, max: 0 }
  });
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const [sliderPrice, setSliderPrice] = useState(searchParams.get("maxPrice") || 0);

  useEffect(() => {
    let ignore = false;
    const loadFilters = async () => {
      try {
        const response = await getStoreFilters();
        if (!ignore) {
          setCatalogFilters(response?.filters || { categories: [], brands: [], sizes: [], price_range: { min: 0, max: 0 } });
          if (!searchParams.get("maxPrice") && response?.filters?.price_range?.max) {
             setSliderPrice(response.filters.price_range.max);
          }
        }
      } catch (apiError) {
         if(!ignore) setError(apiError?.message);
      }
    };
    loadFilters();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getStoreProducts({
          category: filters.category,
          brand: filters.brand,
          size: filters.size,
          search: deferredSearchTerm.trim()
        });

        if (!ignore) {
          startTransition(() => {
            setProducts(response?.products || []);
          });
        }
      } catch (apiError) {
        if (!ignore) setError(apiError?.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadProducts();
    return () => { ignore = true; };
  }, [filters.brand, filters.category, filters.size, deferredSearchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.size) params.set("size", filters.size);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (sortOption) params.set("sort", sortOption);
    setSearchParams(params, { replace: true });
  }, [filters, searchTerm, sortOption, setSearchParams]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({ category: "", brand: "", size: "", minPrice: "", maxPrice: "" });
    setSliderPrice(catalogFilters.price_range.max || 1000);
    setSortOption("new");
    navigate("/products");
  };

  const sortedProducts = [...products].sort((a, b) => {
     const priceA = Number(a.price_from || a.base_price || a.price);
     const priceB = Number(b.price_from || b.base_price || b.price);
     switch(sortOption) {
        case 'price-asc': return priceA - priceB;
        case 'price-desc': return priceB - priceA;
        case 'popular': return (b.rating || 5) - (a.rating || 5);
        case 'new': 
        default: 
           return new Date(b.created_at || 0) - new Date(a.created_at || 0);
     }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header / Breadcrumbs Area */}
      <div className="border-b border-[var(--color-border-light)] py-4 bg-white">
         <div className="shop-container flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--color-text-subtle)]">
               <Link to="/" className="hover:text-black">Home</Link>
               <ChevronRight className="w-3 h-3" />
               <span className="text-black font-black uppercase tracking-widest">Clothing Archive</span>
            </div>
            <div className="text-sm font-medium">
               <span className="text-[var(--color-text-main)] font-black uppercase mr-2 italic">{sortedProducts.length}</span> items found
            </div>
         </div>
      </div>

      <div className="shop-container py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters (Myntra Style) */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0 space-y-10">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-black uppercase tracking-widest">Filters</h2>
               <button onClick={clearFilters} className="text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest hover:underline">Clear All</button>
            </div>

            {/* Categories */}
            <div className="border-t border-[var(--color-border-light)] pt-6">
              <h3 className="filter-section-title">Categories</h3>
              <div className="space-y-1">
                {['Men', 'Women', 'Kids', 'Unisex', 'Accessories'].map((cat) => (
                  <label key={cat} className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      className="accent-[var(--color-primary)] w-4 h-4" 
                      checked={filters.category === cat.toLowerCase()}
                      onChange={() => handleFilterChange("category", filters.category === cat.toLowerCase() ? "" : cat.toLowerCase())}
                    />
                    <span className={filters.category === cat.toLowerCase() ? "font-bold text-black" : ""}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="border-t border-[var(--color-border-light)] pt-6">
              <h3 className="filter-section-title">Brands</h3>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {catalogFilters.brands.map((brand) => (
                  <label key={brand.id} className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      className="accent-[var(--color-primary)] w-4 h-4" 
                      checked={filters.brand === brand.name}
                      onChange={() => handleFilterChange("brand", filters.brand === brand.name ? "" : brand.name)}
                    />
                    <span className={filters.brand === brand.name ? "font-bold text-black" : ""}>{brand.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="border-t border-[var(--color-border-light)] pt-6">
              <h3 className="filter-section-title">Price Range</h3>
              <div className="space-y-4">
                <input 
                  type="range" 
                  min="0" 
                  max="50000" 
                  value={sliderPrice}
                  onChange={(e) => setSliderPrice(e.target.value)}
                  onMouseUp={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                />
                <div className="flex items-center justify-between text-[11px] font-black uppercase text-[var(--color-text-subtle)]">
                   <span>Min: ₹0</span>
                   <span className="text-[var(--color-primary)]">Max: {formatCatalogPrice(sliderPrice)}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Context */}
          <main className="flex-1">
            {/* Sorting & Search Subhead */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-[var(--color-border-light)] pb-8">
               <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search inside category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="shop-input pl-12 rounded-full border border-[var(--color-border-light)]"
                  />
               </div>

               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase text-[var(--color-text-subtle)] tracking-widest">Sort By:</span>
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-white border border-[var(--color-border-main)] rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-black cursor-pointer"
                  >
                    <option value="new">Newest First</option>
                    <option value="popular">Popularity</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
               </div>
            </div>

            {loading ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-4">
                       <div className="aspect-[3/4] bg-gray-100 rounded-sm" />
                       <div className="h-4 w-3/4 bg-gray-100" />
                       <div className="h-4 w-1/4 bg-gray-100" />
                    </div>
                  ))}
               </div>
            ) : error ? (
               <div className="p-12 text-center bg-red-50 text-red-500 rounded-xl font-bold italic">{error}</div>
            ) : sortedProducts.length === 0 ? (
               <div className="py-32 text-center bg-[var(--color-bg-surface)] rounded-xl">
                  <EmptyState title="No Products Found" description="Try adjusting your filters or search terms for better results." />
                  <button onClick={clearFilters} className="btn-primary mt-8">Reset All Filters</button>
               </div>
            ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                  <AnimatePresence mode="popLayout">
                    {sortedProducts.map((product, idx) => (
                       <motion.div
                         key={`product-${product.id || idx}-${idx}`}
                         layout
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         transition={{ duration: 0.4, delay: idx * 0.02 }}
                         className="product-card group"
                       >
                          <Link to={`/products/${product.slug}`}>
                            <div className="product-card-image relative group">
                               <img 
                                  src={buildCatalogImageUrl(product.images?.[0])} 
                                  alt={product.name}
                                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800"; }}
                               />
                               {/* Add to Cart Overlay (Myntra Style) */}
                               <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-white/95 backdrop-blur-sm border-t border-gray-100 flex flex-col gap-2 shadow-2xl z-20">
                                  <button className="w-full py-2.5 bg-[var(--color-primary)] text-white text-[10px] font-black uppercase tracking-widest rounded-sm">Quick Add</button>
                                  <div className="flex justify-center gap-1">
                                    {product.variants?.length > 0 
                                      ? Array.from(new Set(product.variants.map(v => v.size))).map(s => <span key={s} className="text-[9px] w-6 h-6 flex items-center justify-center border border-gray-200 rounded-full hover:border-black cursor-pointer">{s}</span>)
                                      : ['S','M','L','XL'].map(s => <span key={s} className="text-[9px] w-6 h-6 flex items-center justify-center border border-gray-200 rounded-full hover:border-black cursor-pointer">{s}</span>)
                                    }
                                  </div>
                               </div>
                            </div>
                            <div className="p-4 space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{product.brand?.name || "BADSHAH"}</p>
                               <h3 className="text-sm font-bold truncate text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors">{product.name}</h3>
                               <div className="flex items-center gap-2 pt-1">
                                 <span className="text-sm font-black">
                                   {product.variants?.length > 0 
                                     ? formatCatalogPrice(Math.min(...product.variants.map(v => v.price || product.price))) 
                                     : formatCatalogPrice(product.price)}
                                 </span>
                                 <span className="text-[10px] line-through text-gray-400 font-medium">{formatCatalogPrice((product.price || 0) * 1.5)}</span>
                                 <span className="text-[10px] text-[var(--status-error)] font-bold italic">(30% OFF)</span>
                               </div>
                            </div>
                          </Link>
                       </motion.div>
                    ))}
                  </AnimatePresence>
               </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <AnimatePresence>
         {isMobileFilterOpen && (
            <>
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 onClick={() => setIsMobileFilterOpen(false)}
                 className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm lg:hidden"
               />
               <motion.div 
                 initial={{ y: "100%" }} 
                 animate={{ y: 0 }} 
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white z-[101] rounded-t-3xl overflow-y-auto"
               >
                 <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-widest">Applied Filters</h2>
                    <button onClick={() => setIsMobileFilterOpen(false)}><X className="w-6 h-6" /></button>
                 </div>
                 <div className="p-8 space-y-10">
                    {/* Mobile filter content ... */}
                    <div className="space-y-4">
                      <h3 className="filter-section-title">Categories</h3>
                      <div className="grid grid-cols-2 gap-3">
                         {['Men', 'Women', 'Kids', 'Unisex'].map(c => (
                            <button key={c} className={`py-3 px-4 text-xs font-bold rounded-lg border ${filters.category === c.toLowerCase() ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-gray-200'}`} onClick={() => handleFilterChange("category", c.toLowerCase())}>{c}</button>
                         ))}
                      </div>
                    </div>
                 </div>
                 <div className="sticky bottom-0 bg-white border-t p-6">
                    <button className="btn-primary w-full" onClick={() => setIsMobileFilterOpen(false)}>Apply Filter</button>
                 </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

      {/* Mobile Action Buttons */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center bg-black text-white rounded-full shadow-2xl overflow-hidden divide-x divide-white/20">
         <button className="px-8 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900" onClick={() => setIsMobileFilterOpen(true)}>
            <Filter className="w-3 h-3" /> Filter
         </button>
         <div className="relative">
            <select className="bg-transparent px-8 py-3 text-[10px] font-black uppercase tracking-widest outline-none appearance-none" onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
               <option value="new">Latest</option>
               <option value="price-asc">Price Index: Low</option>
               <option value="price-desc">Price Index: High</option>
            </select>
         </div>
      </div>
    </div>
  );
}

export default ProductListing;
