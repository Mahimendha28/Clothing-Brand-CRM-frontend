import { startTransition, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Package, RefreshCw, HelpCircle, User, CreditCard, ShoppingBag } from "lucide-react";

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

const formatStatusLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const statusToneClass = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (["delivered", "paid", "refunded"].includes(normalized)) {
    return "border-success/20 bg-success/10 text-success";
  }

  if (["cancelled", "failed", "rejected"].includes(normalized)) {
    return "border-danger/20 bg-danger/10 text-danger";
  }

  if (["shipped", "confirmed", "packed", "approved", "received"].includes(normalized)) {
    return "border-accent/20 bg-accent/10 text-accent";
  }

  return "border-line bg-page text-secondary";
};

const statusPillClass =
  (value) => `inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusToneClass(value)}`;

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
<<<<<<< HEAD
    const totalOrders = orders.length;
    const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.order_status)).length;
    const deliveredOrders = orders.filter((order) => order.order_status === "delivered").length;
    const openReturns = returns.filter((entry) => !["refunded", "rejected"].includes(entry.refund_status)).length;

    return {
      totalOrders,
      activeOrders,
      deliveredOrders,
      openReturns
=======
    return {
      totalOrders: orders.length,
      paidOrders: orders.filter(o => o.payment_status === "paid").length,
      activeOrders: orders.filter(o => !["delivered", "cancelled"].includes(o.order_status)).length,
      deliveredOrders: orders.filter(o => o.order_status === "delivered").length,
      openReturns: returns.filter(r => !["refunded", "rejected"].includes(r.refund_status)).length
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
    };
  }, [orders, returns]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
<<<<<<< HEAD
  const recentReturns = useMemo(() => returns.slice(0, 5), [returns]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Customer Dashboard"
        title={`Welcome back, ${user?.name || "Customer"}`}
        description="Track orders and returns in a smaller, cleaner customer workspace."
        actions={
          <>
            <Link to="/products">
              <Button
                variant="secondary"
                className="ui-compact-button !min-w-[136px] !bg-white"
              >
                Browse Products
              </Button>
            </Link>
            <Link to="/my-orders">
              <Button className="ui-compact-button !min-w-[136px]">
                Open My Orders
              </Button>
            </Link>
          </>
        }
      />
=======

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
                    <Link to="/my-orders" className="luxury-button bg-[var(--color-accent)] text-white hover:bg-white hover:text-black">
                       Order History
                    </Link>
                    <Link to="/profile" className="luxury-button-outline border-white/20 text-white hover:border-white">
                       Identity Settings
                    </Link>
                 </div>
              </motion.div>
           </div>
        </section>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776

        {error && <StatusBanner tone="danger">{error}</StatusBanner>}

<<<<<<< HEAD
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="h-[320px] rounded-[24px] border border-soft bg-canvas shadow-sm" />
            <div className="h-[320px] rounded-[24px] border border-soft bg-canvas shadow-sm" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-[84px] rounded-[18px] border border-soft bg-canvas shadow-sm" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              compact
              label="Total Orders"
              value={String(dashboardMetrics.totalOrders)}
              note={`${dashboardMetrics.activeOrders} active`}
            />
            <MetricCard
              compact
              label="Active Orders"
              value={String(dashboardMetrics.activeOrders)}
              note="Still in progress"
            />
            <MetricCard
              compact
              label="Delivered"
              value={String(dashboardMetrics.deliveredOrders)}
              note="Completed"
            />
            <MetricCard
              compact
              label="Open Returns"
              value={String(dashboardMetrics.openReturns)}
              note={`Cart ${cart.item_count || 0} items`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <SurfaceCard className="space-y-4 !p-5 md:!p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Recent Orders</p>
                  <h2 className="mt-1 text-lg font-semibold leading-tight text-ink">Latest purchases</h2>
                  <p className="mt-2 text-sm text-secondary">A compact list of your recent orders.</p>
                </div>
                <Link to="/my-orders">
                  <Button variant="secondary" className="ui-compact-button !min-w-[96px]">
                    View All
                  </Button>
                </Link>
              </div>

              {recentOrders.length ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-[18px] border border-line bg-white p-4 transition-colors hover:bg-page/50"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/my-orders/${order.id}`} className="break-all text-sm font-semibold text-ink hover:underline">
                            {order.order_number}
                          </Link>
                          <p className="mt-1 text-sm text-secondary">Placed on {formatDate(order.created_at)}</p>
                        </div>
                        <p className="text-sm font-semibold text-ink">{formatCatalogPrice(order.total_amount)}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={statusPillClass(order.order_status)}>{formatStatusLabel(order.order_status)}</span>
                        <span className={statusPillClass(order.payment_status)}>{formatStatusLabel(order.payment_status)}</span>
                      </div>
                    </article>
                  ))}
                </div>
