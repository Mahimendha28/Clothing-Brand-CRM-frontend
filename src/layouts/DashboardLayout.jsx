import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import useNotificationSummary from "../hooks/useNotificationSummary";
import {
  ArrowRight,
  BarChart3,
  Bell,
  ClipboardList,
  Home,
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
  X
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
    match: (pathname) => pathname === "/dashboard" || pathname.startsWith("/dashboard/"),
    roles: ["admin", "sales_executive", "marketing_manager", "inventory_manager", "fulfillment_executive"]
  },
  {
    label: "Inventory",
    to: "/inventory",
    icon: Package,
    match: (pathname) =>
      pathname === "/inventory" ||
      pathname.startsWith("/inventory/") ||
      pathname.startsWith("/admin/categories") ||
      pathname.startsWith("/admin/brands"),
    roles: ["admin", "inventory_manager"]
  },
  {
    label: "Products",
    to: "/admin/products",
    icon: ShoppingBag,
    match: (pathname) => pathname === "/admin/products" || pathname.startsWith("/admin/products/"),
    roles: ["admin"]
  },
  {
    label: "Orders",
    to: "/orders",
    icon: ClipboardList,
    match: (pathname) => pathname === "/orders" || pathname.startsWith("/orders/"),
    roles: ["admin", "sales_executive", "fulfillment_executive"]
  },
  {
    label: "Customers",
    to: "/customers",
    icon: Users,
    match: (pathname) =>
      pathname === "/customers" ||
      pathname.startsWith("/customers/"),
    roles: ["admin", "sales_executive", "marketing_manager"]
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: Users,
    match: (pathname) => pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
    roles: ["admin"]
  },
  {
    label: "Coupons",
    to: "/admin/coupons",
    icon: MessageSquare,
    match: (pathname) => pathname === "/admin/coupons",
    roles: ["admin", "marketing_manager", "sales_executive"]
  },
  {
    label: "Analytics",
    to: "/dashboard/sales",
    icon: BarChart3,
    match: (pathname) => pathname === "/dashboard/sales",
    roles: ["admin", "sales_executive", "marketing_manager"]
  },
  {
    label: "Returns",
    to: "/dashboard/returns",
    icon: ArrowRight,
    match: (pathname) => pathname === "/dashboard/returns",
    roles: ["admin", "sales_executive", "fulfillment_executive"]
  },
  {
    label: "Settings",
    to: "/settings",
    icon: SettingsIcon,
    match: (pathname) => pathname === "/settings",
    roles: ["admin"]
  },
  {
    label: "Workspace",
    to: "/analytics",
    icon: MessageSquare,
    match: (pathname) => pathname === "/analytics",
    roles: ["admin"]
  }
];

const customerNavItems = [
  {
    label: "Overview",
    to: "/dashboard",
    match: (pathname) => pathname === "/dashboard"
  },
  {
    label: "Profile",
    to: "/profile",
    match: (pathname) => pathname === "/profile"
  },
  {
    label: "Order History",
    to: "/my-orders",
    match: (pathname) => pathname === "/my-orders" || pathname.startsWith("/my-orders/")
  },
  {
    label: "Returns",
    to: "/returns",
    match: (pathname) => pathname === "/returns" || pathname.startsWith("/returns/")
  },
  {
    label: "Saved Items",
    to: "/wishlist",
    match: (pathname) => pathname === "/wishlist"
  },
  {
    label: "Addresses",
    to: "/addresses",
    match: (pathname) => pathname === "/addresses"
  }
];

const resolveCrmSearchTarget = (role, pathname) => {
  if (pathname.startsWith("/orders")) {
    return "/orders";
  }

  if (pathname.startsWith("/customers")) {
    return "/customers";
  }

  if (role === "sales_executive" || role === "fulfillment_executive") {
    return "/orders";
  }

  if (role === "marketing_manager") {
    return "/customers";
  }

  if (role === "admin") {
    return "/orders";
  }

  return "/dashboard";
};

