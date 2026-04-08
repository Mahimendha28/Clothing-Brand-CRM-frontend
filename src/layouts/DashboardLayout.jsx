import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getStoredUser } from "../utils/auth";
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
  Users
} from "lucide-react";
import Button from "../components/common/Button";

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
    label: "Dashboard",
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
  const useCrmShell =
    user?.role === "admin" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/inventory") ||
    location.pathname.startsWith("/orders") ||
    location.pathname.startsWith("/customers") ||
    crmShellPaths.has(location.pathname);

  if (useCrmShell) {
    return (
      <div className="flex min-h-screen bg-page text-primary">
        <aside className="relative z-10 hidden w-[276px] flex-col border-r border-line bg-[#f8f5f0] lg:flex">
          <div className="px-8 pb-8 pt-10">
            <h1 className="font-display text-2xl font-semibold text-ink">Atelier CRM</h1>
            <p className="mt-1 text-xs tracking-wide text-secondary">System Administrator</p>
          </div>

          <nav className="mt-2 flex-1 px-4">
            <div className="space-y-2">
              {crmNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.match(location.pathname);

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={`flex items-center gap-4 rounded-[12px] px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-white font-semibold text-ink shadow-sm"
                        : "font-medium text-secondary hover:bg-white/60 hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="mt-auto border-t border-line p-6">
            <Button
              type="button"
              className="w-full !rounded-[8px] !bg-[#6d6c6a] !px-6 !py-3.5 !text-base !font-medium !normal-case !tracking-[0.02em] shadow-sm"
              onClick={() => navigate(user?.role === "admin" ? "/admin/products/create" : "/inventory")}
            >
              New Collection
            </Button>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white bg-line shadow-sm">
                  <div className="absolute inset-x-0 bottom-0 top-3 flex flex-col items-center bg-ink/20 pt-1">
                    <div className="h-4 w-4 rounded-full bg-ink/80"></div>
                  </div>
                </div>
                <div>
                  <p className="mt-0.5 text-xs font-bold text-ink">{user?.name || "Julian Vane"}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted">Chief Curator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearAuth();
                  navigate("/");
                }}
                className="text-muted transition-colors hover:text-ink"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col bg-[#fcf8f3]">
          <header className="flex items-center justify-between gap-6 px-10 py-6">
            <div className="relative w-full max-w-[660px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search orders, clients, or inventory..."
                className="w-full rounded-[14px] bg-[#f4f1eb] py-3 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#e2ddd5]"
              />
            </div>

            <div className="flex items-center gap-6 text-muted">
              <Link to="/dashboard/notifications" className="transition-colors hover:text-ink" title="Notifications">
                <Bell className="h-5 w-5" />
              </Link>
              <MessageSquare className="h-5 w-5 cursor-pointer transition-colors hover:text-ink" />
              <div className="h-6 w-px bg-line"></div>
              <UserCircle2 className="h-5 w-5 cursor-pointer transition-colors hover:text-ink" />
              <ShoppingBag className="h-5 w-5 cursor-pointer transition-colors hover:text-ink" />
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1200px] px-10 pb-16">
            <Outlet />

            <footer className="mt-24 flex flex-col justify-between gap-10 border-t border-line pt-12 md:flex-row">
              <div className="max-w-xs">
                <h4 className="font-display text-xl italic text-ink">The Editorial Boutique</h4>
                <p className="mt-3 text-xs leading-relaxed text-secondary">
                  &copy; 2024 The Editorial Boutique. Crafted for the Tactile Atelier.
                </p>
              </div>

              <div className="flex gap-16">
                <div>
                  <h5 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-ink">Internal</h5>
                  <ul className="space-y-3 text-xs text-secondary">
                    <li>
                      <Link to="/dashboard" className="hover:text-ink">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/inventory" className="hover:text-ink">
                        Inventory
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-ink">Legal</h5>
                  <ul className="space-y-3 text-xs text-secondary">
                    <li>
                      <Link to="/analytics" className="hover:text-ink">
                        Analytics
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="hover:text-ink">
                        Settings
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-ink">Support</h5>
                  <ul className="space-y-3 text-xs text-secondary">
                    <li>
                      <Link to="/customers" className="hover:text-ink">
                        Customers
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders" className="hover:text-ink">
                        Orders
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/returns" className="hover:text-ink">
                        Returns
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-primary">
      <header className="flex items-center justify-between px-8 py-8">
        <h1 className="cursor-pointer font-display text-2xl font-bold text-ink" onClick={() => navigate("/")}>
          The Editorial Boutique
        </h1>

        <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-secondary md:flex">
          <a href="/#collections" className="transition-colors hover:text-ink">
            Collections
          </a>
          <a href="/#atelier" className="transition-colors hover:text-ink">
            Atelier
          </a>
          <a href="/#archive" className="transition-colors hover:text-ink">
            Archive
          </a>
          <a href="/#journal" className="transition-colors hover:text-ink">
            Journal
          </a>
        </nav>

        <div className="flex items-center justify-end gap-5 text-secondary">
          <button
            type="button"
            onClick={() => {
              clearAuth();
              navigate("/");
            }}
            className="mr-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-ink"
          >
            Logout
          </button>
          <UserCircle2 className="h-5 w-5 cursor-pointer transition-colors hover:text-ink" />
          <ShoppingBag className="h-5 w-5 cursor-pointer transition-colors hover:text-ink" />
        </div>
      </header>

      <main className="mx-auto flex-1 w-full max-w-[1100px] px-8 pb-20 pt-10">
        <Outlet />
      </main>

      <footer className="bg-[#f0ece5] px-8 pb-12 pt-16">
        <div className="mx-auto flex max-w-[1100px] flex-col justify-between gap-16 md:flex-row">
          <div className="max-w-xs">
            <h4 className="mb-4 font-display text-2xl italic text-ink">The Editorial Boutique</h4>
            <p className="text-xs leading-relaxed text-secondary">
              Dedicated to the art of the tactile. Our boutique celebrates the physical essence of garment making.
            </p>
          </div>

          <div className="flex gap-20">
            <div>
              <h5 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-ink">Services</h5>
              <ul className="space-y-4 text-[11px] text-secondary">
                <li>
                  <Link to="/orders" className="hover:text-ink">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link to="/addresses" className="hover:text-ink">
                    Addresses
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="hover:text-ink">
                    Returns
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-ink">Company</h5>
              <ul className="space-y-4 text-[11px] text-secondary">
                <li>
                  <Link to="/profile" className="hover:text-ink">
                    Contact
                  </Link>
                </li>
                <li>
                  <a href="/#atelier" className="hover:text-ink">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/#journal" className="hover:text-ink">
                    Terms
                  </a>
                </li>
              </ul>
            </div>

            <div className="min-w-[280px]">
              <h5 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-ink">Newsletter</h5>
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full border-b border-[#d4cfc7] bg-transparent py-2 text-sm text-[#111] placeholder:text-muted focus:border-ink focus:outline-none"
                />
                <button className="border-b border-[#d4cfc7] py-2 pl-3 text-muted transition-colors hover:text-ink">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-8 text-[9px] text-[#a6a29c]">
                &copy; 2024 The Editorial Boutique. Crafted for the Tactile Atelier.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DashboardLayout;
