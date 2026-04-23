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
        if (!ignore) setError(apiError.message);
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
    switch (sortOption) {
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
            </div>
          </div>
        </motion.div>
      </div>

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
            </div>
          </div>

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
            </div>
          </div>

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
            </div>
          </div>

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
      </div>
    </div>
  );
}

export default ProductListing;
