import { startTransition, useEffect, useState } from "react";
import { ArrowLeft, CreditCard, MapPin, PackageCheck, TicketPercent } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { useToast } from "../context/ToastContext";
import { getUserAddresses } from "../services/authService";
import { getCart } from "../services/cartService";
import { buildCatalogImageUrl, formatCatalogPrice } from "../services/catalogService";
import { applyCheckoutCoupon, getCheckoutPricePreview } from "../services/checkoutService";
import { createOrder } from "../services/orderService";
import { createCheckoutSession, getCheckoutSessionStatus } from "../services/paymentService";
import { getStoredUser } from "../utils/auth";

const paymentMethods = [
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Place the order now and collect payment at the time of delivery."
  },
  {
    value: "stripe",
    label: "Online Payment (Stripe)",
    description: "Pay securely using UPI, QR, debit/credit card, or other Stripe-supported methods."
  }
];

const emptyCart = {
  item_count: 0,
  subtotal: 0,
  items: []
};

const emptyPreview = {
  payment_method: "cod",
  coupon: null,
  selected_address: null,
  selected_products: [],
  summary: {
    item_count: 0,
    subtotal: 0,
    shipping_fee: 0,
    tax_total: 0,
    discount_total: 0,
    total_before_discount: 0,
    total: 0
  }
};

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const [cart, setCart] = useState(emptyCart);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [preview, setPreview] = useState(emptyPreview);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [restoringCheckout, setRestoringCheckout] = useState(false);
  const { toastSuccess, toastError, toastInfo } = useToast();
  
  const prefilledCouponCode = new URLSearchParams(location.search).get("coupon")?.trim().toUpperCase() || "";
  const stripeSessionId = new URLSearchParams(location.search).get("session_id")?.trim() || "";
  const stripeReturnState = new URLSearchParams(location.search).get("stripe")?.trim() || "";

  useEffect(() => {
    let ignore = false;
    const processedSessions = window._processedStripeSessions || new Set();
    const handleStripeReturn = async () => {
       if (stripeReturnState === "success" && stripeSessionId) {
          if (processedSessions.has(stripeSessionId)) return;
          processedSessions.add(stripeSessionId);
          window._processedStripeSessions = processedSessions;

          try {
             setRestoringCheckout(true);
             const sessionStatus = await getCheckoutSessionStatus(stripeSessionId);
             if (sessionStatus.status === "complete" || sessionStatus.payment_status === "paid") {
                const orderRes = await createOrder({ 
                   addressId: sessionStatus.address_id || selectedAddressId, 
                   paymentMethod: "stripe", 
                   paymentIntentId: sessionStatus.payment_intent_id,
                   couponCode: sessionStatus.coupon_code || appliedCouponCode,
                   stripeSessionId: stripeSessionId
                });
                toastSuccess("Payment Successful! Order Confirmed.");
                navigate(`/my-orders/${orderRes.order.id}`, { replace: true });
             }
          } catch (err) {
             console.error("Verification error:", err);
             // Skip 409 errors as they usually mean the order was already handled by a previous attempt or webhook
             if (!err.message.includes("409")) {
                toastError("Payment verification failed: " + err.message);
             }
          } finally {
             setRestoringCheckout(false);
          }
       }
    };

    if (stripeReturnState === "success") {
       handleStripeReturn();
    } else {
       const loadCheckoutBase = async () => {
         if (!user?.id) { toastError("Session expired"); return; }
         try {
           setLoading(true);
           const [cartResponse, addressResponse] = await Promise.all([getCart(), getUserAddresses(user.id)]);
           if (ignore) return;
           const nextCart = cartResponse.cart || emptyCart;
           const nextAddresses = addressResponse.addresses || [];
           const preferredAddress = location.state?.preferredAddressId ? nextAddresses.find(a => String(a.id) === String(location.state.preferredAddressId)) : null;
           const defaultAddress = preferredAddress || nextAddresses.find(a => a.is_default) || nextAddresses[0] || null;
           startTransition(() => {
             setCart(nextCart);
             setAddresses(nextAddresses);
             setSelectedAddressId(defaultAddress ? String(defaultAddress.id) : "");
           });
         } catch (apiError) { toastError(apiError.message); } finally { if (!ignore) setLoading(false); }
       };
       loadCheckoutBase();
    }
    return () => { ignore = true; };
  }, [user?.id, stripeReturnState, stripeSessionId]);

  useEffect(() => {
    let ignore = false;
    const loadPreview = async () => {
      if (!cart.items.length) { setPreview(emptyPreview); return; }
      try {
        setPreviewLoading(true);
        const response = await getCheckoutPricePreview({ addressId: selectedAddressId, paymentMethod, couponCode: appliedCouponCode });
        if (!ignore) setPreview(response.preview || emptyPreview);
      } catch (apiError) { toastError(apiError.message); } finally { if (!ignore) setPreviewLoading(false); }
    };
    loadPreview();
    return () => { ignore = true; };
  }, [cart.items.length, paymentMethod, selectedAddressId, appliedCouponCode]);

  const handleApplyCoupon = async () => {
     if (!couponInput.trim()) return;
     try {
        setCouponLoading(true);
        const response = await applyCheckoutCoupon({ addressId: selectedAddressId, paymentMethod, couponCode: couponInput });
        setAppliedCouponCode(couponInput.toUpperCase());
        setPreview(response.preview || emptyPreview);
        toastSuccess("Coupon applied!");
     } catch (apiError) { toastError(apiError.message); } finally { setCouponLoading(false); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toastError("Select an address"); return; }
    try {
      setPlacingOrder(true);
      if (paymentMethod === "stripe") {
        const res = await createCheckoutSession({ addressId: selectedAddressId, couponCode: appliedCouponCode });
        if (res.checkout_url) window.location.assign(res.checkout_url);
        return;
      }
      const orderRes = await createOrder({ addressId: selectedAddressId, paymentMethod, couponCode: appliedCouponCode });
      toastSuccess("Order placed!");
      navigate(`/my-orders/${orderRes.order.id}`, { replace: true });
    } catch (apiError) { toastError(apiError.message); } finally { setPlacingOrder(false); }
  };

  if (loading) {
     return (
        <div className="shop-container py-20 flex flex-col items-center">
           <div className="w-10 h-10 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
           <p className="text-xs font-black uppercase tracking-widest text-gray-400">Securing Checkout...</p>
        </div>
     );
  }

  return (
<<<<<<< HEAD
    <div className="ui-page-wrap space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ui-eyebrow">Checkout</p>
          <h1 className="ui-hero-title">Complete your order.</h1>
          <p className="ui-hero-copy">
            Review selected products, apply a coupon if available, choose a delivery address, and finish with COD or secure online payment.
          </p>
=======
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="shop-container py-10">
        <div className="flex items-center gap-4 mb-10">
           <h1 className="text-2xl font-black uppercase tracking-tight">Checkout</h1>
           <div className="h-px flex-1 bg-gray-200" />
           <Link to="/cart" className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)]">Back to Bag</Link>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
        </div>

        {!cart.items.length ? (
          <EmptyState title="Empty Bag" description="Add items before checking out." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
            
            <div className="space-y-8">
               {/* ADDRESS SECTION */}
               <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-sm font-black uppercase tracking-widest">Select Address</h2>
                     <Link to="/addresses" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] px-3 py-1 border border-[var(--color-primary)] rounded hover:bg-[var(--color-primary)] hover:text-white transition-all">+ Add New</Link>
                  </div>
                  
                  <div className="space-y-4">
                     {addresses.map(addr => (
                        <label key={addr.id} className={`block p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddressId === String(addr.id) ? "border-[var(--color-primary)] bg-pink-50/10" : "border-gray-100 hover:border-gray-200"}`}>
                           <div className="flex gap-4">
                              <input type="radio" checked={selectedAddressId === String(addr.id)} onChange={() => setSelectedAddressId(String(addr.id))} className="mt-1 accent-[var(--color-primary)]" />
                              <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black text-sm uppercase">{addr.full_name}</span>
                                    <span className="text-[9px] font-black uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-500">{addr.address_type}</span>
                                 </div>
                                 <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                                    {addr.address_line_1}, {addr.city}, {addr.state} - {addr.postal_code}
                                 </p>
                                 <p className="text-[11px] text-gray-400 mt-2 font-bold">Mobile: <span className="text-gray-600">{addr.phone}</span></p>
                              </div>
                           </div>
                        </label>
                     ))}
                  </div>
               </section>

               {/* PAYMENT SECTION */}
               <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-6">Payment Method</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {paymentMethods.map(m => (
                        <label key={m.value} className={`block p-6 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === m.value ? "border-[var(--color-primary)] bg-pink-50/10" : "border-gray-100 hover:border-gray-200"}`}>
                           <div className="flex items-center gap-4">
                              <input type="radio" checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} className="accent-[var(--color-primary)]" />
                              <div>
                                 <p className="font-black text-xs uppercase tracking-tight">{m.label}</p>
                                 <p className="text-[10px] text-gray-400 font-medium mt-1">{m.description}</p>
                              </div>
                           </div>
                        </label>
                     ))}
                  </div>
               </section>

