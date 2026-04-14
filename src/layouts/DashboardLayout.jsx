import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { clearAuth, getStoredUser } from "../utils/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Search,
  Settings as SettingsIcon,
  ShoppingBag,
  UserCircle2,
  Users,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { landingContent } from "../data/themeContent";

const crmShellPaths = new Set([
  "/dashboard",
  "/inventory",
  "/orders",
  "/customers",
  "/analytics",
  "/settings"
]);

const crmNavItems = [
  {
    label: "Overview",
    to: "/dashboard",
    icon: LayoutDashboard,
    match: (pathname) => pathname === "/dashboard" || pathname.startsWith("/dashboard/")
  },
  {
    label: "Inventory",
    to: "/inventory",
    icon: Package,
    match: (pathname) =>
      pathname === "/inventory" ||
      pathname.startsWith("/inventory/") ||
      pathname.startsWith("/admin/products") ||
      pathname.startsWith("/admin/categories") ||
      pathname.startsWith("/admin/brands")
  },
  {
    label: "Orders",
    to: "/orders",
    icon: ClipboardList,
    match: (pathname) => pathname === "/orders" || pathname.startsWith("/orders/")
  },
  {
    label: "Customers",
    to: "/customers",
    icon: Users,
    match: (pathname) =>
      pathname === "/customers" ||
      pathname.startsWith("/customers/") ||
      pathname.startsWith("/admin/users")
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: BarChart3,
    match: (pathname) => pathname === "/analytics"
  },
  {
    label: "Settings",
    to: "/settings",
    icon: SettingsIcon,
    match: (pathname) => pathname === "/settings"
  }
];