=======
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
                {/* QUICK ACTIONS BAR */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Link to="/my-orders" className="luxury-card p-8 group hover:bg-black transition-all duration-500">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="luxury-eyebrow group-hover:text-[var(--color-accent)]">Track Acquisitions</p>
                    <h4 className="text-xl font-luxury italic mt-2 group-hover:text-white">Order History</h4>
                 </div>
                 <Package className="w-8 h-8 text-gray-200 group-hover:text-[var(--color-accent)] transition-colors" />
              </div>
           </Link>
           <Link to="/wishlist" className="luxury-card p-8 group hover:bg-black transition-all duration-500">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="luxury-eyebrow group-hover:text-[var(--color-accent)]">Curated List</p>
                    <h4 className="text-xl font-luxury italic mt-2 group-hover:text-white">Saved Items</h4>
                 </div>
                 <ShoppingBag className="w-8 h-8 text-gray-200 group-hover:text-[var(--color-accent)] transition-colors" />
              </div>
           </Link>
           <Link to="/addresses" className="luxury-card p-8 group hover:bg-black transition-all duration-500">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="luxury-eyebrow group-hover:text-[var(--color-accent)]">Shipping Nodes</p>
                    <h4 className="text-xl font-luxury italic mt-2 group-hover:text-white">Address Book</h4>
                 </div>
                 <User className="w-8 h-8 text-gray-200 group-hover:text-[var(--color-accent)] transition-colors" />
              </div>
           </Link>
        </section>

</div>

        {/* MAIN DISPLAY */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-20">
           
           {/* ACQUISITION HISTORY */}
           <div className="xl:col-span-8 space-y-12">
              <div className="flex items-center justify-between pb-8 border-b border-black/5">
                 <div>
                    <h2 className="text-3xl luxury-heading italic">Order History</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Recent Acquisitions</p>
                 </div>
                 <Link to="/my-orders" className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] hover:underline">View All Orders</Link>
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
                                <span className={`text-[10px] font-black uppercase tracking-widest px-5 py-2 border ${order.order_status === 'delivered' ? 'border-green-100 text-green-700 bg-green-50/30' : order.order_status === 'cancelled' ? 'border-red-100 text-red-600 bg-red-50/30' : 'border-gray-200 text-black'}`}>
                                   {order.status || order.order_status}
                                </span>
                             </div>
                             <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-black group-hover:translate-x-2 transition-all" />
                          </div>
                       </Link>
                    ))}
                 </div>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
              ) : (
                 <div className="luxury-card p-32 text-center bg-white border-dashed border-2">
                    <EmptyState 
                       title="Archive is Silent" 
                       description="No acquisitions have been recorded in your maison history yet." 
                    />
                 </div>
              )}
           </div>

<<<<<<< HEAD
            <SurfaceCard className="space-y-4 !p-5 md:!p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Return Requests</p>
                  <h2 className="mt-1 text-lg font-semibold leading-tight text-ink">Recent returns</h2>
                  <p className="mt-2 text-sm text-secondary">A cleaner table view for return requests.</p>
                </div>
                <Link to="/returns">
                  <Button variant="secondary" className="ui-compact-button !min-w-[132px]">
                    Manage Returns
                  </Button>
                </Link>
=======
           {/* CONCIERGE & SUPPORT */}
           <div className="xl:col-span-4 space-y-12">
              <div className="pb-8 border-b border-black/5">
                 <h2 className="text-3xl luxury-heading italic">Concierge</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Member Support</p>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
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

<<<<<<< HEAD
              {recentReturns.length ? (
                <div className="overflow-x-auto rounded-[18px] border border-line">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-page">
                      <tr>
                        <th className="ui-table-head">Order</th>
                        <th className="ui-table-head">Submitted</th>
                        <th className="ui-table-head">Reason</th>
                        <th className="ui-table-head">Return</th>
                        <th className="ui-table-head">Refund</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReturns.map((entry) => (
                        <tr key={entry.id} className="border-b border-line last:border-b-0">
                          <td className="ui-table-cell font-medium text-ink">
                            {entry.order_id || entry.orderId ? (
                              <Link to={`/my-orders/${entry.order_id || entry.orderId}`} className="hover:underline">
                                {entry.order_number}
                              </Link>
                            ) : (
                              entry.order_number
                            )}
                          </td>
                          <td className="ui-table-cell text-secondary">{formatDate(entry.created_at)}</td>
                          <td className="ui-table-cell text-secondary">{entry.reason}</td>
                          <td className="ui-table-cell">
                            <span className={statusPillClass(entry.return_status)}>{formatStatusLabel(entry.return_status)}</span>
                          </td>
                          <td className="ui-table-cell">
                            <span className={statusPillClass(entry.refund_status)}>{formatStatusLabel(entry.refund_status)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No return requests"
                  description="When you submit return requests they will appear here."
                />
              )}
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-4 !p-5 md:!p-6">
            <p className="ui-eyebrow">Quick Actions</p>
            <h2 className="text-lg font-semibold leading-tight text-ink">Keep things moving</h2>
            <p className="text-[13px] leading-6 text-secondary">
              Shortcuts to the account pages you use most often.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/addresses">
                <Button variant="secondary" className="ui-compact-button w-full">
                  Manage Addresses
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="secondary" className="ui-compact-button w-full">
                  Open Wishlist
                </Button>
              </Link>
              <Link to="/notifications">
                <Button variant="secondary" className="ui-compact-button w-full">
                  Notifications
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="secondary" className="ui-compact-button w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </SurfaceCard>
        </>
      )}
=======
        </div>

      </div>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
    </div>
  );
}

export default UserDashboard;
