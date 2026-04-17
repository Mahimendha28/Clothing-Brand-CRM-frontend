import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { landingContent } from "../data/themeContent";

function AuthLayout() {
  return (
    <div className="relative min-h-screen flex selection:bg-accent/20 bg-page">
      
      {/* Left side: Premium Image / Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-end p-12">
        {/* Premium Cinematic Video Background (3D Cloth Simulation) */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
            src="https://videos.pexels.com/video-files/3129595/3129595-uhd_3840_2160_30fps.mp4"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg">
           <Link to="/" className="inline-flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-medium hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Return to Store
           </Link>
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
           >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6">
                 <span className="text-primary text-2xl font-bold font-display">B</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-medium text-white leading-tight mb-4 tracking-tight">
                 Enter the <br />Badshah Ecosystem.
              </h1>
              <p className="text-white/70 text-lg max-w-sm tracking-wide">
                 Premium apparel. Unmatched quality. Sign in to manage your drops and exclusive access.
              </p>
           </motion.div>
        </div>
      </div>

      {/* Right side: App Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-white">
         <div className="w-full max-w-md px-6 py-12 relative z-10">
            {/* Mobile Header */}
            <div className="lg:hidden mb-12 flex justify-between items-center">
               <Link to="/" className="text-black text-xl font-black font-display uppercase tracking-widest">
                  Badshah
               </Link>
               <Link to="/" className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 hover:text-black transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-3 h-3" />
                  Store
               </Link>
            </div>

            {/* The Form Content Wrapper (Ultra Minimal) */}
            <div className="w-full relative bg-white">
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
