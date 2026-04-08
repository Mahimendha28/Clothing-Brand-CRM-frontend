import { startTransition, useEffect, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Input from "../components/common/Input";
import StatusBanner from "../components/common/StatusBanner";
import ProductCard from "../components/store/ProductCard";
import {
  buildCatalogImageUrl,
  formatCatalogPrice,
  getStoreFilters,
  getStoreProducts
} from "../services/catalogService";

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    colors: [],
    price_range: {
      min: 0,
      max: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadStorefront = async () => {
      try {
        setLoading(true);
        setError("");
        const [productsResponse, filtersResponse] = await Promise.all([
          getStoreProducts({ limit: 6 }),
          getStoreFilters()
        ]);

        if (ignore) {
          return;
        }

        startTransition(() => {
          setFeaturedProducts(productsResponse.products || []);
          setFilters(
            filtersResponse.filters || {
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
        });
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load the storefront");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadStorefront();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    navigate(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const spotlightProduct = featuredProducts[0] || null;
  const spotlightImage = buildCatalogImageUrl(spotlightProduct?.hero_image);

  return (
    <div className="space-y-24">
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <p className="ui-eyebrow">Customer Home</p>
          <h1 className="mt-5 font-display text-6xl leading-[0.9] text-ink md:text-7xl">
            Browse the collection with filters that actually work.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-secondary">
            Search by name, refine by category, brand, size, color, and price, then move directly into a detailed product view with gallery images and live variant choices.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by product name"
              icon={Search}
              className="!rounded-full !bg-white"
            />
            <Button
              type="submit"
              className="!px-7 !text-sm !font-medium !normal-case !tracking-[0.02em]"
            >
              Search Store
            </Button>
          </form>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/products">
              <Button
                variant="secondary"
                className="!rounded-full !bg-white !px-6 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                View All Products
              </Button>
            </Link>
            {filters.categories.slice(0, 3).map((category) => (
              <Link key={category.id} to={`/products?category=${category.id}`}>
                <Button
                  variant="outline"
                  className="!rounded-full !px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-line bg-card shadow-float">
          {spotlightImage ? (
            <img
              src={spotlightImage}
              alt={spotlightProduct?.product_name || "Store spotlight"}
              className="h-[640px] w-full object-cover"
            />
          ) : (
            <div className="h-[640px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#efe5d7_48%,#ddccb2_100%)]" />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,36,31,0.08)_0%,rgba(44,36,31,0.14)_42%,rgba(44,36,31,0.72)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">Spotlight Product</p>
            <h2 className="mt-4 font-display text-4xl leading-none">
              {spotlightProduct?.product_name || "A quieter luxury assortment"}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
              {spotlightProduct?.description || "The new storefront is ready for browsing, filtering, and moving into detailed product selection."}
            </p>
            {spotlightProduct ? (
              <Link to={`/products/${spotlightProduct.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white">
                View detail <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <StatusBanner tone="danger">{error}</StatusBanner>

      <section className="grid gap-5 md:grid-cols-4">
        <div className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
          <p className="ui-eyebrow">Active Categories</p>
          <p className="mt-4 font-display text-5xl text-ink">{filters.categories.length}</p>
          <p className="mt-2 text-sm leading-6 text-secondary">Live categories available to browse inside the store.</p>
        </div>
        <div className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
          <p className="ui-eyebrow">Featured Brands</p>
          <p className="mt-4 font-display text-5xl text-ink">{filters.brands.length}</p>
          <p className="mt-2 text-sm leading-6 text-secondary">Brand filters customers can use directly from the listing page.</p>
        </div>
        <div className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
          <p className="ui-eyebrow">Size Filters</p>
          <p className="mt-4 font-display text-5xl text-ink">{filters.sizes.length}</p>
          <p className="mt-2 text-sm leading-6 text-secondary">Variant sizes surfaced from active sellable product variants.</p>
        </div>
        <div className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
          <p className="ui-eyebrow">Price Window</p>
          <p className="mt-4 font-display text-3xl text-ink">
            {formatCatalogPrice(filters.price_range.min)} - {formatCatalogPrice(filters.price_range.max)}
          </p>
          <p className="mt-2 text-sm leading-6 text-secondary">The available price span across active store inventory.</p>
        </div>
      </section>

      <section>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ui-eyebrow">Store Preview</p>
            <h2 className="mt-4 font-display text-5xl text-ink">Featured arrivals</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            Browse all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? <p className="text-sm text-secondary">Loading featured products...</p> : null}

        {!loading && !featuredProducts.length ? (
          <EmptyState
            title="No active products yet"
            description="Add active products and images from the admin side to populate the customer storefront."
          />
        ) : null}

        {featuredProducts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="ui-eyebrow">Shop by Category</p>
          <h2 className="mt-4 font-display text-5xl text-ink">Quick ways into the catalog.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-secondary">
            Every category card drops the customer straight into the filtered listing experience, so browsing feels connected from home to detail.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {filters.categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="rounded-[28px] border border-line bg-white p-6 shadow-soft transition hover:-translate-y-1"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Category</p>
              <h3 className="mt-4 font-display text-3xl text-ink">{category.name}</h3>
              <p className="mt-3 text-sm leading-6 text-secondary">Open the product listing already filtered for this collection.</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
