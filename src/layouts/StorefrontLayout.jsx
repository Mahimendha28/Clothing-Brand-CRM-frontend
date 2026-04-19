import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Heart, LogOut, MapPin, Search, ShoppingBag, UserCircle2, Menu, X, ChevronRight, Package, ArrowRight } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCart } from "../services/cartService";
import { useSelector, useDispatch } from "react-redux";
import { getStoredToken } from "../utils/auth";

function StorefrontLayout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCartData = async () => {
      const token = getStoredToken();
      if (!token) {
        setCartCount(0);
        return;
      }

      try {
        const response = await getCart();
        setCartCount(response?.cart?.item_count || 0);
      } catch (error) {
        if (error.status === 401) {
          setCartCount(0);
        } else {
          console.error("Failed to fetch cart:", error);
        }
      }
    };
    fetchCartData();
  }, [location]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] selection:bg-[var(--color-primary)] selection:text-white">
      {/* LUXURY ANNOUNCEMENT */}
      <div className="bg-black py-2.5 text-[9px] font-black text-white text-center uppercase tracking-[0.4em]">
        The Elite Atelier Collection is now live. Complimentary shipping worldwide.
      </div>

      {/* MINIMALIST HEADER */}
      <header 
        className={`sticky top-0 z-50 bg-white/90 backdrop-blur-xl transition-all duration-500 ${
          scrolled ? "h-16 shadow-soft" : "h-24"
        }`}
      >
        <div className="shop-container h-full flex items-center justify-between">
          
          {/* Logo & Category Nav */}
          <div className="flex items-center gap-16 h-full">
            <Link to="/" className="flex-shrink-0 group">
               <h1 className="text-xl font-black tracking-[0.2em] text-black uppercase flex items-center gap-2">
                 <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center group-hover:bg-pink-500 transition-colors">
                    <span className="text-white text-lg italic">B</span>
                 </div>
                 Badshah
               </h1>
            </Link>

            <nav className="hidden lg:flex items-center h-full">
              {[
                { name: 'Men', path: '/products?category=men' },
                { name: 'Women', path: '/products?category=women' },
                { name: 'Kids', path: '/products?category=kids' },
                { name: 'Archive', path: '/products?category=archive' }
              ].map((item) => (
                 <NavLink 
                   key={item.name} 
                   to={item.path} 
                   className={({ isActive }) => `
                     nav-link flex items-center h-full text-xs font-bold uppercase tracking-widest
                     ${isActive ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-text-main)]"}
                   `}
                 >
                    {item.name}
                 </NavLink>
              ))}
            </nav>
          </div>

          {/* Search Bar (Myntra Style) */}
          <div className="hidden md:flex flex-grow max-w-xl relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search for products, brands and more"
              className="w-full bg-[var(--color-bg-surface)] border border-transparent py-2.5 pl-12 pr-4 rounded-md text-sm outline-none focus:bg-white focus:border-[var(--color-border-main)] transition-all"
            />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-8">
             <Link to={user ? "/dashboard" : "/login"} className="flex flex-col items-center gap-1 group">
                <UserCircle2 className="w-5 h-5 text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors" />
                <span className="text-[10px] font-bold text-[var(--color-text-main)] uppercase">Profile</span>
             </Link>

             <Link to="/wishlist" className="flex flex-col items-center gap-1 group">
                <Heart className="w-5 h-5 text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors" />
                <span className="text-[10px] font-bold text-[var(--color-text-main)] uppercase">Wishlist</span>
             </Link>

             <Link to="/cart" className="flex flex-col items-center gap-1 group relative">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                        {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[var(--color-text-main)] uppercase">Bag</span>
             </Link>

             {/* Mobile Menu Trigger */}
             <button className="lg:hidden" onClick={() => setIsMenuOpen(true)}>
                <Menu className="w-6 h-6" />
             </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[101] shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-xl font-black uppercase">MENU</h2>
                <button onClick={() => setIsMenuOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-6">
                {['Men', 'Women', 'Kids', 'Archive', 'New Arrivals', 'Offers'].map(item => (
                   <Link key={item} to="/products" className="block text-sm font-bold uppercase tracking-widest py-3 border-b border-[var(--color-border-light)]">{item}</Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="min-h-screen">
        <Outlet />
      </main>

      {/* MODERN E-COMMERCE FOOTER */}
      <footer className="bg-white border-t border-[var(--color-border-light)] mt-20 pt-16 pb-12">
         <div className="shop-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
               <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-main)]">Online Shopping</h4>
                  <ul className="space-y-3 text-[var(--color-text-subtle)] text-sm">
                     {['Men', 'Women', 'Kids', 'Home & Living', 'Beauty', 'Gift Cards'].map(l => (
                        <li key={l}><Link to="/products" className="hover:text-black transition-colors">{l}</Link></li>
                     ))}
                  </ul>
               </div>
               <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-main)]">Customer Services</h4>
                  <ul className="space-y-3 text-[var(--color-text-subtle)] text-sm">
                     {['Contact Us', 'FAQ', 'T&C', 'Terms of Use', 'Track Orders', 'Shipping', 'Cancellation', 'Returns'].map(l => (
                        <li key={l}><Link to="#" className="hover:text-black transition-colors">{l}</Link></li>
                     ))}
                  </ul>
               </div>
               <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-main)]">Experience App</h4>
                  <div className="flex flex-col gap-4">
                    <div className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer hover:bg-black/80">
                       <span className="text-xl"></span>
                       <div className="flex flex-col">
                          <span className="text-[7px] uppercase leading-none">Download on the</span>
                          <span className="text-[10px] font-bold leading-none">App Store</span>
                       </div>
                    </div>
                    <div className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer hover:bg-black/80">
                       <span className="text-xl">▶</span>
                       <div className="flex flex-col">
                          <span className="text-[7px] uppercase leading-none">Get it on</span>
                          <span className="text-[10px] font-bold leading-none">Google Play</span>
                       </div>
                    </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-main)]">Keep in Touch</h4>
                  <p className="text-sm text-[var(--color-text-subtle)]">Subscribe for early access to sales and exclusive drops.</p>
                  <div className="flex gap-4">
                    <input type="email" placeholder="YOUR EMAIL" className="flex-grow bg-[var(--color-bg-surface)] px-4 py-2 text-xs font-bold outline-none" />
                    <button className="bg-[var(--color-primary)] text-white px-4 py-2 text-[10px] font-black uppercase">Join</button>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-[var(--color-border-light)]">
               <div className="flex items-center gap-8">
                  <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center font-black text-xs">100%</div>
                  <p className="text-[10px] text-[var(--color-text-subtle)] font-medium"><span className="font-black text-black">100% ORIGINAL</span> guarantee for all products at badshahelite.com</p>
               </div>
               <div className="flex items-center gap-8">
                  <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center font-black text-xs italic">30 D</div>
                  <p className="text-[10px] text-[var(--color-text-subtle)] font-medium"><span className="font-black text-black">Return within 30 days</span> of receiving your order</p>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default StorefrontLayout;
