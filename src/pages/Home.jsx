import { startTransition, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBanner from "../components/common/StatusBanner";
import ThreeHeroSection from "../components/store/ThreeHeroSection";
import { getStoreProducts } from "../services/catalogService";
import { buildCatalogImageUrl, formatCatalogPrice } from "../services/catalogService";
import { landingContent } from "../data/themeContent";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const loadStorefront = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getStoreProducts({ limit: 8 });
        if (ignore) return;
        startTransition(() => {
          setFeaturedProducts(response.products || []);
        });
      } catch (apiError) {
        if (!ignore) setError(apiError.message || "Failed to load the storefront");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadStorefront();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      {error && <div className="absolute top-0 z-50 w-full"><StatusBanner tone="danger">{error}</StatusBanner></div>}

      {/* Hero Section */}
      <section className="relative w-full h-[90vh] md:h-screen">
        <img 
          src={landingContent?.hero?.image || "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2000&q=80"} 
          alt="Fashion Hero" 
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        {/* Subtle overlay to ensure text readability while keeping it raw */}
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 md:pb-32 px-4 z-10 text-center">
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-widest mb-8 drop-shadow-md">
            The Collection
          </h1>
          <Link 
            to="/products"
            className="bg-white text-black px-12 py-5 uppercase text-xs md:text-sm font-bold tracking-[0.2em] transition-opacity hover:opacity-80"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* 3D Showcase Section */}
      <ThreeHeroSection />

      {/* Minimal Product Showcase (Slider Layout) */}
      <section className="w-full pl-4 md:pl-8 py-20 md:py-32 bg-white overflow-hidden">
        <div className="pr-4 md:pr-8 mb-12 flex justify-between items-end max-w-[1800px] mx-auto">
          <div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-black">New Arrivals</h2>
          </div>
          <Link to="/products" className="hidden md:inline-block text-xs font-bold uppercase tracking-[0.15em] text-black border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">
             View All
          </Link>
        </div>

        {loading ? (
          <div className="w-full text-center py-20 text-xs tracking-[0.2em] font-semibold text-black/50 uppercase max-w-[1800px] mx-auto">Loading Collection...</div>
        ) : (
          <div className="flex overflow-x-auto gap-4 md:gap-8 pb-12 snap-x snap-mandatory scrollbar-hide pr-4 md:pr-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {featuredProducts.map((product) => {
              const imageSrc = buildCatalogImageUrl(product.hero_image) || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80";
              const price = formatCatalogPrice(product.price_from || product.base_price);
              
              return (
                <Link key={product.id} to={`/products/${product.slug}`} className="group flex flex-col cursor-pointer w-[65vw] sm:w-[260px] lg:w-[280px] shrink-0 snap-start">
                  {/* Aspect Ratio heavily favors tall elegant fashion photography */}
                  <div className="w-full aspect-[3/4] mb-4 overflow-hidden bg-gray-50">
                    <img 
                      src={imageSrc} 
                      alt={product.product_name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80"; }}
                    />
                  </div>
                  
                  {/* Ultra Minimal Text: Name + Price Only */}
                  <div className="flex flex-col items-center justify-center text-center px-2">
                    <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] text-black mb-1.5 line-clamp-1">
                      {product.product_name}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500 tracking-wider">
                      {price}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