function DashboardLayout() {
  const user = getStoredUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const useCrmShell =
    user?.role === "admin" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/inventory") ||
    location.pathname.startsWith("/orders") ||
    location.pathname.startsWith("/customers") ||
    crmShellPaths.has(location.pathname);

  const brandName = landingContent?.brand || "Badshah";

  if (useCrmShell) {
    return (
      <div className="flex h-screen overflow-hidden bg-page text-primary selection:bg-accent/20">
        
        {/* Mobile menu overlay */}
        <AnimatePresence>
           {mobileMenuOpen && (
              <>
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-40 bg-primary/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                 <motion.aside initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{type:"spring", damping:25, stiffness:200}} className="fixed inset-y-0 left-0 z-50 w-72 bg-canvas flex flex-col border-r border-soft shadow-2xl lg:hidden">
                    <div className="flex items-center justify-between px-6 py-6 border-b border-soft">
                       <Link to="/" className="font-display text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                             <span className="text-canvas text-sm leading-none font-bold">B</span>
                          </div>
                          <span>{brandName}</span>
                       </Link>
                       <button onClick={() => setMobileMenuOpen(false)} className="text-secondary hover:text-primary p-2">
                          <X className="h-5 w-5" />
                       </button>
                    </div>
                    {/* Reuse nav rendering below */}
                    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                      {crmNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.match(location.pathname);
                        return (
                          <NavLink key={item.label} to={item.to} onClick={()=>setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-primary text-canvas shadow-sm" : "text-secondary hover:bg-input hover:text-primary"}`}>
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </nav>
                 </motion.aside>
              </>
           )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-[260px] flex-col border-r border-soft bg-canvas shrink-0 relative z-10 transition-all duration-300">
          <div className="px-6 py-6">
            <Link to="/" className="font-display text-xl font-bold tracking-tight text-primary flex items-center gap-2 mb-1">
               <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-canvas text-lg leading-none font-bold">B</span>
               </div>
               <span>{brandName}</span>
            </Link>
            <p className="text-xs text-muted font-medium ml-10">Administration</p>
          </div>

          <nav className="flex-1 px-4 mt-6 overflow-y-auto">
            <div className="space-y-1.5">
              {crmNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.match(location.pathname);
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-canvas shadow-md shadow-primary/10"
                        : "text-secondary hover:bg-input hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                       <span>{item.label}</span>
                    </div>
                    {isActive && <motion.div layoutId="sidebar-active" className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-soft">
            <div className="bg-input rounded-2xl p-4 flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-canvas border border-soft shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                     <UserCircle2 className="w-6 h-6 text-muted" />
                  </div>
                  <div className="overflow-hidden w-full">
                     <p className="text-sm font-semibold truncate text-primary">{user?.name || "Admin User"}</p>
                     <p className="text-[10px] uppercase tracking-wider text-muted font-bold truncate">{user?.role || "System Admin"}</p>
                  </div>
               </div>
               <button onClick={() => { clearAuth(); navigate("/"); }} className="w-full py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-secondary hover:text-danger hover:bg-danger/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
               </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-page">
          
          {/* Top Header */}
          <header className="h-20 shrink-0 flex items-center justify-between px-6 lg:px-10 bg-canvas/60 backdrop-blur-md border-b border-soft z-10 sticky top-0">
             <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-secondary hover:bg-input rounded-lg transition-colors" onClick={() => setMobileMenuOpen(true)}>
                   <Menu className="w-5 h-5" />
                </button>
                <div className="relative hidden md:block w-72 lg:w-96">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                     type="text"
                     placeholder="Search records, users, or products..."
                     className="w-full rounded-full bg-input py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:bg-canvas transition-all shadow-sm inset-shadow-sm"
                  />
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-canvas text-sm font-medium rounded-full shadow-sm hover:scale-105 transition-transform" onClick={() => navigate(user?.role === "admin" ? "/admin/products/create" : "/inventory")}>
                   <span className="text-lg leading-none">+</span> New Product
                </button>
                <div className="h-6 w-px bg-strong mx-1 hidden md:block" />
                <button className="p-2.5 text-secondary hover:text-primary hover:bg-input rounded-full transition-colors relative">
                   <Bell className="w-5 h-5" />
                   <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-canvas"></span>
                </button>
                <Link to="/" className="p-2.5 text-secondary hover:text-primary hover:bg-input rounded-full transition-colors" title="View Store">
                   <LayoutDashboard className="w-5 h-5" />
                </Link>
             </div>
          </header>

          <main className="flex-1 overflow-y-auto w-full p-6 lg:p-10">
             <div className="max-w-7xl mx-auto space-y-8">
                <Outlet />
             </div>
          </main>
        </div>
      </div>
    );
  }

  // Regular User Dashboard Layout (Non-CRM Shell)
  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-primary selection:bg-accent/20">
      <header className="flex items-center justify-between px-6 lg:px-10 py-5 bg-canvas border-b border-soft sticky top-0 z-40">
         <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-xl font-bold tracking-tight text-primary flex items-center gap-2">
               <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-canvas text-lg leading-none font-bold">B</span>
               </div>
               <span className="hidden sm:block">{brandName}</span>
            </Link>
         </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-secondary md:flex">
          <Link to="/" className="transition-colors hover:text-primary">Store</Link>
          <Link to="/products" className="transition-colors hover:text-primary">Collections</Link>
          <Link to="/returns" className="transition-colors hover:text-primary">Returns</Link>
        </nav>

        <div className="flex items-center gap-2 relative">
           <Link to="/dashboard" className="p-2 text-primary bg-input rounded-full hover:bg-soft transition-colors">
              <UserCircle2 className="h-5 w-5" />
           </Link>
           <Link to="/cart" className="p-2 text-secondary hover:text-primary hover:bg-input rounded-full transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
           </Link>
           <button
            type="button"
            onClick={() => {
              clearAuth();
              navigate("/");
            }}
            className="ml-4 hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-danger transition-colors border-l border-soft pl-4"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex-1 flex w-full max-w-[1440px] mx-auto px-6 py-10 gap-10">
         {/* User Account Sidebar */}
         <aside className="hidden md:flex w-64 flex-col gap-6 shrink-0">
            <div className="bg-canvas rounded-3xl p-6 border border-soft shadow-soft">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary text-canvas rounded-full flex items-center justify-center shadow-sm">
                     <span className="text-xl font-display font-medium">{user?.name?.charAt(0) || "U"}</span>
                  </div>
                  <div className="overflow-hidden">
                     <p className="font-semibold text-primary truncate">{user?.name || "Client"}</p>
                     <p className="text-xs text-muted truncate">{user?.email || "Account Holder"}</p>
                  </div>
               </div>
               
               <nav className="space-y-1.5">
                  <NavLink to="/dashboard" end className={({isActive}) => `flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary text-canvas shadow-sm' : 'text-secondary hover:bg-input hover:text-primary'}`}>
                     Overview
                  </NavLink>
                  <NavLink to="/my-orders" className={({isActive}) => `flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary text-canvas shadow-sm' : 'text-secondary hover:bg-input hover:text-primary'}`}>
                     Order History
                  </NavLink>
                  <NavLink to="/wishlist" className={({isActive}) => `flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary text-canvas shadow-sm' : 'text-secondary hover:bg-input hover:text-primary'}`}>
                     Saved Items
                  </NavLink>
                  <NavLink to="/addresses" className={({isActive}) => `flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary text-canvas shadow-sm' : 'text-secondary hover:bg-input hover:text-primary'}`}>
                     Addresses
                  </NavLink>
               </nav>
            </div>
         </aside>

         <main className="flex-1 w-full min-w-0 pb-20">
            <Outlet />
         </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
