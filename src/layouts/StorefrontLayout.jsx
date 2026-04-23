import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Heart, LogOut, MapPin, Search, ShoppingBag, UserCircle2, Menu, X, ChevronRight, Package, Globe, MapPin as StorePin } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCart } from "../services/cartService";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import useNotificationSummary from "../hooks/useNotificationSummary";
import { landingContent } from "../data/themeContent";
import { getPublicCoupons } from "../services/couponService";
import { getHierarchyCategories, getHierarchySubcategories, getHierarchyTypes } from "../services/hierarchyService";

const navItems = [
  { label: "Home", to: "/", end: true },
  { label: "Men", to: "/products?category=men", category: "men" },
  { label: "Women", to: "/products?category=women", category: "women" },
  { label: "Kids", to: "/products?category=kids", category: "kids" },
  { label: "Discover", to: "/products?sort=new", sort: "new" }
];

const customerAccountLinks = [
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Profile", to: "/profile", icon: UserCircle2 },
  { label: "Orders", to: "/my-orders", icon: Package },
  { label: "Addresses", to: "/addresses", icon: MapPin },
  { label: "Wishlist", to: "/wishlist", icon: Heart }
];

const departmentVisuals = {
  men: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80",
  women: "https://plus.unsplash.com/premium_photo-1670282392820-e3590c1c5c54?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fHdvbWFuJTIwbW9kZWx8ZW58MHx8MHx8fDA%3D",
  kids: "https://images.pexels.com/photos/28644431/pexels-photo-28644431.jpeg"
};

