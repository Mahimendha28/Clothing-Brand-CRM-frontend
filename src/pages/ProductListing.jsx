<<<<<<< HEAD
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Filter } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
=======
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, Filter, X, ChevronRight } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
import { AnimatePresence, motion } from "framer-motion";

import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import ProductCard from "../components/store/ProductCard";
<<<<<<< HEAD
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
=======
import { formatCatalogPrice, getStoreFilters, getStoreProducts, buildCatalogImageUrl } from "../services/catalogService";
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776

function ProductListing() {
  const navigate = useNavigate();
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
<<<<<<< HEAD
          const nextFilters = response.filters || { categories: [], subcategories: [], types: [], brands: [], sizes: [], colors: [], price_range: { min: 0, max: 0 } };
          setCatalogFilters(nextFilters);

          if (!searchParams.get("maxPrice") && response.filters?.price_range?.max) {
            setSliderPrice(response.filters.price_range.max);
          }
        }
      } catch (apiError) {
        if (!ignore) setError(apiError.message);
=======
          setCatalogFilters(response?.filters || { categories: [], brands: [], sizes: [], price_range: { min: 0, max: 0 } });
          if (!searchParams.get("maxPrice") && response?.filters?.price_range?.max) {
             setSliderPrice(response.filters.price_range.max);
          }
        }
      } catch (apiError) {
         if(!ignore) setError(apiError?.message);
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
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
    navigate("/products");
  };

