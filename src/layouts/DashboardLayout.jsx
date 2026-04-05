import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getStoredUser } from "../utils/auth";
import {
  LayoutDashboard,
  Users,
  UserCircle2,
  Shapes,
  Tags,
  Package,
  LogOut,
  Search,
  Bell,
  MessageSquare,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import Button from "../components/common/Button";

function DashboardLayout() {
  const user = getStoredUser();
  const navigate = useNavigate();

  if (user?.role === "admin") {
    // ADMIN LAYOUT
    return (
      <div className="flex min-h-screen bg-page text-primary">
        <aside className="w-[280px] flex-col border-r border-line bg-[#f8f5f0] flex relative z-10 hidden lg:flex">
          <div className="px-8 pt-10 pb-8">
            <h1 className="font-display text-2xl font-semibold text-ink">Atelier CRM</h1>
            <p className="text-xs text-secondary mt-1 tracking-wide">System Administrator</p>
          </div>

          <nav className="mt-2 flex-1 px-4 space-y-1">
            <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-4 rounded-[12px] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-white shadow-sm text-ink font-semibold' : 'text-secondary hover:bg-white/50 hover:text-ink'}`}>
               <LayoutDashboard className="w-4 h-4" /> Dashboard
            </NavLink>
            <NavLink to="/admin/products" className={({isActive}) => `flex items-center gap-4 rounded-[12px] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-white shadow-sm text-ink font-semibold' : 'text-secondary hover:bg-white/50 hover:text-ink'}`}>
               <Package className="w-4 h-4" /> Products
            </NavLink>
            <NavLink to="/admin/categories" className={({isActive}) => `flex items-center gap-4 rounded-[12px] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-white shadow-sm text-ink font-semibold' : 'text-secondary hover:bg-white/50 hover:text-ink'}`}>
               <Shapes className="w-4 h-4" /> Categories
            </NavLink>
            <NavLink to="/admin/brands" className={({isActive}) => `flex items-center gap-4 rounded-[12px] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-white shadow-sm text-ink font-semibold' : 'text-secondary hover:bg-white/50 hover:text-ink'}`}>
               <Tags className="w-4 h-4" /> Brands
            </NavLink>
            <NavLink to="/admin/users" className={({isActive}) => `flex items-center gap-4 rounded-[12px] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-white shadow-sm text-ink font-semibold' : 'text-secondary hover:bg-white/50 hover:text-ink'}`}>
               <Users className="w-4 h-4" /> Customers
            </NavLink>
          </nav>

          <div className="p-6">
            <Button variant="primary" className="w-full !bg-[#6D6C6A] shadow-sm mb-6">
              New Collection
            </Button>
            
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-line relative shadow-sm border border-white">
                  <div className="absolute inset-x-0 bottom-0 top-3 bg-ink/20 flex flex-col items-center pt-1"><div className="w-4 h-4 rounded-full bg-ink/80"></div></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-ink mt-0.5">{user?.name || "Julian Vane"}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted">Chief Curator</p>
                </div>
              </div>
              <button onClick={() => { clearAuth(); navigate("/"); }} className="text-muted hover:text-ink transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-[#fcf8f3]">
          {/* Admin Topbar */}
          <header className="px-10 py-6 flex items-center justify-between">
             <div className="relative w-full max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="text" placeholder="Search orders, clients, or inventory..." className="w-full bg-[#f4f1eb] text-sm text-ink placeholder:text-muted rounded-full pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e2ddd5]" />
             </div>
             <div className="flex items-center gap-6 text-muted">
                <Bell className="w-5 h-5 hover:text-ink cursor-pointer transition-colors" />
                <MessageSquare className="w-5 h-5 hover:text-ink cursor-pointer transition-colors" />
                <div className="w-px h-6 bg-line"></div>
                <UserCircle2 className="w-5 h-5 hover:text-ink cursor-pointer transition-colors" />
                <ShoppingBag className="w-5 h-5 hover:text-ink cursor-pointer transition-colors" />
             </div>
          </header>
          
          <div className="max-w-[1200px] w-full mx-auto px-10 pb-16">
            <Outlet />

            {/* Admin Footer */}
            <footer className="mt-24 border-t border-line pt-12 flex flex-col md:flex-row justify-between gap-10">
               <div className="max-w-xs">
                 <h4 className="font-display text-xl text-ink italic mb-3">The Editorial Boutique</h4>
                 <p className="text-xs text-secondary leading-relaxed">© 2024 The Editorial Boutique. Crafted for the Tactile Atelier.</p>
               </div>
               <div className="flex gap-16 grid-cols-3">
                 <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-widest text-ink mb-4">Internal</h5>
                    <ul className="space-y-3 text-xs text-secondary">
                      <li><Link to="/dashboard" className="hover:text-ink">Dashboard</Link></li>
                      <li><Link to="/sustainability" className="hover:text-ink underline decoration-line underline-offset-4">Sustainability</Link></li>
                    </ul>
                 </div>
                 <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-widest text-ink mb-4">Legal</h5>
                    <ul className="space-y-3 text-xs text-secondary">
                      <li><Link to="/privacy" className="hover:text-ink">Privacy</Link></li>
                      <li><Link to="/terms" className="hover:text-ink">Terms</Link></li>
                    </ul>
                 </div>
                 <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-widest text-ink mb-4">Support</h5>
                    <ul className="space-y-3 text-xs text-secondary">
                      <li><Link to="/contact" className="hover:text-ink">Contact</Link></li>
                      <li><Link to="/shipping" className="hover:text-ink">Shipping</Link></li>
                    </ul>
                 </div>
               </div>
            </footer>
          </div>
        </main>
      </div>
    );
  }

  // USER LAYOUT
  return (
    <div className="min-h-screen flex flex-col bg-page text-primary font-sans">
      {/* User Topbar */}
      <header className="px-8 py-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink cursor-pointer" onClick={() => navigate("/")}>The Editorial Boutique</h1>
        
        <nav className="text-xs font-bold uppercase tracking-[0.2em] text-secondary hidden md:flex items-center gap-8">
          <Link to="/collections" className="hover:text-ink transition-colors">Collections</Link>
          <Link to="/atelier" className="hover:text-ink transition-colors">Atelier</Link>
          <Link to="/archive" className="hover:text-ink transition-colors">Archive</Link>
          <Link to="/journal" className="hover:text-ink transition-colors">Journal</Link>
        </nav>

        <div className="flex items-center justify-end gap-5 text-secondary">
           <button onClick={() => {clearAuth(); navigate("/");}} className="text-[10px] font-bold uppercase tracking-widest hover:text-ink transition-colors mr-2">Logout</button>
           <UserCircle2 className="w-5 h-5 hover:text-ink cursor-pointer transition-colors" />
           <ShoppingBag className="w-5 h-5 hover:text-ink cursor-pointer transition-colors" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-8 pt-10 pb-20">
        <Outlet />
      </main>

      {/* User Footer */}
      <footer className="bg-[#f0ece5] pt-16 pb-12 px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between gap-16">
          <div className="max-w-xs">
            <h4 className="font-display text-2xl text-ink italic mb-4">The Editorial Boutique</h4>
            <p className="text-xs text-secondary leading-relaxed">Dedicated to the art of the tactile. Our boutique celebrates the physical essence of garment making.</p>
          </div>
          
          <div className="flex gap-20">
            <div>
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-ink mb-6">Services</h5>
              <ul className="space-y-4 text-[11px] text-secondary">
                <li><Link to="/sustainability" className="hover:text-ink">Sustainability</Link></li>
                <li><Link to="/shipping" className="hover:text-ink">Shipping</Link></li>
                <li><Link to="/returns" className="hover:text-ink">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-ink mb-6">Company</h5>
              <ul className="space-y-4 text-[11px] text-secondary">
                <li><Link to="/contact" className="hover:text-ink">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-ink">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-ink">Terms</Link></li>
              </ul>
            </div>
            <div className="min-w-[280px]">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-ink mb-6">Newsletter</h5>
              <div className="flex items-center">
                <input type="email" placeholder="Email address" className="w-full bg-transparent border-b border-[#d4cfc7] text-[#111] placeholder:text-muted py-2 text-sm focus:outline-none focus:border-ink" />
                <button className="border-b border-[#d4cfc7] py-2 pl-3 hover:text-ink text-muted transition-colors"><ArrowRight className="w-4 h-4" /></button>
              </div>
              <p className="text-[9px] text-[#A6A29C] mt-8">© 2024 The Editorial Boutique. Crafted for the Tactile Atelier.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DashboardLayout;