const STORE_MAP_URL =
  import.meta.env.VITE_STORE_MAP_URL ||
  "https://www.google.com/maps/search/?api=1&query=Sajan+Clothing";

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
  const currentCategory = useMemo(
    () => (location.pathname === "/products" ? new URLSearchParams(location.search).get("category") || "" : ""),
    [location.pathname, location.search]
  );
  const currentSort = useMemo(
    () => (location.pathname === "/products" ? new URLSearchParams(location.search).get("sort") || "" : ""),
    [location.pathname, location.search]
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState([]);
  const [activeCouponIndex, setActiveCouponIndex] = useState(0);

  // Mega Menu State
  const [hierarchy, setHierarchy] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSearchOpen(false);
    setHoveredCategory(null);
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
    const loadHierarchy = async () => {
      try {
        const [catRes, subRes, typeRes] = await Promise.all([
          getHierarchyCategories(),
          getHierarchySubcategories(),
          getHierarchyTypes()
        ]);
        if (ignore) return;
        const categories = catRes.categories || [];
        const subcategories = subRes.subcategories || [];
        const types = typeRes.types || [];

        const tree = categories.map(cat => ({
          ...cat,
          subcategories: subcategories
            .filter(sub => Number(sub.category_id) === Number(cat.id))
            .map(sub => ({
              ...sub,
              types: types.filter(t => Number(t.subcategory_id) === Number(sub.id))
            }))
        }));
        setHierarchy(tree);
      } catch (err) {
        console.error("Failed to load hierarchy for mega menu", err);
      }
    };
    loadHierarchy();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    const syncCartCount = async (event) => {
      if (!loggedIn) {
        if (!ignore) setCartCount(0);
        return;
      }
      const nextCount = event?.detail?.cart?.item_count;
      if (typeof nextCount === "number") {
        if (!ignore) setCartCount(nextCount);
        return;
      }
      try {
        const response = await getCart();
        if (!ignore) setCartCount(response.cart?.item_count || 0);
      } catch (apiError) {
        if (!ignore) setCartCount(0);
      }
    };
    void syncCartCount();
    const handleCartUpdated = (event) => void syncCartCount(event);
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
        if (!ignore) setPublicCoupons([]);
      }
    };
    loadPublicCoupons();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (publicCoupons.length <= 1) return undefined;
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
    if (!activeCoupon?.code) return;
    try { await navigator.clipboard?.writeText(activeCoupon.code); } catch (_error) { }
    if (loggedIn) {
      navigate(`/checkout?coupon=${encodeURIComponent(activeCoupon.code)}`);
      return;
    }
    navigate("/products");
  };

  const isNavItemActive = (item, isActivePath) => {
    if (item.end) return isActivePath;
    if (item.category) return location.pathname === "/products" && currentCategory.toLowerCase() === item.category.toLowerCase();
    if (item.sort) return location.pathname === "/products" && currentSort.toLowerCase() === item.sort.toLowerCase();
    return isActivePath;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative selection:bg-[#041e3a]/20 flex flex-col">

      {/* ── Auto-Scrolling Marquee Banner ─────────────────────────────────── */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 28s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="bg-[#041e3a] text-white overflow-hidden border-b border-white/10" style={{ height: "36px" }}>
        <div className="marquee-track h-full items-center">
          {[
            /* Dynamic coupon items */
            ...publicCoupons.map(c => ({
              text: c.banner_text || c.title,
              sub: c.code ? `Use code: ${c.code}` : null,
              isLink: true,
              link: loggedIn ? `/checkout?coupon=${encodeURIComponent(c.code || "")}` : "/products",
            })),
            /* Static fallback items always shown */
            { text: "Free Standard Delivery on all orders", sub: null, isLink: false },
            { text: "New Season Collection — Shop Now", sub: null, isLink: true, link: "/products?sort=new" },
            { text: "Easy Returns & Exchanges", sub: null, isLink: false },
            { text: "Shop Men · Women · Kids", sub: null, isLink: true, link: "/products" },
            /* If no coupons, also add a placeholder deal */
            ...(publicCoupons.length === 0 ? [{ text: "Exclusive Deals — Sign In to Unlock", sub: null, isLink: true, link: "/login" }] : []),
          ]
          /* Duplicate the whole list for seamless infinite loop */
          .flatMap(item => [item, item])
          .map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-10 text-[10px] font-semibold tracking-[0.28em] uppercase whitespace-nowrap h-full"
            >
              {/* Diamond separator */}
              <span className="text-white/30 text-[7px] select-none">✦</span>

              {item.isLink ? (
                <Link
                  to={item.link}
                  className="hover:text-white/70 transition-colors duration-200"
                >
                  {item.text}
                  {item.sub && (
                    <span className="ml-2 text-[9px] text-white/50 font-normal tracking-wider normal-case">
                      ({item.sub})
                    </span>
                  )}
                </Link>
              ) : (
                <span>
                  {item.text}
                  {item.sub && (
                    <span className="ml-2 text-[9px] text-white/50 font-normal tracking-wider normal-case">
                      ({item.sub})
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-[80] transition-all duration-300 border-b pointer-events-auto ${scrolled ? "bg-white/95 backdrop-blur-xl border-gray-200 shadow-sm py-2" : "bg-white py-3 border-transparent"
          }`}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 flex items-center justify-between gap-4 relative z-[81] pointer-events-auto lg:grid lg:grid-cols-[minmax(250px,1fr)_auto_minmax(250px,1fr)] lg:gap-6">

          {/* Left: Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3 lg:min-w-0">
            <button
              className="lg:hidden text-[#041e3a] hover:text-[#041e3a]/70 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="font-serif text-[22px] font-normal tracking-[0.2em] text-[#041e3a] sm:text-[26px] lg:text-[28px] uppercase">
              <span className="hidden sm:block leading-none">{(landingContent?.brand || "Sajan")}</span>
              <span className="sm:hidden text-xl tracking-[0.15em] leading-none">SAJAN</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation with Hover */}
          <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-10 relative z-[82] pointer-events-auto whitespace-nowrap">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="h-full flex items-center"
                onMouseEnter={() => setHoveredCategory(item.category || null)}
              >
                <NavLink
                  to={item.to}
                  end={Boolean(item.end)}
                  className={({ isActive }) => {
                    const active = isNavItemActive(item, isActive) || (hoveredCategory && hoveredCategory === item.category);
                    return `relative py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${active ? "text-[#041e3a] border-b-2 border-[#041e3a]" : "text-[#041e3a]/80 hover:text-[#041e3a] border-b-2 border-transparent"
                      }`;
                  }}
                >
                  {item.label}
                </NavLink>
              </div>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 md:gap-4 lg:min-w-0">
            <div className="relative hidden md:block">
              {searchOpen ? (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 210, opacity: 1 }} className="flex items-center border-b border-[#041e3a] pb-1">
                  <Search className="h-4 w-4 text-[#041e3a]" />
                  <input autoFocus type="text" placeholder="Search" className="w-full bg-transparent pl-2 pr-8 text-xs outline-none uppercase tracking-widest placeholder:text-gray-400 text-[#041e3a]" />
                  <button onClick={() => setSearchOpen(false)} className="absolute right-0 text-[#041e3a]"><X className="h-4 w-4" /></button>
                </motion.div>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="text-[#041e3a] transition-colors p-1 hover:text-[#041e3a]/70">
                  <Search className="h-5 w-5 stroke-[1.5]" />
                </button>
              )}
            </div>

            {!searchOpen && (
              <button
                onClick={() => navigate("/products")}
                className="p-1 text-[#041e3a] transition-colors hover:text-[#041e3a]/70 md:hidden"
              >
                <Search className="h-5 w-5 stroke-[1.5]" />
              </button>
            )}

            <Link to={accountPath} className="flex items-center gap-2 p-1 text-[#041e3a] transition-colors hover:text-[#041e3a]/70">
              <UserCircle2 className="h-5 w-5 stroke-[1.5]" />
            </Link>

            <Link to="/wishlist" className="hidden p-1 text-[#041e3a] transition-colors hover:text-[#041e3a]/70 sm:block">
              <Heart className="h-5 w-5 stroke-[1.5]" />
            </Link>

            {/* Find a Store — restored map button */}
            <a
              href={STORE_MAP_URL}
              target="_blank"
              rel="noreferrer"
              title="Find a store near you"
              className="hidden p-1 text-[#041e3a] transition-colors hover:text-[#041e3a]/70 md:block"
            >
              <StorePin className="h-5 w-5 stroke-[1.5]" />
            </a>

            <Link to="/cart" className="relative p-1 text-[#041e3a] transition-colors hover:text-[#041e3a]/70">
              <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute top-[2px] right-[2px] w-4 h-4 bg-[#041e3a] text-white text-[9px] items-center justify-center flex font-bold rounded-full border border-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {hoveredCategory && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden z-[90]"
            >
              <div className="max-w-[1440px] mx-auto px-10 py-8 flex gap-10 items-start">
                {(() => {
                  const catNode = hierarchy.find(c => c.name.toLowerCase() === hoveredCategory.toLowerCase());
                  if (!catNode) return (
                    <div className="flex-1 flex items-center justify-center text-xs text-gray-300 uppercase tracking-widest py-8">
                      Loading…
                    </div>
                  );
                  return (
                    <>
                      {/* ── Animated category columns ── */}
                      <div className="flex-1 grid grid-cols-4 gap-x-8 gap-y-0 content-start">
                        {catNode.subcategories.slice(0, 4).map((sub, colIdx) => (
                          <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.28, delay: colIdx * 0.06, ease: "easeOut" }}
                            className="flex flex-col pt-1"
                          >
                            {/* Subcategory heading */}
                            <Link
                              to={`/products?category=${catNode.id}&subcategory=${sub.id}`}
                              className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#041e3a] mb-4 hover:text-[#041e3a]/60 transition-colors"
                              onClick={() => setHoveredCategory(null)}
                            >
                              {sub.name}
                            </Link>
                            {/* Thin divider */}
                            <div className="w-6 h-px bg-gray-200 mb-4" />
                            {/* Type links */}
                            <ul className="space-y-3.5">
                              {sub.types.slice(0, 7).map((type, typeIdx) => (
                                <motion.li
                                  key={type.id}
                                  initial={{ opacity: 0, x: -6 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.22, delay: colIdx * 0.06 + typeIdx * 0.035 + 0.1 }}
                                >
                                  <Link
                                    to={`/products?category=${catNode.id}&subcategory=${sub.id}&type=${type.id}`}
                                    className="text-[10px] uppercase tracking-[0.18em] text-gray-400 hover:text-[#041e3a] transition-colors duration-150"
                                    onClick={() => setHoveredCategory(null)}
                                  >
                                    {type.name}
                                  </Link>
                                </motion.li>
                              ))}
                              {sub.types.length > 7 && (
                                <motion.li
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2, delay: colIdx * 0.06 + 0.4 }}
                                >
                                  <Link
                                    to={`/products?category=${catNode.id}&subcategory=${sub.id}`}
                                    className="text-[9px] uppercase tracking-[0.22em] text-[#041e3a] font-bold hover:underline"
                                    onClick={() => setHoveredCategory(null)}
                                  >
                                    + View All
                                  </Link>
                                </motion.li>
                              )}
                            </ul>
                          </motion.div>
                        ))}
                      </div>

                      {/* ── Compact Promo Image w/ category-change transition ── */}
                      <div className="shrink-0 w-[170px]">
                        <div className="w-full aspect-[3/4] overflow-hidden relative bg-gray-100 cursor-pointer">

                          {/* Image transitions when category changes */}
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={hoveredCategory}
                              src={departmentVisuals[hoveredCategory] || ""}
                              alt={catNode.name}
                              className="absolute inset-0 w-full h-full object-cover object-top"
                              initial={{ opacity: 0, scale: 1.06 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.03 }}
                              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                            />
                          </AnimatePresence>

                          {/* Gradient overlay — always on top */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                          {/* Text — also transitions with category */}
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`text-${hoveredCategory}`}
                              className="absolute bottom-0 left-0 right-0 p-4 text-center"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.35, delay: 0.15 }}
                            >
                              <p className="text-white/50 text-[8px] uppercase tracking-[0.4em] mb-1">New Season</p>
                              <p className="text-white font-serif text-base leading-tight mb-2.5 tracking-wide">{catNode.name}</p>
                              <Link
                                to={`/products?category=${catNode.id}`}
                                className="text-white text-[8px] uppercase tracking-[0.3em] font-bold border-b border-white/60 pb-0.5 hover:border-white transition-colors"
                                onClick={() => setHoveredCategory(null)}
                              >
                                Shop
                              </Link>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              className="fixed inset-0 z-[60] bg-[#041e3a]/20 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-[70] w-full max-w-[300px] bg-white flex flex-col lg:hidden border-r border-gray-200 shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-200">
                <span className="font-serif text-xl tracking-widest uppercase text-[#041e3a]">{landingContent?.brand || "Sajan"}</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-[#041e3a] transition-colors">
                  <X className="h-6 w-6 stroke-[1.5]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={Boolean(item.end)}
                    className={({ isActive }) => {
                      const active = isNavItemActive(item, isActive);
                      return `flex justify-between items-center px-4 py-3 text-xs font-semibold uppercase tracking-widest rounded-none transition-colors ${active ? "text-[#041e3a] bg-gray-50" : "text-gray-600 hover:bg-gray-50 hover:text-[#041e3a]"
                        }`;
                    }}
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </NavLink>
                ))}

                <div className="my-6 border-t border-gray-200 mx-4" />

                {loggedIn && isCustomer
                  ? customerAccountLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#041e3a] transition-colors text-xs uppercase tracking-widest font-semibold"
                      >
                        <Icon className="h-5 w-5 stroke-[1.5]" />
                        {item.label}
                      </Link>
                    );
                  })
                  : (
                    <>
                      <Link to={accountPath} className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#041e3a] transition-colors text-xs uppercase tracking-widest font-semibold">
                        <UserCircle2 className="h-5 w-5 stroke-[1.5]" />
                        {accountLabel}
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#041e3a] transition-colors text-xs uppercase tracking-widest font-semibold">
                        <Heart className="h-5 w-5 stroke-[1.5]" />
                        Wishlist
                      </Link>
                    </>
                  )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern High-End Footer - Classic Navy */}
      <footer className="bg-[#041e3a] pt-20 pb-10 px-6 md:px-10 overflow-hidden mt-auto text-white">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">

          <div className="md:col-span-1">
            <Link to="/" className="font-serif text-2xl tracking-[0.2em] text-white flex items-center gap-2 mb-8 uppercase">
              <span>{landingContent?.brand || "Sajan"}</span>
            </Link>
            <p className="text-[11px] uppercase tracking-widest text-white/70 leading-relaxed mb-8">
              Premium quality clothing built for modern professionals. Minimalist design meets everyday comfort.
            </p>
            <div className="flex items-center gap-5">
              <a href="#" className="text-white hover:text-white/60 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-white hover:text-white/60 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-[11px] font-semibold uppercase tracking-widest text-white mb-8">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/products?category=men" className="text-white/70 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">Men's</Link></li>
              <li><Link to="/products?category=women" className="text-white/70 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">Women's</Link></li>
              <li><Link to="/products?category=kids" className="text-white/70 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">Kids</Link></li>
              <li><Link to="/products?sort=new" className="text-white/70 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-[11px] font-semibold uppercase tracking-widest text-white mb-8">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-white/70 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">Contact Us</Link></li>
              <li><Link to="/returns" className="text-white/70 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="text-white/70 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">FAQ</Link></li>
              <li><Link to="/my-orders" className="text-white/70 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-[11px] font-semibold uppercase tracking-widest text-white mb-8">Subscribe</h4>
            <p className="text-[11px] uppercase tracking-widest text-white/70 mb-4 leading-relaxed">Sign up to receive our latest updates and offers.</p>
            <form className="flex mt-2 relative border-b border-white/30 pb-2">
              <input type="email" placeholder="ENTER EMAIL ADDRESS" className="w-full bg-transparent outline-none text-[10px] tracking-widest uppercase placeholder:text-white/30 text-white" />
              <button type="button" className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:text-white/70 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-white/50 uppercase tracking-widest">© {new Date().getFullYear()} {landingContent?.brand || "Sajan"}. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8 text-[10px] text-white/50 uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Notice</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default StorefrontLayout;

