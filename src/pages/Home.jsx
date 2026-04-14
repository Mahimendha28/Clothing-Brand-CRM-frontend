import { startTransition, useEffect, useState, useRef } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import ProductCard from "../components/store/ProductCard";
import {
  getStoreFilters,
  getStoreProducts
} from "../services/catalogService";
import { landingContent } from "../data/themeContent";

function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    let ignore = false;
    const loadStorefront = async () => {
      try {
        setLoading(true);
        setError("");
        const [productsResponse] = await Promise.all([
          getStoreProducts({ limit: 8 }),
          getStoreFilters()
        ]);
        if (ignore) return;
        startTransition(() => {
          setFeaturedProducts(productsResponse.products || []);
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
    <div className="space-y-0 pb-20 bg-page overflow-x-hidden selection:bg-accent/20">
      {error && <div className="absolute top-0 z-50 w-full"><StatusBanner tone="danger">{error}</StatusBanner></div>}

      {/* 1. Modern SaaS Hero Section */}
      <section className="relative h-[90vh] md:h-screen w-full bg-page flex items-center justify-center overflow-hidden border-b border-soft pb-10">
        {/* Abstract Glowing Mesh Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <motion.div 
             animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="absolute -top-1/4 -right-1/4 w-[80vw] h-[80vw] rounded-full bg-accent/5 blur-[120px]" 
           />
           <motion.div 
             animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 15, 0] }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute -bottom-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[120px]" 
           />
        </div>

        <div className="relative z-10 text-center px-4 md:px-10 flex flex-col items-center justify-center h-full w-full max-w-5xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-input border border-soft text-xs font-semibold text-secondary mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            {landingContent?.hero?.eyebrow || "New Collection Available"}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="font-display text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight text-primary leading-[1.05] max-w-4xl"
          >
             Redefining <span className="text-secondary">Modern</span> Comfort.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-8 text-lg font-medium text-secondary max-w-2xl px-4"
          >
             Premium quality clothing built for modern professionals. Minimalist design meets everyday performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
             <Link to="/products" className="px-8 py-4 bg-primary text-canvas rounded-full font-semibold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2 w-full sm:w-auto">
                Explore Collection <ArrowRight className="w-4 h-4" />
             </Link>
             <Link to="/products?category=new" className="px-8 py-4 bg-canvas text-primary border border-soft rounded-full font-semibold transition-all hover:bg-input flex items-center justify-center gap-2 w-full sm:w-auto hover:shadow-sm">
                View New Arrivals
             </Link>
          </motion.div>
        </div>

        {/* Feature Image Banner at the bottom */}
        <motion.div 
           style={{ y: heroY, opacity: heroOpacity }}
           initial={{ opacity: 0, y: 100 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
           className="absolute bottom-[-15%] sm:bottom-[-20%] md:bottom-[-25%] left-1/2 -translate-x-1/2 w-[90%] max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-float border border-soft mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
        >
           <img src={landingContent?.hero?.image || "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=80"} alt="Hero Showcase" className="w-full aspect-[21/9] md:aspect-[32/11] object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </motion.div>
      </section>

      {/* 2. Structured Feature Grid (SaaS Style) */}
      <section className="py-32 w-full max-w-[1440px] mx-auto px-6 md:px-10 mt-16 md:mt-40">
         <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">Designed for real life.</h2>
            <p className="text-secondary text-lg leading-relaxed">We source the highest quality materials to construct pieces that look incredibly sharp but feel effortless to wear all day.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {landingContent?.featureStories?.slice(0, 2).map((story, i) => (
               <motion.div 
                  key={story.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="group rounded-3xl bg-canvas border border-soft overflow-hidden hover:shadow-float transition-all duration-300"
               >
                  <div className="aspect-[4/3] overflow-hidden bg-input relative">
                     <img 
                        src={story.image} 
                        alt={story.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=80"; }}
                     />
                  </div>
                  <div className="p-8 md:p-10 flex flex-col gap-4">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{story.eyebrow}</p>
                     <h3 className="font-display text-3xl font-bold text-primary">{story.title}</h3>
                     <p className="text-secondary leading-relaxed">{story.description}</p>
                     <Link to="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                        Learn More <ChevronRight className="w-4 h-4" />
                     </Link>
                  </div>
               </motion.div>
            ))}
         </div>
      </section>

      {/* 3. The Catalog: Horizontal Carousel Slider like Stripe */}
      <section className="w-full pb-32 pl-6 md:pl-10 overflow-hidden bg-canvas border-t border-b border-soft py-24">
        <div className="pr-6 md:pr-10 mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-soft pb-8 max-w-[1440px] mx-auto">
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-primary">New Arrivals</h2>
            <p className="text-secondary mt-3">The latest drops directly to your wardrobe.</p>
          </motion.div>
          <Link to="/products" className="group inline-flex items-center gap-2 text-sm font-semibold text-primary mt-6 md:mt-0 px-6 py-3 rounded-full border border-soft hover:bg-input transition-colors rounded-full">
            View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? <p className="text-sm font-medium text-secondary max-w-[1440px] mx-auto px-6">Loading Collection...</p> : null}

        {featuredProducts.length ? (
          <div className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory scrollbar-hide pr-6 md:pr-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {featuredProducts.map((product, i) => (
              <motion.div 
                 key={product.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true, margin: "100px" }}
                 transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                 className="w-[85vw] sm:w-[320px] lg:w-[360px] shrink-0 snap-start" 
              >
                  <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (!loading && <EmptyState title="Catalog updating" description="Our inventory is currently syncing." />)}
      </section>

    </div>
  );
}

export default Home;
