import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
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
=======
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronRight, PlayCircle, ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import StatusBanner from "../components/common/StatusBanner";
import ThreeHeroSection from "../components/store/ThreeHeroSection";
import FashionRunway3D from "../components/store/FashionRunway3D";
import { getStoreProducts } from "../services/catalogService";
import { buildCatalogImageUrl, formatCatalogPrice } from "../services/catalogService";
import { addCartItem } from "../services/cartService";
import { useToast } from "../context/ToastContext";
import { isAuthenticated } from "../utils/auth";
import { useNavigate, useLocation } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toastSuccess, toastError } = useToast();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
  const [error, setError] = useState("");
  const { scrollYProgress } = useScroll();
  const [addingToCart, setAddingToCart] = useState(null);

  const handleQuickAdd = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) { navigate("/login", { state: { from: location } }); return; }
    try {
      setAddingToCart(product.id);
      const response = await addCartItem({ 
        productId: product.id, 
        variantId: product.variants?.[0]?.id || null, 
        quantity: 1 
      });
      toastSuccess(response.message || "Added to bag");
    } catch (apiError) { 
      toastError(apiError.message); 
    } finally { 
      setAddingToCart(null); 
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadPageData = async () => {
      try {
        setError("");
<<<<<<< HEAD
        setLoadingProducts(true);

        const response = await getStoreProducts({ limit: 4 });
=======
        const response = await getStoreProducts({ limit: 12 });
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
        if (ignore) return;

        startTransition(() => {
<<<<<<< HEAD
          setProducts(response.products || []);
=======
          setFeaturedProducts(response?.products || []);
          setTrendingProducts((response?.products || []).slice(0, 8));
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
        });

      } catch (apiError) {
<<<<<<< HEAD
        if (!ignore) {
          setError(apiError.message || "Failed to load homepage content.");
          setProducts([]);
        }
=======
        if (!ignore) setError(apiError?.message || "Failed to load the storefront");
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
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

  const banners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000",
      title: "Season End Sale",
      sub: "Up to 70% Off",
      label: "Shop Now"
    }
  ];

  const categories = [
    { name: 'Shirts', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&h=200&w=200&q=80' },
    { name: 'Jeans', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&h=200&w=200&q=80' },
    { name: 'T-Shirts', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&h=200&w=200&q=80' },
    { name: 'Shoes', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&h=200&w=200&q=80' },
    { name: 'Jackets', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&h=200&w=200&q=80' },
    { name: 'Dresses', img: 'https://images.unsplash.com/photo-1539008835279-43468093d22a?auto=format&fit=crop&h=200&w=200&q=80' }
  ];

  const collectionGrid = [
    { title: 'Western Wear', sub: 'Min 40% Off', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80' },
    { title: 'Activewear', sub: 'Upto 50% Off', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80' },
    { title: 'Footwear', sub: 'Flat ₹500 OFF', img: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80' },
    { title: 'Accessories', sub: 'New Arrivals', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' }
  ];

  return (
<<<<<<< HEAD
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

=======
    <div className="min-h-screen bg-white selection:bg-black selection:text-white relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[var(--color-primary)] z-[200] origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      
      {error && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-6">
            <StatusBanner tone="danger">{error}</StatusBanner>
         </div>
      )}

      {/* 1. HIGH-IMPACT HERO CAROUSEL (RESTORED) */}
      <section className="shop-container py-6">
        <div className="relative aspect-[21/9] overflow-hidden rounded-[32px] bg-gray-100 shadow-2xl group cursor-pointer">
           <AnimatePresence mode="wait">
              <motion.div 
                key={banners[0].id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full"
              >
                <img src={banners[0].image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-center px-12 md:px-24">
                   <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.5em] mb-6 inline-block bg-white/10 backdrop-blur-xl px-6 py-2 rounded-full border border-white/20 shadow-xl">{banners[0].sub}</span>
                      <h2 className="text-5xl md:text-[90px] font-black text-white leading-[0.85] mb-10 uppercase tracking-tighter italic">
                         Beyond <br /><span className="text-[var(--color-primary)]">Modern.</span>
                      </h2>
                      <div className="flex flex-wrap gap-4">
                        <Link to="/products" className="btn-primary px-12 py-5 rounded-full shadow-[0_20px_40px_rgba(255,63,108,0.4)] flex items-center gap-3">
                           Shop the Drop <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button className="hidden md:flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs hov:text-[var(--color-primary)] transition-all group">
                           <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center group-hover:border-[var(--color-primary)] transition-all">
                              <PlayCircle className="w-7 h-7" />
                           </div>
                           Watch Manifesto
                        </button>
                      </div>
                   </motion.div>
                </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </section>

      {/* 2. CATEGORIES TO BAG (RETAIL) */}
      <section className="py-20 shop-container">
        <motion.h3 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-center mb-16 text-gray-400"
        >
          Categories To Bag
        </motion.h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-12">
          {categories.map((cat, i) => (
            <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               viewport={{ once: true }}
            >
               <Link to={`/products?category=${cat.name.toLowerCase()}`} className="flex flex-col items-center gap-5 group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-transparent group-hover:border-[var(--color-primary)] transition-all shadow-2xl p-1 bg-white relative">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-[var(--color-primary)] transition-colors">{cat.name}</span>
               </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. UNIQUE 3D RUNWAY EXPERIENCE (OUTSTANDING ANIMATION) */}
      <section className="shop-container">
         <FashionRunway3D />
      </section>

      {/* 4. INTERACTIVE 3D VIRTUAL SHOWROOM */}
      <motion.section 
         initial={{ opacity: 0 }}
         whileInView={{ opacity: 1 }}
         viewport={{ once: true }}
         className="py-12"
      >
         <ThreeHeroSection />
      </motion.section>

      {/* 4. TRENDING NOW SCROLLER (RETAIL) */}
      <section className="py-24 overflow-hidden bg-gray-50/50">
         <div className="shop-container">
            <div className="flex items-end justify-between mb-16">
               <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
                  <span className="text-[var(--color-primary)] font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Hot Acquisition</span>
                  <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">Trending Now</h3>
               </motion.div>
               <div className="flex gap-4">
                  <button className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-xl">←</button>
                  <button className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-xl">→</button>
               </div>
            </div>
            <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-10 -mx-6 px-6">
               {trendingProducts.length > 0 ? trendingProducts.map((p, i) => (
                  <motion.div 
                     key={p.id || p._id || `trending-${i}`} 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.1 }}
                     className="min-w-[300px] md:min-w-[350px] group"
                  >
                     <Link to={`/products/${p.slug}`}>
                        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-white mb-6 relative shadow-soft">
                           <img src={buildCatalogImageUrl(p.images?.[0])} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                           <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                              <button 
                                onClick={(e) => handleQuickAdd(e, p)}
                                disabled={addingToCart === (p.id || p._id)}
                                className="w-12 h-12 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl hover:bg-[var(--color-primary)] hover:text-white transition-all"
                              >
                                 {addingToCart === (p.id || p._id) ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                              </button>
                              <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl"><ChevronRight className="w-6 h-6" /></div>
                           </div>
                        </div>
                        <div className="px-2">
                           <h4 className="font-black text-[10px] uppercase mb-2 tracking-widest text-gray-400">{p.brand?.name || 'Badshah'}</h4>
                           <p className="text-sm text-black font-bold truncate mb-3">{p.name}</p>
                           <p className="font-black text-xl">₹{p.price}</p>
                        </div>
                     </Link>
                  </motion.div>
               )) : [...Array(4)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="min-w-[350px] h-[500px] bg-gray-100 rounded-[2rem] animate-pulse" />
               ))}
            </div>
         </div>
      </section>

      {/* 5. COLLECTION GRID (RETAIL) */}
      <section className="py-24">
         <div className="shop-container">
            <h3 className="text-center text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-20 leading-none">Curated Sets.</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {collectionGrid.map((item, i) => (
                   <motion.div 
                     key={i} 
                     whileHover={{ y: -10 }}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] group cursor-pointer shadow-xl"
                   >
                      <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10">
                         <h4 className="text-white text-3xl font-black uppercase tracking-tighter mb-2">{item.title}</h4>
                         <div className="flex items-center justify-between">
                            <p className="text-[var(--color-primary)] text-xs font-black uppercase tracking-[0.3em]">{item.sub}</p>
                            <div className="w-8 h-8 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><ArrowRight className="w-4 h-4" /></div>
                         </div>
                      </div>
                   </motion.div>
                ))}
             </div>
         </div>
      </section>

      {/* 6. MAIN PRODUCT GRID (RETAIL) */}
      <section className="py-32">
         <div className="shop-container">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8 text-center md:text-left">
               <div>
                  <h3 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6 italic">Elite Showcase.</h3>
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-[0.4em]">The Definitive Modern Wardrobe</p>
               </div>
               <Link to="/products" className="btn-outline px-14 py-5 rounded-full font-black text-xs hover:bg-black hover:text-white transition-all">View Entire Archive</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-20">
               {featuredProducts.length > 0 ? featuredProducts.map((p, idx) => (
                  <motion.div
                    key={p.id || p._id || `featured-${idx}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.8 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                     <Link to={`/products/${p.slug}`}>
                        <div className="aspect-[3/4] relative overflow-hidden rounded-[2.5rem] bg-gray-50 mb-6 shadow-soft group-hover:shadow-2xl transition-all duration-500">
                           <img src={buildCatalogImageUrl(p.images?.[0])} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                           <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                              <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-2 shadow-xl">4.5 <span className="text-[var(--color-primary)]">★</span></span>
                              <span className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Top Selection</span>
                           </div>
                           <motion.button 
                              whileHover={{ scale: 1.1 }} 
                              onClick={(e) => handleQuickAdd(e, p)}
                              disabled={addingToCart === (p.id || p._id)}
                              className="absolute top-6 right-6 w-12 h-12 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-12 group-hover:translate-x-0 z-20"
                           >
                              {addingToCart === (p.id || p._id) ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                           </motion.button>
                        </div>
                        <div className="px-2 space-y-2">
                           <p className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-[0.3em]">{p.brand?.name || "BADSHAH"}</p>
                           <h4 className="text-sm font-black text-black truncate uppercase tracking-tighter">{p.name}</h4>
                           <div className="flex items-center gap-4 pt-1">
                              <span className="font-black text-xl italic">
                                {p.variants?.length > 0 
                                  ? `₹${Math.min(...p.variants.map(v => v.price || p.price))}` 
                                  : `₹${p.price || p.base_price}`}
                              </span>
                              {(p.variants?.length > 0 || p.price) && (
                                <span className="text-xs line-through text-gray-300 font-bold italic">
                                  ₹{Number(p.variants?.[0]?.price || p.price || p.base_price) * 2}
                                </span>
                              )}
                              <span className="text-[10px] text-[var(--color-primary)] font-black uppercase tracking-widest">50% Acquisition</span>
                           </div>
                           {p.variants?.length > 0 && (
                             <div className="flex gap-1 mt-2">
                               {Array.from(new Set(p.variants.map(v => v.size))).slice(0, 3).map(s => (
                                 <span key={s} className="text-[8px] font-bold px-1.5 py-0.5 border border-gray-100 rounded text-gray-400">{s}</span>
                               ))}
                               {p.variants.length > 3 && <span className="text-[8px] font-bold text-gray-300">+{p.variants.length - 3}</span>}
                             </div>
                           )}
                        </div>
                     </Link>
                  </motion.div>
               )) : <div className="col-span-full py-40 text-center text-gray-400 font-black uppercase tracking-[1em] animate-pulse">Atelier Synchronizing...</div>}
            </div>
         </div>
      </section>

      {/* 7. CUSTOMER VOICES & TRUST (RETAIL) */}
      <section className="py-32 bg-gray-50/50">
         <div className="shop-container">
            <div className="text-center mb-24 space-y-6">
               <span className="text-[var(--color-primary)] font-black text-xs uppercase tracking-[0.8em] block">The Badshah Tribe</span>
               <h3 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">Global Reviews.</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {[
                  { n: 'Aryan Sharma', r: 'The heavy cotton oversized tees are revolutionary. Unmatched structure.', s: 5 },
                  { n: 'Rahul Varma', r: 'Lightning fast 48-hour delivery. The cargo fitting is elite.', s: 5 },
                  { n: 'Ishaan Gupta', r: 'Digital verification of authenticity is a game changer. Pure luxury experience.', s: 5 }
               ].map((rev, i) => (
                  <motion.div 
                     key={i} 
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.1 }}
                     className="bg-white p-12 rounded-[3rem] space-y-8 shadow-soft border border-gray-100 hover:border-[var(--color-primary)] transition-all group"
                  >
                     <div className="flex gap-1.5">
                        {[...Array(rev.s)].map((_, j) => <span key={j} className="text-[var(--color-primary)] text-xl">★</span>)}
                     </div>
                     <p className="text-gray-600 font-bold text-lg leading-relaxed italic uppercase tracking-tighter">"{rev.r}"</p>
                     <div className="flex items-center gap-6 pt-6 border-t border-gray-50">
                        <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center font-black text-xl text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shadow-inner">{rev.n[0]}</div>
                        <span className="font-black text-sm uppercase tracking-[0.3em]">{rev.n}</span>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 8. ELITE FEATURES (FUNCTIONALITY) */}
      <section className="py-32 shop-container">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
               { t: 'Digital Atelier', d: 'Master tailors meeting robotic precision.', i: <Zap className="w-10 h-10 text-[var(--color-primary)]" /> },
               { t: 'Express Global', d: 'Worldwide express logistics within 72 hours.', i: <Truck className="w-10 h-10" /> },
               { t: 'NFC Verified', d: 'Digital ownership & authenticity certificates.', i: <ShieldCheck className="w-10 h-10" /> },
               { t: 'Luxe Exchange', d: 'Hassle-free 30-day returns & swap service.', i: <RotateCcw className="w-10 h-10" /> }
            ].map((f, i) => (
               <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-6 text-center md:text-left"
               >
                  <div className="mb-4">{f.i}</div>
                  <h4 className="text-lg font-black uppercase tracking-tighter italic">{f.t}</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed tracking-widest">{f.d}</p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* 9. INNER CIRCLE NEWSLETTER */}
      <section className="py-32 bg-[var(--color-secondary)] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-primary)] opacity-10 blur-[150px] rounded-full -mr-64 -mt-64" />
         <div className="shop-container text-center space-y-16 relative z-10">
            <div className="space-y-6">
               <h2 className="text-6xl md:text-[100px] font-black text-white uppercase tracking-tighter italic leading-none">The Tribe.</h2>
               <p className="text-white/40 text-sm font-black uppercase tracking-[0.5em] italic">Join 50,000+ elite members globally.</p>
            </div>
            <div className="flex flex-col sm:flex-row max-w-2xl mx-auto gap-4 bg-white/5 p-3 rounded-[2rem] backdrop-blur-2xl border border-white/10 shadow-2xl">
               <input 
                  type="email" 
                  placeholder="WHATS YOUR IDENTITY EMAIL?" 
                  className="flex-grow bg-transparent px-8 py-5 text-white text-xs outline-none uppercase font-black tracking-widest placeholder:text-white/20" 
               />
               <button className="btn-primary rounded-2xl px-12 py-5 shadow-[0_15px_30px_rgba(255,63,108,0.3)]">Proceed</button>
            </div>
         </div>
      </section>

>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
    </div>
  );
}

export default Home;
