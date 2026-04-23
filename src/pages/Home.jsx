import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import StatusBanner from "../components/common/StatusBanner";
import { buildCatalogImageUrl, formatCatalogPrice, getStoreProducts } from "../services/catalogService";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Category Slider — auto-scroll, hover-pause, arrows, dots                  */
/* ─────────────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    label: "T-Shirts",
    tag: "Men · Kids",
    link: "/products?search=t-shirt",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
  },
  {
    label: "Hoodies",
    tag: "Men",
    link: "/products?search=hoodie",
    image: "https://images.pexels.com/photos/31670079/pexels-photo-31670079.png",
  },
  {
    label: "Shirts",
    tag: "Men",
    link: "/products?search=shirt",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=500&q=80",
  },
  {
    label: "Jeans",
    tag: "Men · Women",
    link: "/products?search=jeans",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80",
  },
  {
    label: "Dresses",
    tag: "Women · Kids",
    link: "/products?search=dress",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80",
  },
  {
    label: "Jackets",
    tag: "Men",
    link: "/products?search=jacket",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
  },
  {
    label: "Shorts",
    tag: "Men · Kids",
    link: "/products?search=shorts",
    image: "https://images.pexels.com/photos/14839441/pexels-photo-14839441.jpeg",
  },
  {
    label: "Skirts",
    tag: "Women",
    link: "/products?search=skirt",
    image: "https://images.pexels.com/photos/13311689/pexels-photo-13311689.jpeg",
  },
];


const VISIBLE = 4; // tiles visible at once on desktop
const TOTAL_STEPS = CATEGORIES.length - VISIBLE;

function CategorySlider() {
  const [current, setCurrent] = useState(0);
  const hoveredRef = useRef(false);
  const timerRef = useRef(null);

  const next = useCallback(() => setCurrent((c) => (c >= TOTAL_STEPS ? 0 : c + 1)), []);
  const prev = useCallback(() => setCurrent((c) => (c <= 0 ? TOTAL_STEPS : c - 1)), []);

  // Auto-advance every 3s — pause on hover using a ref so interval never restarts
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!hoveredRef.current) next();
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const translateX = -(current * (100 / VISIBLE));

  return (
    <section className="w-full bg-[#f8f8f6] py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">

        {/* Header row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.55em] text-gray-400">
              Shop by Category
            </p>
            <div className="w-20 h-px bg-gray-200" />
          </div>

          {/* Arrow controls */}
          <div className="flex items-center gap-2">
            <button
              id="cat-slider-prev"
              onClick={prev}
              aria-label="Previous category"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#041e3a] hover:text-[#041e3a] transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              id="cat-slider-next"
              onClick={next}
              aria-label="Next category"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#041e3a] hover:text-[#041e3a] transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slider track */}
        <div
          className="overflow-hidden"
          onMouseEnter={() => { hoveredRef.current = true; }}
          onMouseLeave={() => { hoveredRef.current = false; }}
        >
          <div
            className="flex gap-4 md:gap-5 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            style={{ transform: `translateX(calc(${translateX}% - ${current * 20}px))` }}
          >
            {CATEGORIES.map((item) => (
              <div
                key={item.label}
                className="flex-shrink-0"
                style={{ width: `calc(${100 / VISIBLE}% - 15px)` }}
              >
                <Link to={item.link} className="group block">
                  {/* Square image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-sm">
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-full h-full object-cover object-center transition-transform duration-[1000ms] ease-out group-hover:scale-[1.08]"
                    />
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-400" />
                    {/* Tag badge */}
                    <span className="absolute top-2.5 left-2.5 text-[7px] font-bold uppercase tracking-[0.4em] bg-white/90 text-gray-500 px-2 py-0.5">
                      {item.tag}
                    </span>
                    {/* Arrow circle on hover */}
                    <span className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1.5 group-hover:translate-y-0 transition-all duration-300 shadow-sm">
                      <svg className="w-3 h-3 text-[#041e3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>

                  {/* Label */}
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-[12px] font-sans font-semibold text-[#041e3a] tracking-wide group-hover:text-gray-500 transition-colors duration-200">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-[#041e3a]/25 group-hover:text-[#041e3a] group-hover:translate-x-0.5 transition-all duration-200">
                      →
                    </span>
                  </div>
                  <div className="mt-1.5 h-px bg-gray-200 group-hover:bg-[#041e3a]/50 transition-colors duration-300" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {Array.from({ length: TOTAL_STEPS + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-1.5 bg-[#041e3a]"
                  : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Browse all */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/products"
            className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#041e3a] border-b border-[#041e3a]/30 pb-1 hover:border-[#041e3a] transition-all duration-300"
          >
            Browse All →
          </Link>
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

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
            SAJAN
          </p>
          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-wide">
            Spring/Summer 2026
          </h1>
          <p className="mb-8 text-white/90 text-sm md:text-base font-serif leading-relaxed max-w-md">
            The polished charm of classic sporting pursuits inspires Sajan's vision of timeless luxury.
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

      {/* ── Storytelling Zig-Zag ─────────────────────────────────────────── */}
      <section className="w-full bg-white">
        {[
          {
            label: "Women",
            eyebrow: "New Season Arrivals",
            heading: "Effortless Grace,\nEvery Single Day.",
            body: "From weekend ease to evening elegance — our women's collection is a study in refined simplicity. Each piece is crafted to move with you, not against you.",
            cta: "Explore Women's",
            link: "/products?category=women",
            image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
            imageLeft: true,
          },
             {
            label: "Men",
            eyebrow: "The New Collection",
            heading: "Refined. Purposeful.\nUnmistakably You.",
            body: "Rooted in the traditions of American luxury — our men's collection brings together impeccable tailoring and enduring fabrics designed for every chapter of life.",
            cta: "Explore Men's",
            link: "/products?category=men",
            image: "https://images.pexels.com/photos/28194536/pexels-photo-28194536.jpeg",
            imageLeft: false,
          },
          {
            label: "Kids",
            eyebrow: "Just Arrived",
            heading: "Dressed for Every\nLittle Adventure.",
            body: "The same spirit of quality and style — sized for the smallest explorers. Durable, playful and crafted with the care every child deserves.",
            cta: "Explore Kids'",
            link: "/products?category=kids",
            image: "https://images.pexels.com/photos/30070071/pexels-photo-30070071.jpeg",
            imageLeft: true,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex flex-col md:flex-row ${item.imageLeft ? "" : "md:flex-row-reverse"} w-full border-b border-gray-100 last:border-b-0 items-stretch`}
          >
            {/* ── Image Panel — padded frame ── */}
            <motion.div
              className="w-full md:w-1/2 flex items-center justify-center bg-[#f5f4f0] p-8 md:p-10 flex-shrink-0"
              initial={{ opacity: 0, x: item.imageLeft ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="relative w-full max-w-[400px] aspect-[4/5] overflow-hidden group shadow-md">
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-[1800ms] ease-out"
                />
              </div>
            </motion.div>

            {/* ── Text Panel ── */}
            <motion.div
              className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-16 md:py-20 bg-white flex-shrink-0"
              initial={{ opacity: 0, x: item.imageLeft ? 60 : -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.0, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.55em] text-gray-400 mb-6">
                {item.eyebrow}
              </p>
              <h2 className="text-3xl md:text-[2.6rem] font-serif text-[#041e3a] leading-[1.18] tracking-wide mb-6 whitespace-pre-line">
                {item.heading}
              </h2>
              <div className="w-12 h-px bg-[#041e3a]/25 mb-6" />
              <p className="text-gray-500 text-sm font-sans leading-[1.9] max-w-[340px] mb-10">
                {item.body}
              </p>
              <Link
                to={item.link}
                className="group/cta inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.38em] text-[#041e3a] border-b border-[#041e3a]/30 pb-1.5 w-fit hover:border-[#041e3a] transition-all duration-300"
              >
                {item.cta}
                <svg
                  className="w-3 h-3 transition-transform duration-300 group-hover/cta:translate-x-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        ))}
      </section>


      {/* ── Shop by Category — Auto Slider ───────────────────────────────── */}
      <CategorySlider />



      {/* Recommended Products Strip (Classic Minimal) */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-24 md:px-12">
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-serif tracking-widest text-[#041e3a] uppercase">New Arrivals</h2>
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
                      SAJAN
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