<<<<<<< HEAD
  const visibleProducts = products.filter((product) => {
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;
    const priceFrom = Number(product.price_from || product.base_price);
    if (maxPrice !== null && priceFrom > maxPrice) return false;
    return true;
  }).sort((a, b) => {
    const priceA = Number(a.price_from || a.base_price);
    const priceB = Number(b.price_from || b.base_price);
    switch (sortOption) {
      case 'price-asc': return priceA - priceB;
      case 'price-desc': return priceB - priceA;
      case 'popular': return (b.rating || 5) - (a.rating || 5);
      case 'new':
      default:
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
=======
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
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
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
<<<<<<< HEAD
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="py-8 border-b border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-1">
            {selectedCategory?.name || "All"} Collection
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-semibold text-[#041e3a] tracking-tight">
              {selectedSubcategory?.name || selectedCategory?.name || "All Products"}
              <span className="ml-3 text-sm font-normal text-gray-400">
                {visibleProducts.length} items
              </span>
            </h1>

            {/* Sort + Mobile filter toggle */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold uppercase tracking-widest text-[#041e3a] hover:bg-gray-50 transition-colors"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
              </button>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 text-[11px] font-bold uppercase tracking-widest text-[#041e3a] outline-none cursor-pointer hover:border-[#041e3a] transition-colors"
                >
                  <option value="new">New Arrivals</option>
                  <option value="popular">Popularity</option>
                  <option value="price-asc">Price: Low – High</option>
                  <option value="price-desc">Price: High – Low</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
=======
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
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
            </div>
          </div>
        </motion.div>
      </div>

<<<<<<< HEAD
      {/* ── Body: Sidebar + Grid ─────────────────────────────────────── */}
      <div className="flex items-start gap-0 lg:gap-8 py-8">

        {/* ── LEFT: Filter Sidebar ─────────────────────────────────── */}
        <aside className={`${showMobileFilters ? "block" : "hidden"} lg:block w-full lg:w-[200px] xl:w-[220px] shrink-0 sticky top-28 h-fit`}>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input
              type="text"
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-6 pr-2 py-2 border-b border-gray-200 text-[12px] text-[#041e3a] placeholder:text-gray-300 outline-none focus:border-[#041e3a] bg-transparent transition-colors"
            />
          </div>

          {/* Filter section helper */}
          {[
            {
              label: "Price Range",
              content: (
                <div>
                  <input
                    type="range"
                    min={catalogFilters.price_range.min || 0}
                    max={catalogFilters.price_range.max || 10000}
                    value={sliderPrice}
                    onChange={(e) => setSliderPrice(e.target.value)}
                    onMouseUp={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="w-full h-px bg-gray-200 appearance-none cursor-pointer accent-[#041e3a] mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-2 uppercase tracking-wider">
                    <span>{formatCatalogPrice(catalogFilters.price_range.min || 0)}</span>
                    <span>{formatCatalogPrice(sliderPrice)}</span>
                  </div>
                </div>
              ),
            },
          ].map(({ label, content }) => (
            <div key={label} className="mb-6 pb-6 border-b border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">{label}</p>
              {content}
            </div>
          ))}

          {/* Category */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Category</p>
            <div className="space-y-2.5">
              <button
                onClick={() => handleFilterChange("category", "")}
                className={`block text-left text-[12px] transition-colors w-full ${!filters.category ? "font-bold text-[#041e3a]" : "text-gray-400 hover:text-[#041e3a]"}`}
              >
                All Categories
              </button>
              {catalogFilters.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleFilterChange("category", String(cat.id))}
                  className={`block text-left text-[12px] transition-colors w-full ${resolveOptionId(catalogFilters.categories, filters.category) === String(cat.id) ? "font-bold text-[#041e3a]" : "text-gray-400 hover:text-[#041e3a]"}`}
                >
                  {cat.name}
                </button>
              ))}
=======
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
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
            </div>
          </div>

<<<<<<< HEAD
          {/* Subcategory */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Subcategory</p>
            <div className="relative">
              <select
                value={resolveOptionId(catalogFilters.subcategories, filters.subcategory)}
                onChange={(e) => handleFilterChange("subcategory", e.target.value)}
                className="w-full bg-transparent text-[12px] text-[#041e3a] outline-none cursor-pointer appearance-none border-b border-gray-200 py-1.5 pr-5 focus:border-[#041e3a] transition-colors"
              >
                <option value="">All Subcategories</option>
                {visibleSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
=======
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
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
            </div>
          </div>

<<<<<<< HEAD
          {/* Type */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Type</p>
            <div className="relative">
              <select
                value={resolveOptionId(catalogFilters.types, filters.type)}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full bg-transparent text-[12px] text-[#041e3a] outline-none cursor-pointer appearance-none border-b border-gray-200 py-1.5 pr-5 focus:border-[#041e3a] transition-colors"
              >
                <option value="">All Types</option>
                {visibleTypes.map((itemType) => (
                  <option key={itemType.id} value={itemType.id}>{itemType.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
=======
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
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
            </div>
          </div>

<<<<<<< HEAD
          {/* Size */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Size</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange("size", "")}
                className={`w-9 h-9 text-[11px] font-semibold border transition-colors ${filters.size === "" ? "border-[#041e3a] bg-[#041e3a] text-white" : "border-gray-200 text-gray-500 hover:border-[#041e3a] hover:text-[#041e3a]"}`}
              >
                All
              </button>
              {catalogFilters.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleFilterChange("size", size)}
                  className={`w-9 h-9 text-[11px] font-semibold border transition-colors ${filters.size === size ? "border-[#041e3a] bg-[#041e3a] text-white" : "border-gray-200 text-gray-500 hover:border-[#041e3a] hover:text-[#041e3a]"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Brand</p>
            <div className="relative">
              <select
                value={resolveOptionId(catalogFilters.brands, filters.brand)}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
                className="w-full bg-transparent text-[12px] text-[#041e3a] outline-none cursor-pointer appearance-none border-b border-gray-200 py-1.5 pr-5 focus:border-[#041e3a] transition-colors"
              >
                <option value="">All Brands</option>
                {catalogFilters.brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
            </div>
          </div>

          {/* Clear */}
          <button
            onClick={clearFilters}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-[#041e3a] transition-colors underline underline-offset-4"
          >
            Clear All Filters
          </button>
        </aside>

        {/* ── RIGHT: Product Grid ───────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {error && <StatusBanner tone="danger">{error}</StatusBanner>}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-100 mb-2" />
                  <div className="h-2 bg-gray-100 w-1/3 mb-1.5" />
                  <div className="h-2.5 bg-gray-100 w-3/4 mb-1.5" />
                  <div className="h-2.5 bg-gray-100 w-1/2" />
                </div>
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <EmptyState title="No items found" description="Try adjusting your filters to see more results." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {visibleProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.035, 0.35) }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
=======
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
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
      </div>
    </div>
  );
}

export default ProductListing;
