<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { landingContent } from "../data/themeContent";
=======
import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776

const QUOTES = [
  { text: "Style is a way to say who you are without having to speak.", author: "Rachel Zoe" },
  { text: "Fashion is the armor to survive the reality of everyday life.", author: "Bill Cunningham" },
  { text: "Elegance is not about being noticed, it's about being remembered.", author: "Giorgio Armani" },
];

function AuthLayout() {
  const location = useLocation();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const brandName = landingContent?.brand || "Sajan";

  useEffect(() => {
    const id = setInterval(() => setQuoteIndex((i) => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
<<<<<<< HEAD
    <div className="h-screen flex overflow-hidden bg-white">

      {/* ── LEFT: Video Panel ──────────────────────────────────────────── */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden flex-shrink-0">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://content.pexels.com/aigc-bundle/videos/4ffdecb8-1ba3-4ce8-bd38-544c9dc981aa.mp4"
          // poster="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        {/* Brand + back link on top-left */}
        <div className="absolute top-7 left-8 right-8 flex items-center justify-between z-10">
          <Link to="/" className="font-serif text-[15px] tracking-[0.3em] uppercase text-white/90 hover:text-white transition-colors">
            {brandName}
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-3 h-3" /> Store
          </Link>
        </div>

        {/* Rotating quote at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <p className="text-white/90 font-serif text-lg leading-snug max-w-xs mb-1.5">
                &ldquo;{QUOTES[quoteIndex].text}&rdquo;
=======
    <div className="relative min-h-screen flex selection:bg-[var(--color-primary)]/20 bg-white">
      
      {/* Left side: Premium Cinematic Fashion Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-end p-12 lg:p-20">
        <div className="absolute inset-0 z-0">
           <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
              className="w-full h-full object-cover" 
              alt="Fashion Model"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-[1]"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg">
           <Link to="/" className="inline-flex items-center gap-2 mb-10 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-2.5 rounded-full text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all shadow-2xl">
              <ArrowLeft className="w-4 h-4" /> Go to Storefront
           </Link>
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
           >
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,63,108,0.5)]">
                    <span className="text-white text-2xl font-black italic">B</span>
                 </div>
                 <span className="text-white/50 text-xs font-black uppercase tracking-[0.3em]">Atelier Elite</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-white leading-[0.9] mb-6 uppercase tracking-tighter">
                 Be Part of <br /><span className="text-[var(--color-primary)]">The Tribe.</span>
              </h1>
              <p className="text-white/70 text-base max-w-sm font-medium tracking-wide leading-relaxed">
                 Access exclusive drops, private atelier events, and a curated fashion experience designed for the modern rebel.
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
              </p>
              <p className="text-white/35 text-[9px] uppercase tracking-[0.3em]">
                — {QUOTES[quoteIndex].author}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-1.5">
            {QUOTES.map((_, i) => (
              <button key={i} onClick={() => setQuoteIndex(i)}
                className={`rounded-full transition-all duration-300 ${i === quoteIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* ── RIGHT: Form Panel — scrollable so nothing is cut off ──────── */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <Link to="/" className="font-serif text-[14px] tracking-[0.25em] uppercase text-[#041e3a]">{brandName}</Link>
          <Link to="/" className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 hover:text-[#041e3a] transition-colors">
            <ArrowLeft className="w-3 h-3" /> Store
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-12 py-8">
          <div className="w-full max-w-[380px]">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-50 flex-shrink-0">
          <p className="text-[9px] text-gray-300 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} {brandName}
          </p>
        </div>
=======
      {/* Right side: App Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-white border-l border-gray-100/50">
         <div className="w-full max-w-md px-8 py-12 relative z-10">
            {/* Mobile Header */}
            <div className="lg:hidden mb-12 flex justify-between items-center border-b border-gray-100 pb-6">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                     <span className="text-white text-sm font-black italic">B</span>
                  </div>
                  <span className="text-black text-sm font-black uppercase tracking-widest">Badshah</span>
               </div>
               <Link to="/" className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--color-primary)] flex items-center gap-2">
                  Storefront
                  <ArrowRight className="w-3 h-3" />
               </Link>
            </div>

            <div className="w-full relative">
               <div className="relative z-10">
                  <Outlet />
               </div>
            </div>
         </div>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
      </div>

    </div>
  );
}

export default AuthLayout;
