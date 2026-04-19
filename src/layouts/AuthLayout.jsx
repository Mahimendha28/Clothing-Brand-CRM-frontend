import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

function AuthLayout() {
  return (
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
              </p>
           </motion.div>
        </div>
      </div>

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
      </div>

    </div>
  );
}

export default AuthLayout;
