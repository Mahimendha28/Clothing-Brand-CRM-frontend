import { Bell, Heart, Home, LayoutGrid, LogOut, ShoppingBag, UserCircle2 } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { clearAuth, getStoredUser, isAuthenticated } from "../utils/auth";

const navItems = [
  { label: "Home", to: "/", icon: Home, end: true },
  { label: "Products", to: "/products", icon: LayoutGrid }
];

function StorefrontLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const loggedIn = isAuthenticated();
  const isCustomer = user?.role === "customer";
  const accountPath = loggedIn ? (isCustomer ? "/my-orders" : "/dashboard") : "/login";
  const accountLabel = loggedIn ? (isCustomer ? "My Orders" : "Dashboard") : "Sign In";

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="ui-shell min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-[#fcf8f3]/90 backdrop-blur-sm">
        <div className="ui-container flex items-center justify-between py-5">
          <Link to="/" className="font-display text-3xl font-semibold tracking-tight text-ink">
            Atelier House
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                      isActive ? "bg-white text-ink shadow-soft" : "text-secondary hover:text-ink"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/products"
              className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-line-strong hover:bg-white/80 sm:inline-flex"
            >
              Browse Store
            </Link>

            <Link
              to={accountPath}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm text-ink transition hover:bg-white"
            >
              <UserCircle2 className="h-4 w-4" />
              <span>{user?.name || accountLabel}</span>
            </Link>

            {loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm text-ink transition hover:bg-white"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : null}

            <Link
              to="/wishlist"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/80 text-ink transition hover:bg-white"
              aria-label="Open wishlist"
            >
              <Heart className="h-4 w-4" />
            </Link>

            <Link
              to="/notifications"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/80 text-ink transition hover:bg-white"
              aria-label="Open notifications"
            >
              <Bell className="h-4 w-4" />
            </Link>

            <Link
              to="/cart"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/80 text-ink transition hover:bg-white"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="ui-container py-12 md:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-[#efe8dd] px-5 py-14 md:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.1fr_0.9fr_0.9fr_1fr]">
          <div>
            <h3 className="font-display text-3xl italic text-ink">The Editorial Boutique</h3>
            <p className="mt-4 max-w-xs text-sm leading-7 text-secondary">
              Customer browsing, product storytelling, and the protected CRM now share one coherent visual language.
            </p>
          </div>

          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink">Store</p>
            <div className="space-y-3 text-sm text-secondary">
              <Link to="/" className="block hover:text-ink">
                Home
              </Link>
              <Link to="/products" className="block hover:text-ink">
                Product Listing
              </Link>
              <Link to="/cart" className="block hover:text-ink">
                Cart
              </Link>
              <Link to="/wishlist" className="block hover:text-ink">
                Wishlist
              </Link>
              <Link to="/returns" className="block hover:text-ink">
                Returns
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink">Account</p>
            <div className="space-y-3 text-sm text-secondary">
              <Link to={accountPath} className="block hover:text-ink">
                {accountLabel}
              </Link>
              {loggedIn ? (
                <Link to="/my-orders" className="block hover:text-ink">
                  Order History
                </Link>
              ) : null}
              {loggedIn ? (
                <Link to="/notifications" className="block hover:text-ink">
                  Notifications
                </Link>
              ) : null}
              {loggedIn ? (
                <button type="button" onClick={handleLogout} className="block hover:text-ink">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="block hover:text-ink">
                  Customer Login
                </Link>
              )}
            </div>
          </div>

          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink">Newsletter</p>
            <div className="flex items-center gap-3 rounded-full border border-line bg-white px-4 py-3">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <button className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">Join</button>
            </div>
            <p className="mt-4 text-[11px] leading-6 text-muted">
              Collections, client notes, and new arrivals from the atelier.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default StorefrontLayout;
