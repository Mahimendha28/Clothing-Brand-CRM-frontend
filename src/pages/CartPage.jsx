import { startTransition, useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { useToast } from "../context/ToastContext";
import { buildCatalogImageUrl, formatCatalogPrice } from "../services/catalogService";
import { clearCart, getCart, removeCartItem, updateCartItem } from "../services/cartService";

const emptyCart = {
  id: null,
  item_count: 0,
  subtotal: 0,
  items: []
};

function CartPage() {
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(true);
  const [pendingItemId, setPendingItemId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const { toastSuccess, toastError } = useToast();

  useEffect(() => {
    let ignore = false;
    const loadCart = async () => {
      try {
        setLoading(true);
        const response = await getCart();
        if (!ignore) {
          startTransition(() => {
            setCart(response.cart || emptyCart);
          });
        }
      } catch (apiError) {
        if (!ignore) {
          toastError(apiError.message || "Failed to load your cart");
          setCart(emptyCart);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadCart();
    return () => { ignore = true; };
  }, []);

  const applyCartResponse = (response, fallbackMessage) => {
    startTransition(() => {
      setCart(response.cart || emptyCart);
    });
    toastSuccess(response.message || fallbackMessage || "Cart updated successfully");
  };

  const handleQuantityChange = async (item, nextQuantity) => {
    if (nextQuantity < 1) return;
    try {
      setPendingItemId(item.id);
      const response = await updateCartItem(item.id, { quantity: nextQuantity });
      applyCartResponse(response, "Quantity updated");
    } catch (apiError) { toastError(apiError.message); } finally { setPendingItemId(null); }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setPendingItemId(itemId);
      const response = await removeCartItem(itemId);
      applyCartResponse(response, "Item removed");
    } catch (apiError) { toastError(apiError.message); } finally { setPendingItemId(null); }
  };

  const handleClearCart = async () => {
    try {
      setClearing(true);
      const response = await clearCart();
      applyCartResponse(response, "Cart cleared");
    } catch (apiError) { toastError(apiError.message); } finally { setClearing(false); }
  };

  if (loading) {
    return (
       <div className="shop-container py-20 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Reviewing Bag...</p>
       </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="shop-container py-10">
        <div className="flex items-center gap-4 mb-12">
           <h1 className="text-2xl font-black uppercase tracking-tight">Shopping Bag</h1>
           <div className="h-px flex-1 bg-gray-100" />
           <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{cart.item_count} Items</span>
        </div>

        {!cart.items.length ? (
          <div className="max-w-xl mx-auto py-20 text-center space-y-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
               <ShoppingBag className="w-10 h-10 text-gray-200" />
            </div>
            <div className="space-y-2">
               <h2 className="text-xl font-black uppercase tracking-tight">Your bag is empty</h2>
               <p className="text-sm text-gray-400 font-medium tracking-wide">Looks like you haven't added anything to your bag yet.</p>
            </div>
            <Link to="/products" className="btn-primary inline-block">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
            
            {/* ITEM LIST */}
            <div className="space-y-6">
               <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Product Details</h3>
                  <button onClick={handleClearCart} className="text-[var(--status-error)] text-[10px] font-black uppercase tracking-widest hover:underline">Clear Bag</button>
               </div>
               
               {cart.items.map((item) => (
                  <article key={item.id} className="flex gap-6 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors bg-white shadow-sm">
                     <div className="w-32 aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <img src={buildCatalogImageUrl(item.hero_image)} alt={item.product_name} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                           <div className="flex justify-between items-start">
                              <h4 className="font-black text-sm uppercase tracking-tight line-clamp-1">{item.brand_name || 'BADSHAH'}</h4>
                              <button onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-[var(--status-error)] transition-colors"><Trash2 className="w-4 h-4" /></button>
                           </div>
                           <p className="text-sm font-medium text-gray-500 line-clamp-1">{item.product_name}</p>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-2 bg-gray-50 inline-block px-2 py-1 rounded">
                              {item.variant ? `${item.variant.size} / ${item.variant.color}` : "Standard Size"}
                           </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                           <div className="flex items-center gap-4 bg-gray-50 rounded-md px-2 py-1 border border-gray-100">
                              <button 
                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                disabled={item.quantity <= 1 || pendingItemId === item.id}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black disabled:opacity-30"
                              ><Minus className="w-3 h-3" /></button>
                              <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                disabled={pendingItemId === item.id}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black"
                              ><Plus className="w-3 h-3" /></button>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black">{formatCatalogPrice(item.line_total)}</p>
                              {item.quantity > 1 && <p className="text-[10px] text-gray-400 font-bold">{formatCatalogPrice(item.unit_price)} each</p>}
                           </div>
                        </div>
                     </div>
                  </article>
               ))}
            </div>

            {/* ORDER SUMMARY */}
            <aside className="sticky top-28 space-y-6">
               <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Price Details ({cart.item_count} Items)</h3>
                  
                  <div className="space-y-4 text-sm font-medium">
                     <div className="flex justify-between">
                        <span className="text-gray-500">Total MRP</span>
                        <span>{formatCatalogPrice(cart.subtotal)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">Discount</span>
                        <span className="text-[var(--status-success)]">-₹0</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">Shipping Fee</span>
                        <span className="text-[var(--status-success)]">FREE</span>
                     </div>
                     
                     <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-end">
                        <div className="space-y-1">
                           <span className="text-sm font-black uppercase tracking-tight">Total Amount</span>
                        </div>
                        <span className="text-2xl font-black">{formatCatalogPrice(cart.subtotal)}</span>
                     </div>
                  </div>

                  <Link to="/checkout" className="block mt-10">
                    <button className="btn-primary w-full py-4 rounded-md">Place Order</button>
                  </Link>

                  <div className="mt-8 space-y-4">
                     <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <img src="https://constant.myntassets.com/checkout/assets/img/ship-free.webp" className="h-6" alt="Shipping" />
                        <span>Fast Delivery within 3 days</span>
                     </div>
                     <p className="text-[10px] leading-relaxed text-gray-400 font-medium italic">Safe and secure payments. 30 days return and exchange policy. No questions asked.</p>
                  </div>
               </div>

               <div className="flex items-center gap-4 bg-[var(--color-bg-surface)] p-4 rounded-xl border border-dashed border-gray-300">
                  <span className="text-xl">🎟️</span>
                  <div className="flex-1">
                     <h4 className="text-[10px] font-black uppercase">Have a Coupon?</h4>
                     <p className="text-[9px] text-gray-400 font-medium">Apply at checkout for extra savings.</p>
                  </div>
               </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
