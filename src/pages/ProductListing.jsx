import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import ProductCard from "../components/store/ProductCard";
import { formatCatalogPrice, getStoreFilters, getStoreProducts } from "../services/catalogService";

function ProductListing() {
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
          setCatalogFilters(response.filters || { categories: [], brands: [], sizes: [], price_range: { min: 0, max: 0 } });
          if (!searchParams.get("maxPrice") && response.filters?.price_range?.max) {
             setSliderPrice(response.filters.price_range.max);
          }
        }
      } catch (apiError) {
         if(!ignore) setError(apiError.message);
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
            setProducts(response.products || []);
          });
        }
      } catch (apiError) {
        if (!ignore) setError(apiError.message);
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
  };

  const visibleProducts = products.filter((product) => {
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;
    const priceFrom = Number(product.price_from || product.base_price);
    if (maxPrice !== null && priceFrom > maxPrice) return false;
    return true;
  }).sort((a, b) => {
     const priceA = Number(a.price_from || a.base_price);
     const priceB = Number(b.price_from || b.base_price);
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
    <div className="max-w-[1440px] mx-auto px-6 py-10 md:px-10 lg:py-16 selection:bg-accent/20">
      
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 border-b border-soft pb-8">
         <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-primary">Collection</h1>
            <p className="text-secondary mt-3">Discover the latest pieces thoughtfully crafted for you.</p>
         </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="lg:hidden flex items-center gap-2 px-4 py-2 border border-soft rounded-lg bg-canvas text-sm font-semibold text-primary shadow-sm hover:bg-input" onClick={() => setShowMobileFilters(!showMobileFilters)}>
               <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="relative w-full md:w-64">
               <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none w-full bg-input rounded-xl px-4 py-3 pr-10 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer border border-soft shadow-sm"
               >
                  <option value="new">Sort by: New Arrivals</option>
                  <option value="popular">Sort by: Popularity</option>
                  <option value="price-asc">Sort by: Price (Low to High)</option>
                  <option value="price-desc">Sort by: Price (High to Low)</option>
               </select>
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
         
         <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-[280px] shrink-0 flex-col gap-8 sticky top-32 h-fit mb-10 lg:mb-0`}>
            
            <div className="mb-8">
               <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                     type="text" 
                     placeholder="Search products..." 
                     value={searchTerm} 
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-canvas pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 border border-soft shadow-sm placeholder:text-muted"
                  />
               </div>
            </div>

            <div className="mb-8 bg-canvas p-6 rounded-2xl border border-soft shadow-soft">
               <h3 className="text-sm font-bold text-primary mb-5 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent"></div>Price Range</h3>
               <div className="px-1">
                  <input 
                     type="range" 
                     min={catalogFilters.price_range.min || 0} 
                     max={catalogFilters.price_range.max || 1000} 
                     value={sliderPrice}
                     onChange={(e) => setSliderPrice(e.target.value)}
                     onMouseUp={(e) => handleFilterChange("maxPrice", e.target.value)}
                     className="w-full h-1.5 bg-input rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs font-semibold text-secondary mt-4 bg-input px-3 py-1.5 rounded-lg">
                     <span>{formatCatalogPrice(catalogFilters.price_range.min || 0)}</span>
                     <span>{formatCatalogPrice(sliderPrice)}</span>
                  </div>
               </div>
            </div>

            <div className="mb-8">
               <h3 className="text-sm font-bold text-primary mb-4">Category</h3>
               <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                     <input type="radio" name="category" checked={filters.category === ""} onChange={() => handleFilterChange("category", "")} className="w-4 h-4 text-primary bg-input border-soft rounded cursor-pointer accent-primary" />
                     <span className="text-sm text-secondary group-hover:text-primary font-medium transition-colors">All Categories</span>
                  </label>
                  {catalogFilters.categories.map(cat => (
                     <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="category" checked={filters.category === String(cat.id)} onChange={() => handleFilterChange("category", String(cat.id))} className="w-4 h-4 text-primary bg-input border-soft rounded cursor-pointer accent-primary" />
                        <span className="text-sm text-secondary group-hover:text-primary font-medium transition-colors">{cat.name}</span>
                     </label>
                  ))}
               </div>
            </div>

            <div className="mb-8">
               <h3 className="text-sm font-bold text-primary mb-4">Size</h3>
               <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleFilterChange("size", "")} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${filters.size === "" ? "border-primary bg-primary text-canvas" : "border-soft bg-canvas text-secondary hover:border-primary hover:text-primary shadow-sm"}`}>
                     Any
                  </button>
                  {catalogFilters.sizes.map(size => (
                     <button key={size} onClick={() => handleFilterChange("size", size)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${filters.size === size ? "border-primary bg-primary text-canvas" : "border-soft bg-canvas text-secondary hover:border-primary hover:text-primary shadow-sm"}`}>
                        {size}
                     </button>
                  ))}
               </div>
            </div>

            <div className="mb-8">
               <h3 className="text-sm font-bold text-primary mb-4">Brand</h3>
               <div className="relative">
                 <select value={filters.brand} onChange={(e) => handleFilterChange("brand", e.target.value)} className="w-full bg-canvas rounded-xl px-4 py-3 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-accent/30 appearance-none border border-soft shadow-sm cursor-pointer">
                    <option value="">All Brands</option>
                    {catalogFilters.brands.map(brand => (
                       <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
               </div>
            </div>

            <button onClick={clearFilters} className="w-full py-3 rounded-xl bg-input border border-soft text-secondary text-sm font-bold hover:bg-page hover:text-primary shadow-sm transition-all">
               Reset Filters
            </button>
         </aside>

         <div className="flex-1 min-w-0">
            {error && <StatusBanner tone="danger">{error}</StatusBanner>}

            {loading ? (
               <div className="w-full h-64 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-input border-t-primary animate-spin"></div>
               </div>
            ) : visibleProducts.length === 0 ? (
               <EmptyState title="No items found" description="Try adjusting your filters to see more results." />
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  {visibleProducts.map((product, i) => (
                     <motion.div
                       key={product.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.4, delay: i * 0.05 }}
                     >
                       <ProductCard product={product} />
                     </motion.div>
                  ))}
               </div>
            )}
         </div>

      </div>
    </div>
  );
}

export default ProductListing;
