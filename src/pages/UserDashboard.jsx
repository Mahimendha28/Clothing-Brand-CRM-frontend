import { startTransition, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Package, RefreshCw, HelpCircle, User, CreditCard } from "lucide-react";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import { formatCatalogPrice } from "../services/catalogService";
import { getCart } from "../services/cartService";
import { getMyOrders } from "../services/orderService";
import { getReturns } from "../services/returnService";
import { getStoredUser } from "../utils/auth";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));

function UserDashboard() {
  const user = getStoredUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [cart, setCart] = useState({
    item_count: 0,
    subtotal: 0,
    items: []
  });

  useEffect(() => {
    let ignore = false;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const [ordersResponse, returnsResponse, cartResponse] = await Promise.all([
          getMyOrders(),
          getReturns(),
          getCart()
        ]);
        if (ignore) return;
        startTransition(() => {
          setOrders(ordersResponse.orders || []);
          setReturns(returnsResponse.returns || []);
          setCart(cartResponse.cart || { item_count: 0, subtotal: 0, items: [] });
        });
      } catch (apiError) {
        if (!ignore) setError(apiError.message || "Failed to load dashboard data");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadDashboard();
    return () => { ignore = true; };
  }, []);

  const dashboardMetrics = useMemo(() => {
    return {
      totalOrders: orders.length,
      paidOrders: orders.filter(o => o.payment_status === "paid").length,
      activeOrders: orders.filter(o => !["delivered", "cancelled"].includes(o.order_status)).length,
      deliveredOrders: orders.filter(o => o.order_status === "delivered").length,
      openReturns: returns.filter(r => !["refunded", "rejected"].includes(r.refund_status)).length
    };
  }, [orders, returns]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (loading) {
     return (
        <div className="min-h-screen bg-[var(--color-bg-page)] flex items-center justify-center">
           <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-gray-100 border-t-[var(--color-accent)] rounded-full animate-spin" />
              <span className="luxury-eyebrow text-gray-400">Synchronizing Identity</span>
           </div>
        </div>
     );
  }

  return (
    <div className="bg-[var(--color-bg-page)] selection:bg-[var(--color-accent)] selection:text-white pt-12 pb-40">
      <div className="luxury-container space-y-24">
        
        {/* LUXURY HERO HEADER */}
        <section className="relative overflow-hidden luxury-card bg-black text-white rounded-[3rem] p-12 lg:p-24 border-none">
           <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full text-[var(--color-accent)]" viewBox="0 0 100 100" fill="currentColor">
                 <path d="M0 100 L100 0 L100 100 Z" />
              </svg>
           </div>
           
           <div className="relative z-10 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                 <span className="luxury-eyebrow text-[var(--color-accent)] mb-8 inline-block">Maison Member Portal</span>
                 <h1 className="text-6xl md:text-8xl luxury-heading text-white italic lowercase mb-8">
                   Welcome Back, <br /><span className="not-italic uppercase font-sans font-black tracking-tighter">{user?.email?.split('@')[0] || "Client"}</span>
                 </h1>
                 <p className="text-white/50 text-base md:text-lg mb-12 max-w-md font-medium leading-relaxed">
                   Manage your bespoke acquisitions, track your style trajectory, and access restricted member benefits.
                 </p>
                 <div className="flex flex-wrap gap-6">
                    <Link to="/products" className="luxury-button bg-white text-black hover:bg-[var(--color-accent)] hover:text-white">
                       Explore Archive
                    </Link>
                    <Link to="/profile" className="luxury-button-outline border-white/20 text-white hover:border-white">
                       Identity Settings
                    </Link>
                 </div>
              </motion.div>
           </div>
        </section>

        {error && <StatusBanner tone="danger">{error}</StatusBanner>}

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
           <div className="luxury-card p-10 space-y-4">
              <Package className="w-6 h-6 text-gray-400 mb-4" />
              <p className="luxury-eyebrow text-gray-400">Archived Orders</p>
              <h3 className="text-4xl font-luxury italic">{dashboardMetrics.totalOrders}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">{dashboardMetrics.activeOrders} In Stream</p>
           </div>
           <div className="luxury-card p-10 space-y-4">
              <RefreshCw className="w-6 h-6 text-gray-400 mb-4" />
              <p className="luxury-eyebrow text-gray-400">Style Swaps</p>
              <h3 className="text-4xl font-luxury italic">{dashboardMetrics.openReturns}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Active resolution</p>
           </div>
           <div className="luxury-card p-10 space-y-4">
              <CreditCard className="w-6 h-6 text-gray-400 mb-4" />
              <p className="luxury-eyebrow text-gray-400">Paid Drops</p>
              <h3 className="text-4xl font-luxury italic">{dashboardMetrics.paidOrders}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Financialized</p>
           </div>
           <div className="luxury-card p-10 bg-[var(--color-bg-dark)] text-white border-none space-y-4">
              <div className="w-6 h-6 text-[var(--color-accent)] mb-4" />
              <p className="luxury-eyebrow text-[var(--color-accent)]">Reserved Bag</p>
              <h3 className="text-4xl font-luxury italic">{formatCatalogPrice(cart.subtotal || 0)}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{cart.item_count || 0} Pieces secured</p>
           </div>
        </div>

        {/* MAIN DISPLAY */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-20">
           
           {/* ACQUISITION HISTORY */}
           <div className="xl:col-span-8 space-y-12">
              <div className="flex items-center justify-between pb-8 border-b border-black/5">
                 <div>
                    <h2 className="text-3xl luxury-heading italic">Acquisition History</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Historical Stream</p>
                 </div>
                 <Link to="/my-orders" className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] hover:underline">Full Archive</Link>
              </div>

              {recentOrders.length ? (
                 <div className="space-y-6">
                    {recentOrders.map((order) => (
                       <Link 
                         key={order.id} 
                         to={`/my-orders/${order.id}`}
                         className="luxury-card p-8 flex flex-col md:flex-row items-center justify-between group bg-white hover:bg-black/5 transition-all"
                       >
                          <div className="flex items-center gap-10 w-full md:w-auto">
                             <div className="w-16 h-16 bg-gray-50 flex items-center justify-center font-luxury italic text-xl group-hover:bg-black group-hover:text-white transition-all">
                                ID
                             </div>
                             <div>
                                <p className="text-xs font-black uppercase tracking-widest text-black mb-1">{order.order_number}</p>
                                <p className="text-[11px] text-gray-400 font-medium italic">{formatDate(order.created_at)}</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end mt-8 md:mt-0">
                             <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-1">Impact</p>
                                <p className="text-base font-black italic">{formatCatalogPrice(order.total_amount)}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-1">Status</p>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-5 py-2 border ${order.order_status === 'delivered' ? 'border-green-100 text-green-700 bg-green-50/30' : 'border-gray-200 text-black'}`}>
                                   {order.order_status}
                                </span>
                             </div>
                             <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-black group-hover:translate-x-2 transition-all" />
                          </div>
                       </Link>
                    ))}
                 </div>
              ) : (
                 <div className="luxury-card p-32 text-center bg-white border-dashed border-2">
                    <EmptyState 
                       title="Archive is Silent" 
                       description="No acquisitions have been recorded in your maison history yet." 
                    />
                 </div>
              )}
           </div>

           {/* CONCIERGE & SUPPORT */}
           <div className="xl:col-span-4 space-y-12">
              <div className="pb-8 border-b border-black/5">
                 <h2 className="text-3xl luxury-heading italic">Concierge</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Member Support</p>
              </div>
              
              <div className="space-y-10">
                 <div className="luxury-card p-10 space-y-6">
                    <div className="flex items-center gap-4 text-black">
                       <RefreshCw className="w-5 h-5" />
                       <h4 className="text-[11px] font-black uppercase tracking-widest">Atelier Returns</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Not satisfied with your fit? Initiate a refined style resolution through our specialist portal.</p>
                    <Link to="/returns" className="luxury-button w-full text-center py-4 bg-black text-white hover:bg-[var(--color-accent)]">Returns Portal</Link>
                 </div>
                 
                 <div className="luxury-card p-10 space-y-6">
                    <div className="flex items-center gap-4 text-black">
                       <HelpCircle className="w-5 h-5" />
                       <h4 className="text-[11px] font-black uppercase tracking-widest">Knowledge Stream</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Access our FAQs and policy archives for immediate clarification.</p>
                    <Link to="/faq" className="inline-block text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] hover:underline">Browse Archives</Link>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}

export default UserDashboard;
