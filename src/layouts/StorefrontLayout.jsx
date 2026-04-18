import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Heart, LogOut, MapPin, Search, ShoppingBag, UserCircle2, Menu, X, ChevronRight, Package } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCart } from "../services/cartService";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import useNotificationSummary from "../hooks/useNotificationSummary";
import { landingContent } from "../data/themeContent";
import { getPublicCoupons } from "../services/couponService";

const navItems = [
  { label: "Home", to: "/", end: true },
  { label: "Men", to: "/products?category=men" },
  { label: "Women", to: "/products?category=women" },
  { label: "New Arrivals", to: "/products?sort=new" }
];

const customerAccountLinks = [
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Profile", to: "/profile", icon: UserCircle2 },
  { label: "Orders", to: "/my-orders", icon: Package },
  { label: "Addresses", to: "/addresses", icon: MapPin },
  { label: "Wishlist", to: "/wishlist", icon: Heart }
];

function StorefrontLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated: loggedIn } = useSelector((state) => state.auth);
  const { unreadCount } = useNotificationSummary(loggedIn);
  
  const isCustomer = user?.role === "customer";
  const accountPath = loggedIn ? (isCustomer ? "/profile" : "/dashboard") : "/login";
  const accountLabel = loggedIn ? (isCustomer ? "Profile" : "Dashboard") : "Sign In";
  const notificationsPath = isCustomer ? "/notifications" : "/dashboard/notifications";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState([]);
  const [activeCouponIndex, setActiveCouponIndex] = useState(0);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [isMobileMenuOpen]);

  useEffect(() => {
    let ignore = false;

    const syncCartCount = async (event) => {
      if (!loggedIn) {
        if (!ignore) {
          setCartCount(0);
        }
        return;
      }

      const nextCount = event?.detail?.cart?.item_count;

      if (typeof nextCount === "number") {
        if (!ignore) {
          setCartCount(nextCount);
        }
        return;
      }

      try {
        const response = await getCart();

        if (!ignore) {
          setCartCount(response.cart?.item_count || 0);
        }
      } catch (apiError) {
        if (!ignore) {
          setCartCount(0);
        }
      }
    };

    void syncCartCount();

    const handleCartUpdated = (event) => {
      void syncCartCount(event);
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      ignore = true;
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [loggedIn]);

  useEffect(() => {
    let ignore = false;

    const loadPublicCoupons = async () => {
      try {
        const response = await getPublicCoupons();

        if (!ignore) {
          setPublicCoupons(response.coupons || []);
          setActiveCouponIndex(0);
        }
      } catch (_error) {
        if (!ignore) {
          setPublicCoupons([]);
        }
      }
    };

    loadPublicCoupons();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (publicCoupons.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveCouponIndex((current) => (current + 1) % publicCoupons.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [publicCoupons]);

  const handleLogout = () => {
    setCartCount(0);
    setIsMobileMenuOpen(false);
    setSearchOpen(false);
    dispatch(logout());
    navigate("/");
  };

  const activeCoupon = publicCoupons[activeCouponIndex] || null;

  const handleUseCoupon = async () => {
    if (!activeCoupon?.code) {
      return;
    }

    try {
      await navigator.clipboard?.writeText(activeCoupon.code);
    } catch (_error) {
      // ignore clipboard errors on unsupported browsers
    }

    if (loggedIn) {
      navigate(`/checkout?coupon=${encodeURIComponent(activeCoupon.code)}`);
      return;
    }

    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-page font-sans text-primary relative selection:bg-accent/20 flex flex-col">
      
      {/* Top Notification Bar */}
      <div className="bg-primary text-page text-xs font-medium py-2 px-4 text-center tracking-wide">
        {activeCoupon ? (
          <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 text-center">
            <span>{activeCoupon.banner_text || activeCoupon.title}</span>
            <span className="font-bold">Code: {activeCoupon.code}</span>
            <button
              type="button"
              onClick={handleUseCoupon}
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              Use This Coupon
            </button>
          </div>
        ) : (
          <>
            Free shipping on all orders over $150.
            <Link to="/products" className="underline underline-offset-2 ml-2 hover:text-accent transition-colors">Shop Now</Link>
          </>
        )}
      </div>

      {/* Main Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled ? "bg-canvas/80 backdrop-blur-xl border-soft shadow-sm py-3" : "bg-canvas/50 backdrop-blur-md py-5 border-transparent"
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between">
          
          {/* Left: Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-6">
            <button 
              className="lg:hidden text-primary hover:text-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="font-display text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                 <span className="text-canvas text-xl leading-none font-bold">B</span>
              </div>
              <span className="hidden sm:block">{landingContent?.brand || "Badshah"}</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
             {navItems.map((item) => (
                <NavLink 
                  key={item.label} 
                  to={item.to} 
                  className={({isActive}) => `text-sm font-medium transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-secondary'}`}
                >
                  {item.label}
                </NavLink>
             ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-5">
            <div className="relative hidden md:block">
               {searchOpen ? (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} className="flex items-center">
                     <input autoFocus type="text" placeholder="Search products..." className="w-full bg-input rounded-full py-2 pl-4 pr-10 text-sm outline-none border border-transparent focus:border-accent/30 transition-all" />
                     <button onClick={() => setSearchOpen(false)} className="absolute right-3 text-muted hover:text-primary"><X className="h-4 w-4" /></button>
                  </motion.div>
               ) : (
                  <button onClick={() => setSearchOpen(true)} className="text-secondary hover:text-primary transition-colors p-2">
                    <Search className="h-5 w-5" />
                  </button>
               )}
            </div>
            
            {!searchOpen && (
              <button
                onClick={() => navigate("/products")}
                className="text-secondary hover:text-primary transition-colors p-2 md:hidden"
                title="Search Products"
              >
                 <Search className="h-5 w-5" />
              </button>
            )}

            <Link to={loggedIn ? notificationsPath : "/login"} className="text-secondary hover:text-primary transition-colors p-2 hidden sm:block relative">
              <Bell className="h-5 w-5" />
              {loggedIn && unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-1 min-w-[18px] rounded-full bg-accent px-1.5 text-center text-[10px] font-bold leading-[18px] text-canvas">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>

            <Link to={accountPath} className="text-secondary hover:text-primary transition-colors p-2 flex items-center gap-2">
              <UserCircle2 className="h-5 w-5" />
              <span className="hidden xl:block text-sm font-medium">{accountLabel}</span>
            </Link>
            
            <Link to="/cart" className="text-secondary hover:text-primary transition-colors p-2 relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-[2px] right-0 w-4 h-4 bg-primary text-canvas text-[9px] items-center justify-center flex font-bold rounded-full">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {loggedIn && (
              <button 
                onClick={handleLogout} 
                className="hidden items-center gap-2 rounded-full border border-soft px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-danger sm:inline-flex"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-[70] w-full max-w-[300px] bg-canvas flex flex-col lg:hidden border-r border-soft shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-soft">
                <span className="font-display text-xl font-bold">{landingContent?.brand || "Badshah"}</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-secondary hover:text-primary rounded-full hover:bg-input transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className="flex justify-between items-center px-4 py-3 text-lg font-medium text-primary rounded-lg hover:bg-input transition-colors"
                  >
                    {item.label}
                    <ChevronRight className="h-5 w-5 text-muted" />
                  </NavLink>
                ))}
                
                <div className="my-6 border-t border-soft mx-4" />
                
                {loggedIn && isCustomer
                  ? customerAccountLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-input rounded-lg transition-colors font-medium"
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })
                  : (
                    <>
                      <Link to={accountPath} className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-input rounded-lg transition-colors font-medium">
                        <UserCircle2 className="h-5 w-5" /> 
                        {accountLabel}
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-input rounded-lg transition-colors font-medium">
                        <Heart className="h-5 w-5" /> 
                        Wishlist
                      </Link>
                    </>
                  )}
              </div>

              {loggedIn ? (
                <div className="p-6 border-t border-soft">
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-input hover:bg-soft text-primary font-medium rounded-xl transition-colors">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="p-6 border-t border-soft space-y-3">
                  <Link to="/login" className="flex items-center justify-center w-full py-3 px-4 border border-strong hover:bg-input text-primary font-medium rounded-xl transition-colors">
                    Sign In
                  </Link>
                  <Link to="/signup" className="flex items-center justify-center w-full py-3 px-4 bg-primary text-canvas font-medium rounded-xl transition-colors hover:bg-primary/90 shadow-soft">
                    Create Account
                  </Link>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern High-End Footer */}
      <footer className="bg-canvas border-t border-soft pt-20 pb-10 px-6 md:px-10 overflow-hidden mt-auto">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
          
          <div className="md:col-span-1">
             <Link to="/" className="font-display text-2xl font-bold tracking-tight text-primary flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                   <span className="text-canvas text-xl leading-none font-bold">B</span>
                </div>
                <span>{landingContent?.brand || "Badshah"}</span>
             </Link>
             <p className="text-sm text-secondary leading-relaxed mb-6">
                Premium quality clothing built for modern professionals. Minimalist design meets everyday comfort.
             </p>
             <div className="flex items-center gap-4">
                <a href="#" className="w-9 h-9 rounded-full bg-input flex items-center justify-center text-secondary hover:bg-primary hover:text-canvas transition-colors">
                   <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-input flex items-center justify-center text-secondary hover:bg-primary hover:text-canvas transition-colors">
                   <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/></svg>
                </a>
             </div>
          </div>
          
          <div>
            <h4 className="font-bold text-primary mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/products?category=men" className="text-secondary hover:text-accent transition-colors text-sm font-medium">Men's Collection</Link></li>
              <li><Link to="/products?category=women" className="text-secondary hover:text-accent transition-colors text-sm font-medium">Women's Collection</Link></li>
              <li><Link to="/products?sort=new" className="text-secondary hover:text-accent transition-colors text-sm font-medium">New Arrivals</Link></li>
              <li><Link to="/products?sort=popular" className="text-secondary hover:text-accent transition-colors text-sm font-medium">Best Sellers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-primary mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-secondary hover:text-accent transition-colors text-sm font-medium">Contact Us</Link></li>
              <li><Link to="/returns" className="text-secondary hover:text-accent transition-colors text-sm font-medium">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="text-secondary hover:text-accent transition-colors text-sm font-medium">FAQ</Link></li>
              <li><Link to="/my-orders" className="text-secondary hover:text-accent transition-colors text-sm font-medium">Track Order</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-primary mb-6">Subscribe</h4>
            <p className="text-sm text-secondary mb-4">Get 10% off your first order and exclusive updates.</p>
            <form className="flex mt-2 relative">
              <input type="email" placeholder="Your email address" className="w-full bg-input border border-transparent focus:border-accent outline-none text-sm rounded-xl py-3 pl-4 pr-12 transition-colors" />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-canvas hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>
          </div>
        </div>
        
        <div className="max-w-[1440px] mx-auto border-t border-soft pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted font-medium">© {new Date().getFullYear()} {landingContent?.brand || "Badshah"}. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-muted font-medium">
             <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
             <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default StorefrontLayout;
