import { startTransition, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StatusBanner from "../components/common/StatusBanner";
import { buildCatalogImageUrl, formatCatalogPrice, getStoreProducts } from "../services/catalogService";

function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadPageData = async () => {
      try {
        setError("");
        setLoadingProducts(true);

        const response = await getStoreProducts({ limit: 4 });
        if (ignore) return;

        startTransition(() => {
          setProducts(response.products || []);
        });

      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load homepage content.");
          setProducts([]);
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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {error && <StatusBanner tone="danger" className="w-full">{error}</StatusBanner>}

      {/* Hero Video Section (Screenshot 3 Style) */}
      <section className="relative h-[85vh] min-h-[600px] w-full bg-[#041e3a] flex items-end justify-start overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2000&q=80"
        >
          {/* A reliable generic fashion/lifestyle video URL */}
          <source src="https://assets.mixkit.co/videos/preview/mixkit-woman-walking-on-the-street-doing-a-fashion-pose-1049-large.mp4" type="video/mp4" />
        </video>
        
        {/* Subtle gradient so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        <div className="relative z-10 px-8 md:px-16 pb-16 md:pb-24 max-w-2xl">
          <p className="mb-4 text-[10px] font-semibold tracking-widest text-white uppercase font-sans">
            RALPH LAUREN
          </p>
          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-wide">
            Spring/Summer 2026
          </h1>
          <p className="mb-8 text-white/90 text-sm md:text-base font-serif leading-relaxed max-w-md">
            The polished charm of classic sporting pursuits inspires Ralph Lauren's vision of timeless American luxury.
          </p>
          <div className="flex flex-wrap gap-6">
             <Link
               to="/products"
               className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white border-b border-white pb-1 hover:text-white/70 hover:border-white/70 transition-colors"
             >
               SHOP NOW
             </Link>
             <Link
               to="/about"
               className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white border-b border-white pb-1 hover:text-white/70 hover:border-white/70 transition-colors"
             >
               EXPLORE NOW
             </Link>
          </div>
        </div>
      </section>

      {/* Linen Shop Static Hero (Screenshot 1 Style) */}
      <section className="relative h-[90vh] min-h-[600px] w-full bg-[#f8f8f8] flex items-end justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=2000&q=80"
          alt="Linen Shop"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        {/* Subtle gradient for text readability at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center pb-16 md:pb-24">
          <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-white uppercase font-sans drop-shadow-md">
            POLO RALPH LAUREN
          </p>
          <h2 className="text-5xl md:text-7xl font-serif text-white tracking-wide drop-shadow-lg">
            Linen Shop
          </h2>
        </div>
      </section>

      {/* 50/50 Split Section (Screenshot 2 Style) */}
      <section className="w-full flex flex-col md:flex-row h-auto md:h-[80vh] min-h-[600px]">
        {/* Left: Summer */}
        <div className="relative w-full md:w-1/2 h-[60vh] md:h-full bg-gray-200 overflow-hidden group cursor-pointer">
           <img
             src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
             alt="Summer Collection"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
           <div className="absolute bottom-12 left-10 md:left-16 right-10 z-10">
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-white uppercase font-sans drop-shadow-md">
                POLO RALPH LAUREN
              </p>
              <h2 className="mb-5 text-4xl md:text-5xl font-serif text-white tracking-wide drop-shadow-lg">
                Summer
              </h2>
              <p className="mb-8 text-white/90 text-sm md:text-base font-serif leading-relaxed max-w-sm drop-shadow-md">
                Easy styles, in a seasonal array of lightweight fabrics and silhouettes, for refined summer days.
              </p>
              <Link
                to="/products?category=women"
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white border-b border-white pb-1 hover:text-white/70 hover:border-white/70 transition-colors drop-shadow-md inline-block"
              >
                SHOP NOW
              </Link>
           </div>
        </div>
        
        {/* Right: Special Occasion */}
        <div className="relative w-full md:w-1/2 h-[60vh] md:h-full bg-gray-300 overflow-hidden group cursor-pointer">
           <img
             src="https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=1200&q=80"
             alt="Special Occasion"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
           <div className="absolute bottom-12 left-10 md:left-16 right-10 z-10">
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-white uppercase font-sans drop-shadow-md">
                POLO RALPH LAUREN
              </p>
              <h2 className="mb-5 text-4xl md:text-5xl font-serif text-white tracking-wide drop-shadow-lg">
                Special Occasion
              </h2>
              <p className="mb-8 text-white/90 text-sm md:text-base font-serif leading-relaxed max-w-sm drop-shadow-md">
                Charming classics in seasonal hues and fabrics for spring's celebrations.
              </p>
              <div className="flex gap-6">
                <Link
                  to="/products?category=kids"
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white border-b border-white pb-1 hover:text-white/70 hover:border-white/70 transition-colors drop-shadow-md inline-block"
                >
                  SHOP BOYS
                </Link>
                <Link
                  to="/products?category=kids"
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white border-b border-white pb-1 hover:text-white/70 hover:border-white/70 transition-colors drop-shadow-md inline-block"
                >
                  SHOP GIRLS
                </Link>
              </div>
           </div>
        </div>
      </section>

      {/* Recommended Products Strip (Classic Minimal) */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-24 md:px-12">
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-serif tracking-widest text-[#041e3a] uppercase">Discover More</h2>
        </div>

        {loadingProducts ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#041e3a]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-4">
            {products.map((product) => {
              const image = buildCatalogImageUrl(product.hero_image);
              return (
                <div key={product.id} className="group flex flex-col">
                  <Link to={`/products/${product.slug}`} className="relative mb-4 block aspect-[3/4] w-full overflow-hidden bg-gray-50">
                    <img
                      src={image || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80"}
                      alt={product.product_name}
                      className="h-full w-full object-cover transition duration-700"
                    />
                  </Link>
                  <div className="text-center px-2">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-500 font-sans">
                      RALPH LAUREN
                    </p>
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="text-sm font-serif tracking-wide text-[#041e3a] transition-colors hover:text-gray-500 line-clamp-1">
                        {product.product_name}
                      </h3>
                    </Link>
                    <p className="mt-2 text-xs font-sans font-medium text-[#041e3a]">
                      {formatCatalogPrice(product.price_from || product.base_price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

export default Home;
