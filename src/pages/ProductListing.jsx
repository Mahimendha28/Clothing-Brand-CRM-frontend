import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Input from "../components/common/Input";
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
    color: searchParams.get("color") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || ""
  });
  const [catalogFilters, setCatalogFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    colors: [],
    price_range: {
      min: 0,
      max: 0
    }
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    let ignore = false;

    const loadFilters = async () => {
      try {
        const response = await getStoreFilters();

        if (!ignore) {
          setCatalogFilters(
            response.filters || {
              categories: [],
              brands: [],
              sizes: [],
              colors: [],
              price_range: {
                min: 0,
                max: 0
              }
            }
          );
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load available filters");
        }
      }
    };

    loadFilters();

    return () => {
      ignore = true;
    };
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
          color: filters.color,
          search: deferredSearchTerm.trim()
        });

        if (!ignore) {
          startTransition(() => {
            setProducts(response.products || []);
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load products");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [filters.brand, filters.category, filters.color, filters.size, deferredSearchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    if (filters.category) {
      params.set("category", filters.category);
    }

    if (filters.brand) {
      params.set("brand", filters.brand);
    }

    if (filters.size) {
      params.set("size", filters.size);
    }

    if (filters.color) {
      params.set("color", filters.color);
    }

    if (filters.minPrice) {
      params.set("minPrice", filters.minPrice);
    }

    if (filters.maxPrice) {
      params.set("maxPrice", filters.maxPrice);
    }

    setSearchParams(params, { replace: true });
  }, [filters, searchTerm, setSearchParams]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "",
      brand: "",
      size: "",
      color: "",
      minPrice: "",
      maxPrice: ""
    });
  };

  const visibleProducts = products.filter((product) => {
    const minPrice = filters.minPrice ? Number(filters.minPrice) : null;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;
    const priceFrom = Number(product.price_from || product.base_price);
    const priceTo = Number(product.price_to || product.base_price);

    if (minPrice !== null && priceTo < minPrice) {
      return false;
    }

    if (maxPrice !== null && priceFrom > maxPrice) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="ui-eyebrow">Product Listing</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.92] text-ink">Browse the full customer catalog.</h1>
          <p className="mt-5 text-sm leading-7 text-secondary">
            Search by product name and refine by category, brand, size, color, and price without leaving the storefront.
          </p>
        </div>

        <div className="rounded-full border border-line bg-white px-5 py-3 text-sm text-secondary shadow-soft">
          {loading ? "Loading products..." : `${visibleProducts.length} active products available`}
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[300px_1fr]">
        <aside className="h-fit space-y-6 rounded-[30px] border border-line bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-page text-secondary">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <p className="ui-eyebrow">Filters</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Refine results</h2>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by product name"
              icon={Search}
              className="!rounded-[18px] !bg-page"
            />

            <select name="category" value={filters.category} onChange={handleFilterChange} className="ui-input">
              <option value="">All categories</option>
              {catalogFilters.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select name="brand" value={filters.brand} onChange={handleFilterChange} className="ui-input">
              <option value="">All brands</option>
              {catalogFilters.brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            <select name="size" value={filters.size} onChange={handleFilterChange} className="ui-input">
              <option value="">All sizes</option>
              {catalogFilters.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <select name="color" value={filters.color} onChange={handleFilterChange} className="ui-input">
              <option value="">All colors</option>
              {catalogFilters.colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <input
                type="number"
                name="minPrice"
                min={catalogFilters.price_range.min || 0}
                placeholder={`Min ${formatCatalogPrice(catalogFilters.price_range.min)}`}
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="ui-input"
              />
              <input
                type="number"
                name="maxPrice"
                min={catalogFilters.price_range.min || 0}
                placeholder={`Max ${formatCatalogPrice(catalogFilters.price_range.max)}`}
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="ui-input"
              />
            </div>
          </div>

          <div className="rounded-[22px] bg-page p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Available range</p>
            <p className="mt-3 font-display text-3xl text-ink">
              {formatCatalogPrice(catalogFilters.price_range.min)} - {formatCatalogPrice(catalogFilters.price_range.max)}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={clearFilters}
            className="w-full !rounded-[16px] !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
          >
            Clear Filters
          </Button>
        </aside>

        <div className="space-y-6">
          <StatusBanner tone="danger">{error}</StatusBanner>

          {!loading && !visibleProducts.length ? (
            <EmptyState
              title="No products match these filters"
              description="Try clearing one or two filters, or search with a broader product name."
            />
          ) : null}

          {visibleProducts.length ? (
            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}

          {!loading && products.length && !visibleProducts.length ? (
            <div className="rounded-[24px] border border-line bg-white p-5 text-sm text-secondary shadow-soft">
              Server-side filters found products, but the current price range removed them from view. Adjust the min or max price to widen the result set.
            </div>
          ) : null}

          <div className="rounded-[30px] border border-line bg-[#f3eee6] p-6 shadow-soft">
            <p className="ui-eyebrow">Need a starting point?</p>
            <h3 className="mt-3 font-display text-3xl text-ink">Browse by collection story.</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {catalogFilters.categories.slice(0, 4).map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: String(category.id)
                    }))
                  }
                  className="!rounded-full !px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductListing;