function DashboardLayout() {
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useNotificationSummary(Boolean(user));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [crmSearchValue, setCrmSearchValue] = useState("");
  const notificationsPath = user?.role === "customer" ? "/notifications" : "/dashboard/notifications";
  const isCustomer = user?.role === "customer";
  const crmPrimaryAction =
    user?.role === "admin"
      ? { label: "New Product", path: "/admin/products/create" }
      : user?.role === "sales_executive"
        ? { label: "Open Orders", path: "/orders" }
        : user?.role === "marketing_manager"
          ? { label: "View Coupons", path: "/admin/coupons" }
          : user?.role === "inventory_manager"
            ? { label: "Inventory Desk", path: "/inventory" }
            : user?.role === "fulfillment_executive"
              ? { label: "Open Orders", path: "/orders" }
              : null;
  const crmSearchPlaceholder =
    user?.role === "sales_executive"
      ? "Search orders or customers..."
      : user?.role === "inventory_manager"
        ? "Search products or stock..."
        : user?.role === "marketing_manager"
          ? "Search coupons or customers..."
          : "Search records, users, or products...";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const useCrmShell =
    !isCustomer &&
    (
      user?.role === "admin" ||
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/dashboard") ||
      location.pathname.startsWith("/inventory") ||
      location.pathname.startsWith("/orders") ||
      location.pathname.startsWith("/customers") ||
      crmShellPaths.has(location.pathname)
    );

  const brandName = landingContent?.brand || "Badshah";
  const visibleCrmNavItems = crmNavItems.filter((item) => !item.roles || item.roles.includes(user?.role));
  const currentCrmTitle = useMemo(() => {
    if (location.pathname.startsWith("/admin/products/create")) {
      return "Create Product";
    }

    if (location.pathname.startsWith("/admin/categories/create")) {
      return "Create Category";
    }

    if (location.pathname.startsWith("/admin/brands/create")) {
      return "Create Brand";
    }

    if (location.pathname.startsWith("/inventory/adjustments/new")) {
      return "Record Stock";
    }

    if (location.pathname.includes("/edit")) {
      return "Edit Workspace";
    }

    if (location.pathname.startsWith("/orders/")) {
      return "Order Detail";
    }

    if (location.pathname.startsWith("/customers/")) {
      return "Customer Detail";
    }

    if (location.pathname.startsWith("/admin/products")) {
      return "Products";
    }

    const matched = visibleCrmNavItems.find((item) => item.match(location.pathname));
    return matched?.label || "Admin Workspace";
  }, [location.pathname, visibleCrmNavItems]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCrmSearchValue(params.get("q") || "");
  }, [location.search]);

  const handleCrmSearchSubmit = (event) => {
    event.preventDefault();
    const targetPath = resolveCrmSearchTarget(user?.role, location.pathname);
    const query = crmSearchValue.trim();

    navigate(query ? `${targetPath}?q=${encodeURIComponent(query)}` : targetPath);
  };

  if (useCrmShell) {
    return (
      <div className="min-h-screen bg-page text-primary selection:bg-accent/20">
        
        {/* Mobile menu overlay */}
        <AnimatePresence>
           {mobileMenuOpen && (
              <>
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-40 bg-primary/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                 <motion.aside initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{type:"spring", damping:25, stiffness:200}} className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-soft bg-canvas shadow-2xl lg:hidden">
                    <div className="flex items-center justify-between border-b border-soft px-5 py-5">
                       <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-primary">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
                             <span className="text-sm font-bold leading-none text-canvas">B</span>
                          </div>
                          <span>{brandName}</span>
                       </Link>
                       <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-secondary hover:text-primary">
                          <X className="h-5 w-5" />
                       </button>
                    </div>
                    {/* Reuse nav rendering below */}
                    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                      {visibleCrmNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.match(location.pathname);
                        return (
                          <NavLink key={item.label} to={item.to} onClick={()=>setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${isActive ? "bg-primary text-canvas shadow-sm" : "text-secondary hover:bg-input hover:text-primary"}`}>
                            <Icon className="h-4 w-4" />
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
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-soft bg-canvas lg:flex">
          <div className="px-5 py-5">
            <Link to="/" className="mb-1 flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-primary">
               <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm">
                  <span className="text-base font-bold leading-none text-canvas">B</span>
               </div>
               <span>{brandName}</span>
            </Link>
            <p className="ml-10 text-sm font-medium text-muted">Administration</p>
          </div>

          <nav className="mt-3 flex-1 overflow-y-auto px-4">
            <div className="space-y-1">
              {visibleCrmNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.match(location.pathname);
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-canvas shadow-md shadow-primary/10"
                        : "text-secondary hover:bg-input hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                       <span>{item.label}</span>
                    </div>
                    {isActive && <motion.div layoutId="sidebar-active" className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-soft p-4">
            <div className="rounded-[16px] border border-soft bg-page px-3 py-3 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-strong bg-white text-primary">
                     <UserCircle2 className="h-4 w-4 text-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                     <p className="truncate text-sm font-semibold text-primary">{user?.name || "Admin User"}</p>
                     <p className="truncate text-sm font-medium capitalize text-secondary">
                       {(user?.role || "System Admin").replace(/_/g, " ")}
                     </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center rounded-full p-2 text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
               </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-h-screen lg:pl-[248px]">
          
          {/* Top Header */}
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-soft bg-canvas/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
             <div className="flex min-w-0 items-center gap-4">
                <button className="rounded-lg p-2 text-secondary transition-colors hover:bg-input lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                   <Menu className="w-5 h-5" />
                </button>
                <div className="hidden min-w-0 xl:block">
                  <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">Admin Panel</p>
                  <h1 className="truncate text-lg font-semibold text-ink">{currentCrmTitle}</h1>
                </div>
                <form onSubmit={handleCrmSearchSubmit} className="hidden md:block w-72 lg:w-96">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                       type="search"
                       value={crmSearchValue}
                       onChange={(event) => setCrmSearchValue(event.target.value)}
                       placeholder={crmSearchPlaceholder}
                       className="w-full rounded-full bg-input py-2 pl-10 pr-4 text-sm text-primary placeholder:text-muted shadow-sm inset-shadow-sm transition-all focus:bg-canvas focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </form>
             </div>
             
             <div className="flex shrink-0 items-center gap-3">
                {crmPrimaryAction ? (
                  <button
                    className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-canvas shadow-sm transition-transform hover:scale-105 md:flex"
                    onClick={() => navigate(crmPrimaryAction.path)}
                  >
                    <span className="text-base leading-none">+</span> {crmPrimaryAction.label}
                  </button>
                ) : null}
                <div className="h-6 w-px bg-strong mx-1 hidden md:block" />
                <Link to={notificationsPath} className="relative rounded-full p-2.5 text-secondary transition-colors hover:bg-input hover:text-primary">
                   <Bell className="w-5 h-5" />
                   {unreadCount > 0 ? (
                     <span className="absolute -right-1 -top-0.5 min-w-[18px] rounded-full bg-danger px-1.5 text-center text-sm font-bold leading-[18px] text-canvas">
                       {unreadCount > 99 ? "99+" : unreadCount}
                     </span>
                   ) : null}
                </Link>
                <Link to="/" className="rounded-full p-2.5 text-secondary transition-colors hover:bg-input hover:text-primary" title="View Store">
                   <LayoutDashboard className="w-5 h-5" />
                </Link>
             </div>
          </header>

          <main className="w-full px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
             <div className="mx-auto w-full max-w-7xl space-y-6">
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
           <Link to="/dashboard" className="p-2 text-secondary hover:text-primary hover:bg-input rounded-full transition-colors md:hidden" title="Account">
              <Home className="h-5 w-5" />
           </Link>
           <Link to={notificationsPath} className="p-2 text-secondary hover:text-primary hover:bg-input rounded-full transition-colors relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-1 min-w-[18px] rounded-full bg-danger px-1.5 text-center text-[10px] font-bold leading-[18px] text-canvas">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
           </Link>
           <Link to="/dashboard" className="p-2 text-primary bg-input rounded-full hover:bg-soft transition-colors">
              <UserCircle2 className="h-5 w-5" />
           </Link>
           <Link to="/cart" className="p-2 text-secondary hover:text-primary hover:bg-input rounded-full transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
           </Link>
        </div>
      </header>

      <div className="flex-1 flex w-full max-w-[1440px] mx-auto px-6 py-8 md:py-10 gap-10">
         {/* User Account Sidebar */}
         <aside className="hidden md:flex w-72 flex-col gap-6 shrink-0">
            <div className="sticky top-28 bg-canvas rounded-3xl p-6 border border-soft shadow-soft">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary text-canvas rounded-full flex items-center justify-center shadow-md">
                     <span className="text-xl font-display font-medium">{user?.name?.charAt(0) || "U"}</span>
                  </div>
                  <div className="overflow-hidden">
                     <p className="font-semibold text-lg text-primary truncate leading-tight">{user?.name || "Client"}</p>
                     <p className="text-sm text-secondary truncate mt-0.5">{user?.email || "Account Holder"}</p>
                  </div>
               </div>
               
               <nav className="space-y-1.5">
                  {customerNavItems.map((item) => (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.to === "/dashboard"}
                      className={({ isActive }) =>
                        `flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                          isActive || item.match(location.pathname)
                            ? "bg-primary text-canvas shadow-sm"
                            : "text-secondary hover:bg-input hover:text-primary"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

               <div className="mt-6 rounded-2xl border border-soft bg-page p-4">
                 <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Need help?</p>
                 <p className="mt-2 text-sm leading-6 text-secondary">
                   Track orders, open returns, and manage your account details from one place.
                 </p>
               </div>

               <button
                 type="button"
                 onClick={handleLogout}
                 className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-soft bg-white px-4 py-3 text-sm font-medium text-secondary transition-colors hover:bg-danger/5 hover:text-danger"
               >
                 <LogOut className="h-4 w-4" />
                 Sign Out
               </button>
            </div>
         </aside>

         <main className="flex-1 w-full min-w-0 pb-20">
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2 md:hidden">
              {customerNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive || item.match(location.pathname)
                        ? "border-primary bg-primary text-canvas"
                        : "border-soft bg-canvas text-secondary hover:border-primary hover:text-primary"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="mb-6 md:hidden">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-soft bg-white px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:text-danger"
              >
                Sign Out
              </button>
            </div>
            <Outlet />
         </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