<<<<<<< HEAD
              {!addresses.length ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-line bg-page p-5">
                  <p className="font-medium text-ink">No saved addresses yet</p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    Add at least one address from address management before final checkout is connected.
                  </p>
                  <Link to="/addresses" state={checkoutAddressState} className="mt-4 inline-flex text-sm font-medium text-ink underline">
                    Open address management
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block cursor-pointer rounded-[24px] border p-5 transition ${selectedAddressId === String(address.id) ? "border-ink bg-page" : "border-line bg-white hover:bg-page"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === String(address.id)}
                          onChange={() => setSelectedAddressId(String(address.id))}
                          className="mt-1"
=======
               {/* PRODUCT REVIEW */}
               <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-6">Order Review ({preview.summary.item_count} Items)</h2>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                     {preview.selected_products.map(p => (
                        <div key={p.id} className="w-20 shrink-0">
                           <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                              <img src={buildCatalogImageUrl(p.hero_image)} className="w-full h-full object-cover" />
                           </div>
                           <p className="text-[9px] font-black mt-2 text-center uppercase tracking-tighter truncate">{p.product_name}</p>
                        </div>
                     ))}
                  </div>
               </section>
            </div>

            {/* SIDEBAR SUMMARY */}
            <aside className="space-y-6">
               <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 sticky top-28">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 border-b border-gray-50 pb-4">Order Summary</h3>
                  
                  {/* COUPON */}
                  <div className="mb-8">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Apply Coupon</p>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           value={couponInput} 
                           onChange={(e) => setCouponInput(e.target.value.toUpperCase())} 
                           placeholder="CODE"
                           className="flex-1 bg-gray-50 border border-gray-100 rounded px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-[var(--color-primary)]"
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
                        />
                        <button onClick={handleApplyCoupon} className="text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest px-4 border border-[var(--color-primary)] rounded">Apply</button>
                     </div>
                  </div>

                  <div className="space-y-4 text-sm font-medium">
                     <div className="flex justify-between">
                        <span className="text-gray-500">Order Subtotal</span>
                        <span>{formatCatalogPrice(preview.summary.subtotal)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">Coupon Discount</span>
                        <span className="text-[var(--status-success)]">-{formatCatalogPrice(preview.summary.discount_total)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">Shipping</span>
                        <span className="text-[var(--status-success)]">{preview.summary.shipping_fee > 0 ? formatCatalogPrice(preview.summary.shipping_fee) : 'FREE'}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">Estimated Tax</span>
                        <span>{formatCatalogPrice(preview.summary.tax_total)}</span>
                     </div>
                     
                     <div className="border-t border-gray-100 pt-6 mt-6 flex justify-between items-end">
                        <span className="text-sm font-black uppercase tracking-tight">Total Payable</span>
                        <span className="text-2xl font-black">{formatCatalogPrice(preview.summary.total)}</span>
                     </div>
                  </div>

<<<<<<< HEAD
              <div className="mt-6 grid gap-4">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`block cursor-pointer rounded-[24px] border p-5 transition ${paymentMethod === method.value ? "border-ink bg-page" : "border-line bg-white hover:bg-page"
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-lg font-semibold text-ink">{method.label}</p>
                        <p className="mt-2 text-sm leading-6 text-secondary">{method.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {paymentMethod === "stripe" ? (
                <div className="mt-6 rounded-[12px] bg-sky-50 p-4 text-xs text-sky-700">
                  You will be redirected to Stripe Checkout to complete payment securely using available methods (UPI/QR/card).
                </div>
              ) : null}
            </section>
          </div>

          <aside className="h-fit rounded-[32px] border border-soft bg-canvas p-6 shadow-sm">
            <p className="ui-eyebrow">Price Summary</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Checkout preview</h2>
            <p className="mt-4 text-sm leading-6 text-secondary">
              {previewLoading
                ? "Refreshing totals..."
                : "Server-side preview combines cart items, shipping rules, coupon discounts, and the selected payment method."}
            </p>

            <div className="mt-8 space-y-4 rounded-[24px] bg-white p-5">
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Items</span>
                <span className="font-semibold text-ink">{preview.summary.item_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">{formatCatalogPrice(preview.summary.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Shipping</span>
                <span className="font-semibold text-ink">{formatCatalogPrice(preview.summary.shipping_fee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Tax</span>
                <span className="font-semibold text-ink">{formatCatalogPrice(preview.summary.tax_total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Before discount</span>
                <span className="font-semibold text-ink">{formatCatalogPrice(preview.summary.total_before_discount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Coupon discount</span>
                <span className="font-semibold text-success">-{formatCatalogPrice(preview.summary.discount_total)}</span>
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Estimated total</p>
                <p className="mt-3 font-display text-5xl leading-none text-ink">{formatCatalogPrice(preview.summary.total)}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder || previewLoading || restoringCheckout || !selectedAddressId}
                className="w-full !rounded-[16px] !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em] disabled:opacity-60"
              >
                {placingOrder
                  ? paymentMethod === "stripe"
                    ? "Redirecting to Stripe..."
                    : "Placing COD order..."
                  : restoringCheckout
                    ? "Finalizing Stripe order..."
                    : paymentMethod === "stripe"
                      ? "Pay Online (UPI/Card)"
                      : "Place COD Order"}
              </Button>
              <Link to="/cart" className="block">
                <Button
                  variant="secondary"
                  className="w-full !rounded-[16px] !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  Return to Cart
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      )}
=======
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || !selectedAddressId}
                    className="btn-primary w-full py-5 rounded-md mt-10 shadow-lg shadow-pink-100"
                  >
                     {placingOrder ? "PROCESSING..." : paymentMethod === "stripe" ? "PAY NOW" : "FINISH ORDER"}
                  </button>

                  <div className="mt-10 pt-10 border-t border-gray-50 space-y-4 text-[10px] text-gray-400 font-bold text-center">
                     <p>🛡️ Secure Bank-grade Encryption</p>
                     <p>🚚 Guaranteed delivery within 3-5 days</p>
                  </div>
               </div>
            </aside>

          </div>
        )}
      </div>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
    </div>
  );
}

export default CheckoutPage;
