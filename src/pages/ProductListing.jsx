import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Filter } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import ProductCard from "../components/store/ProductCard";
import { buildCatalogImageUrl, formatCatalogPrice, getStoreFilters, getStoreProducts } from "../services/catalogService";

const normalizeOptionValue = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
const featureCategoryKeys = new Set(["men", "women", "kids"]);
const resolveOptionId = (options, rawValue) => {
  if (!rawValue) {
    return "";
  }

  if (!Number.isNaN(Number(rawValue))) {
    return String(rawValue);
  }

  const matchedOption = (options || []).find((option) => normalizeOptionValue(option.name) === normalizeOptionValue(rawValue));
  return matchedOption ? String(matchedOption.id) : String(rawValue);
};

function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const skipNextUrlSyncRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    subcategory: searchParams.get("subcategory") || "",
    type: searchParams.get("type") || "",
    brand: searchParams.get("brand") || "",
    size: searchParams.get("size") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || ""
  });
  
  const [sortOption, setSortOption] = useState(searchParams.get("sort") || "new");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [catalogFilters, setCatalogFilters] = useState({
    categories: [], subcategories: [], types: [], brands: [], sizes: [], price_range: { min: 0, max: 0 }
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
          const nextFilters = response.filters || { categories: [], subcategories: [], types: [], brands: [], sizes: [], colors: [], price_range: { min: 0, max: 0 } };
          setCatalogFilters(nextFilters);

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
    const nextSearchTerm = searchParams.get("search") || "";
    const nextSortOption = searchParams.get("sort") || "new";
    const nextCategory = searchParams.get("category") || "";
    const nextSubcategory = searchParams.get("subcategory") || "";
    const nextType = searchParams.get("type") || "";
    const nextBrand = searchParams.get("brand") || "";
    const nextSize = searchParams.get("size") || "";
    const nextMinPrice = searchParams.get("minPrice") || "";
    const nextMaxPrice = searchParams.get("maxPrice") || "";
    const fallbackMaxPrice = String(catalogFilters.price_range.max || 0);
    const targetSliderValue = nextMaxPrice || fallbackMaxPrice;
    const nextFilters = {
      category: nextCategory,
      subcategory: nextSubcategory,
      type: nextType,
      brand: nextBrand,
      size: nextSize,
      minPrice: nextMinPrice,
      maxPrice: nextMaxPrice
    };
    const shouldSyncFromUrl =
      searchTerm !== nextSearchTerm ||
      sortOption !== nextSortOption ||
      String(sliderPrice) !== String(targetSliderValue) ||
      JSON.stringify(filters) !== JSON.stringify(nextFilters);

    if (shouldSyncFromUrl) {
      // Prevent the URL sync effect from writing stale local state back to the URL.
      skipNextUrlSyncRef.current = true;
    }

    setSearchTerm((current) => (current === nextSearchTerm ? current : nextSearchTerm));
    setSortOption((current) => (current === nextSortOption ? current : nextSortOption));
    setSliderPrice((current) => {
      const targetValue = targetSliderValue;
      return String(current) === String(targetValue) ? current : targetValue;
    });
    setFilters((current) => {
      return JSON.stringify(current) === JSON.stringify(nextFilters) ? current : nextFilters;
    });
  }, [searchParams, catalogFilters]);

  useEffect(() => {
    let ignore = false;
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const resolvedCategory = resolveOptionId(catalogFilters.categories, filters.category);
        const resolvedSubcategory = resolveOptionId(catalogFilters.subcategories, filters.subcategory);
        const resolvedType = resolveOptionId(catalogFilters.types, filters.type);
        const resolvedBrand = resolveOptionId(catalogFilters.brands, filters.brand);

        const response = await getStoreProducts({
          category: resolvedCategory,
          subcategory: resolvedSubcategory,
          type: resolvedType,
          brand: resolvedBrand,
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
  }, [filters.brand, filters.category, filters.subcategory, filters.type, filters.size, deferredSearchTerm, catalogFilters]);

  useEffect(() => {
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (filters.category) params.set("category", filters.category);
    if (filters.subcategory) params.set("subcategory", filters.subcategory);
    if (filters.type) params.set("type", filters.type);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.size) params.set("size", filters.size);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (sortOption) params.set("sort", sortOption);
    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      setSearchParams(params, { replace: true });
    }
  }, [filters, searchTerm, sortOption, searchParams, setSearchParams]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      if (name === "category") {
        return { ...prev, category: value, subcategory: "", type: "" };
      }

      if (name === "subcategory") {
        return { ...prev, subcategory: value, type: "" };
      }

      return { ...prev, [name]: value };
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({ category: "", subcategory: "", type: "", brand: "", size: "", minPrice: "", maxPrice: "" });
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

  const visibleSubcategories = (catalogFilters.subcategories || []).filter((subcategory) => {
    if (!filters.category) {
      return true;
    }
    return Number(subcategory.category_id) === Number(filters.category);
  });

  const visibleTypes = (catalogFilters.types || []).filter((itemType) => {
    if (!filters.subcategory) {
      return true;
    }
    return Number(itemType.subcategory_id) === Number(filters.subcategory);
  });

  const selectedCategory = useMemo(
    () => {
      const resolvedId = resolveOptionId(catalogFilters.categories, filters.category);
      return (catalogFilters.categories || []).find((category) => String(category.id) === String(resolvedId)) || null;
    },
    [catalogFilters.categories, filters.category]
  );

  const selectedCategoryKey = selectedCategory ? normalizeOptionValue(selectedCategory.name) : "";
  const showCategoryShowcase = featureCategoryKeys.has(selectedCategoryKey);

  const selectedSubcategory = useMemo(() => {
    if (!filters.subcategory) {
      return null;
    }

    const resolvedId = resolveOptionId(catalogFilters.subcategories, filters.subcategory);
    return (
      (catalogFilters.subcategories || []).find((subcategory) => String(subcategory.id) === String(resolvedId)) || null
    );
  }, [catalogFilters.subcategories, filters.subcategory]);

  const showcaseTypes = useMemo(() => {
    const scopedTypes = selectedSubcategory
      ? (catalogFilters.types || []).filter((itemType) => Number(itemType.subcategory_id) === Number(selectedSubcategory.id))
      : visibleTypes;

    return scopedTypes.slice(0, 8);
  }, [catalogFilters.types, selectedSubcategory, visibleTypes]);

  const showcaseProducts = useMemo(() => visibleProducts.slice(0, 4), [visibleProducts]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10 md:px-10 lg:py-16 selection:bg-accent/20">
      {showCategoryShowcase ? (
        <section className="mb-12 overflow-hidden border border-[#e8e0d4] bg-[#f7f3ec]">
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-b border-[#e8e0d4] bg-[#fbf8f2] px-6 py-10 lg:border-b-0 lg:border-r">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b746a]">
                {selectedCategory?.name} Filter
              </p>
              <div className="mt-8 space-y-5">
                <button
                  type="button"
                  onClick={() => handleFilterChange("subcategory", "")}
                  className={`block text-left text-[17px] transition-colors ${
                    !filters.subcategory ? "font-semibold text-[#102741] underline underline-offset-8" : "text-[#5f5a53] hover:text-[#102741]"
                  }`}
                >
                  All {selectedCategory?.name}
                </button>
                {visibleSubcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    type="button"
                    onClick={() => handleFilterChange("subcategory", String(subcategory.id))}
                    className={`block text-left text-[17px] transition-colors ${
                      String(filters.subcategory) === String(subcategory.id)
                        ? "font-semibold text-[#102741] underline underline-offset-8"
                        : "text-[#5f5a53] hover:text-[#102741]"
                    }`}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            </aside>

            <div className="px-6 py-8 md:px-8 lg:px-10">
              <div className="flex flex-col gap-4 border-b border-[#c9c0b4] pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7b746a]">
                    {selectedCategory?.name} Collection
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-[#102741]">
                    {selectedSubcategory?.name || `${selectedCategory?.name} Essentials`}
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-[#5f5a53]">
                  Browse category-first shopping with quick jumps into subcategories, types, and featured pieces without losing your current filter state.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {showcaseTypes.length ? (
                  showcaseTypes.map((itemType) => (
                    <button
                      key={itemType.id}
                      type="button"
                      onClick={() => handleFilterChange("type", String(itemType.id))}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                        String(filters.type) === String(itemType.id)
                          ? "border-[#102741] bg-[#102741] text-white"
                          : "border-[#d5cec3] bg-white text-[#102741] hover:border-[#102741]"
                      }`}
                    >
                      {itemType.name}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-[#6b645b]">No type filters available in this section yet.</span>
                )}
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {showcaseProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="group overflow-hidden bg-white shadow-sm ring-1 ring-[#e6e0d6] transition-transform hover:-translate-y-1"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-[#ece7de]">
                      <img
                        src={buildCatalogImageUrl(product.hero_image) || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"}
                        alt={product.product_name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b746a]">
                        {product.brand_name || product.category_name}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#102741]">{product.product_name}</h3>
                      <p className="mt-3 text-sm font-medium text-[#3d3a35]">
                        {formatCatalogPrice(product.price_from || product.base_price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
      
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 border-b border-soft pb-8">
         <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-primary">
              {selectedCategory?.name ? `${selectedCategory.name} Collection` : "Collection"}
            </h1>
            <p className="text-secondary mt-3">
              {selectedSubcategory?.name
                ? `Filtered by ${selectedSubcategory.name}. Explore the latest pieces without losing your selected category flow.`
                : "Discover the latest pieces thoughtfully crafted for you."}
            </p>
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
                        <input type="radio" name="category" checked={resolveOptionId(catalogFilters.categories, filters.category) === String(cat.id)} onChange={() => handleFilterChange("category", String(cat.id))} className="w-4 h-4 text-primary bg-input border-soft rounded cursor-pointer accent-primary" />
                        <span className="text-sm text-secondary group-hover:text-primary font-medium transition-colors">{cat.name}</span>
                     </label>
                  ))}
               </div>
            </div>

            <div className="mb-8">
               <h3 className="text-sm font-bold text-primary mb-4">Subcategory</h3>
               <div className="relative">
                 <select
                    value={resolveOptionId(catalogFilters.subcategories, filters.subcategory)}
                    onChange={(e) => handleFilterChange("subcategory", e.target.value)}
                    className="w-full bg-canvas rounded-xl px-4 py-3 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-accent/30 appearance-none border border-soft shadow-sm cursor-pointer"
                 >
                    <option value="">All Subcategories</option>
                    {visibleSubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
               </div>
            </div>

            <div className="mb-8">
               <h3 className="text-sm font-bold text-primary mb-4">Type</h3>
               <div className="relative">
                 <select
                    value={resolveOptionId(catalogFilters.types, filters.type)}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full bg-canvas rounded-xl px-4 py-3 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-accent/30 appearance-none border border-soft shadow-sm cursor-pointer"
                 >
                    <option value="">All Types</option>
                    {visibleTypes.map((itemType) => (
                      <option key={itemType.id} value={itemType.id}>{itemType.name}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
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
                 <select value={resolveOptionId(catalogFilters.brands, filters.brand)} onChange={(e) => handleFilterChange("brand", e.target.value)} className="w-full bg-canvas rounded-xl px-4 py-3 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-accent/30 appearance-none border border-soft shadow-sm cursor-pointer">
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
