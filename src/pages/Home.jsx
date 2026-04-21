import { startTransition, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StatusBanner from "../components/common/StatusBanner";
import { buildCatalogImageUrl, formatCatalogPrice, getStoreProducts } from "../services/catalogService";
import {
  getHierarchyCategories,
  getHierarchySubcategories,
  getHierarchyTypes
} from "../services/hierarchyService";

const departmentOrder = ["men", "women", "kids"];

const departmentVisuals = {
  men: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1400&q=80",
  women: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
  kids: "https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=1400&q=80"
};

function Home() {
  const [products, setProducts] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadPageData = async () => {
      try {
        setError("");
        setLoadingProducts(true);

        const [productsResponse, categoriesResponse, subcategoriesResponse, typesResponse] = await Promise.all([
          getStoreProducts({ limit: 12 }),
          getHierarchyCategories(),
          getHierarchySubcategories(),
          getHierarchyTypes()
        ]);

        if (ignore) {
          return;
        }

        startTransition(() => {
          setProducts(productsResponse.products || []);
        });

        const categories = categoriesResponse.categories || [];
        const subcategories = subcategoriesResponse.subcategories || [];
        const types = typesResponse.types || [];

        const topCategories = categories
          .filter((category) => departmentOrder.includes(category.name.toLowerCase()))
          .sort((a, b) => departmentOrder.indexOf(a.name.toLowerCase()) - departmentOrder.indexOf(b.name.toLowerCase()));

        const categoryTree = topCategories.map((category) => {
          const matchedSubcategories = subcategories
            .filter((subcategory) => Number(subcategory.category_id) === Number(category.id))
            .map((subcategory) => ({
              ...subcategory,
              types: types.filter((itemType) => Number(itemType.subcategory_id) === Number(subcategory.id))
            }));

          return {
            ...category,
            subcategories: matchedSubcategories
          };
        });

        setHierarchy(categoryTree);
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load homepage content.");
          setProducts([]);
          setHierarchy([]);
        }
      } finally {
        if (!ignore) {
          setLoadingProducts(false);
        }
      }
    };

    loadPageData();

    return () => {
      ignore = true;
    };
  }, []);

  const groupedProducts = useMemo(() => {
    const groups = { men: [], women: [], kids: [] };

    products.forEach((product) => {
      const key = product.category_name?.toLowerCase();
      if (groups[key]) {
        groups[key].push(product);
      }
    });

    return groups;
  }, [products]);

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-[#1f1f1f]">
      <StatusBanner tone="danger">{error}</StatusBanner>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(214,88,58,0.18),transparent_42%),radial-gradient(circle_at_80%_10%,rgba(43,101,171,0.15),transparent_35%),linear-gradient(180deg,#0f1013_0%,#1f2329_100%)]" />
        <div className="relative mx-auto grid w-full max-w-[1500px] gap-12 px-6 pb-20 pt-16 md:px-10 lg:grid-cols-[1fr_1.1fr] lg:pt-24">
          <div className="space-y-7">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Spring Summer 2026</p>
            <h1 className="max-w-xl text-5xl font-black leading-[1.05] text-white md:text-7xl">
              Style Marketplace for Men, Women and Kids
            </h1>
            <p className="max-w-xl text-base leading-8 text-white/70">
              Shop by department, dive into subcategories, and explore daily-wear types in a cleaner ecommerce flow.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="rounded-full bg-white px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#111]">
                Shop Collection
              </Link>
              <Link to="/products?sort=new" className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white">
                New Arrivals
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {hierarchy.map((category) => {
              const key = category.name.toLowerCase();
              return (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(key)}`}
                  className="group relative h-[360px] overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
                >
                  <img
                    src={departmentVisuals[key]}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-2xl font-black uppercase tracking-wide text-white">{category.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">
                      {(category.subcategories || []).length} subcategories
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-6 py-16 md:px-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#777]">Category Navigation</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-[0.04em]">Shop by Hierarchy</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold uppercase tracking-[0.14em] text-[#444]">
            View All Products
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {hierarchy.map((category) => {
            const key = category.name.toLowerCase();
            return (
              <article key={category.id} className="rounded-2xl border border-[#e8e8e1] bg-white p-5 shadow-sm">
                <Link to={`/products?category=${encodeURIComponent(key)}`} className="text-2xl font-black uppercase">
                  {category.name}
                </Link>
                <div className="mt-4 space-y-3">
                  {(category.subcategories || []).map((subcategory) => (
                    <div key={subcategory.id} className="rounded-xl bg-[#f7f7f3] p-3">
                      <Link
                        to={`/products?category=${encodeURIComponent(key)}&subcategory=${subcategory.id}`}
                        className="text-sm font-bold uppercase tracking-[0.1em] text-[#222]"
                      >
                        {subcategory.name}
                      </Link>
                      <p className="mt-1 text-xs text-[#666]">
                        {(subcategory.types || []).slice(0, 4).map((itemType) => itemType.name).join(" | ") || "More styles"}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-6 pb-20 md:px-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#777]">Trending Picks</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-[0.04em]">Popular Right Now</h2>
          </div>
        </div>

        {loadingProducts ? (
          <p className="text-sm text-[#666]">Loading products...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => {
              const image = buildCatalogImageUrl(product.hero_image);
              return (
                <Link key={product.id} to={`/products/${product.slug}`} className="group overflow-hidden rounded-2xl border border-[#ecece8] bg-white shadow-sm">
                  <div className="aspect-[4/5] overflow-hidden bg-[#f2f2ed]">
                    <img
                      src={image || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80"}
                      alt={product.product_name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#777]">{product.category_name}</p>
                    <h3 className="mt-2 text-lg font-bold text-[#202020]">{product.product_name}</h3>
                    <p className="mt-2 text-sm font-semibold text-[#111]">
                      {formatCatalogPrice(product.price_from || product.base_price)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-[#e8e8e1] bg-white">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-6 px-6 py-8 text-sm md:px-10">
          <p className="font-semibold uppercase tracking-[0.14em] text-[#333]">Trusted shopping flow for Men, Women, Kids</p>
          <div className="flex flex-wrap items-center gap-4 text-[#666]">
            <span>Secure checkout</span>
            <span>Easy returns</span>
            <span>Fast delivery</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
