import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { landingContent } from "../data/themeContent";

function AuthLayout() {
  return (
    <div className="relative min-h-screen flex selection:bg-accent/20 bg-page">
      
      {/* Left side: Premium Image / Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-end p-12">
        {/* Deep abstract mesh background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Animated abstract shapes for that high-end feel */}
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
           className="absolute -top-[50%] -left-[50%] w-[100vw] h-[100vw] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-primary/0 to-transparent pointer-events-none"
        />

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
      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-page">
         {/* Subtle gradient for right panel on mobile */}
         <div className="absolute inset-0 pointer-events-none z-0 lg:hidden">
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
               transition={{ duration: 20, ease: "linear", repeat: Infinity }}
               className="absolute -top-[20%] -right-[20%] w-[70vw] h-[70vw] rounded-full bg-accent/10 blur-[100px]"
            />
         </div>

         <div className="w-full max-w-md px-6 py-12 relative z-10">
            {/* Mobile Header */}
            <div className="lg:hidden mb-12 flex justify-between items-center">
               <Link to="/" className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-canvas text-xl font-bold font-display">B</span>
               </Link>
               <Link to="/" className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-full border border-soft shadow-sm bg-canvas/80 backdrop-blur-md">
                  <ArrowLeft className="w-3 h-3" />
                  Store
               </Link>
            </div>

            {/* The Form Content Wrapper */}
            <div className="bg-canvas/50 backdrop-blur-3xl rounded-[32px] p-6 sm:p-10 shadow-soft border border-soft relative overflow-hidden">
               {/* Glass reflection */}
               <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none"></div>
               
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
