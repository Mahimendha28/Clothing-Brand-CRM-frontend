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
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      ignore = true;
    };
  }, []);

  const applyCartResponse = (response, fallbackMessage) => {
    startTransition(() => {
      setCart(response.cart || emptyCart);
    });
    toastSuccess(response.message || fallbackMessage || "Cart updated successfully");
  };

  const handleQuantityChange = async (item, nextQuantity) => {
    if (nextQuantity < 1) {
      return;
    }

    try {
      setPendingItemId(item.id);
      const response = await updateCartItem(item.id, {
        quantity: nextQuantity
      });
      applyCartResponse(response, "Quantity updated");
    } catch (apiError) {
      toastError(apiError.message || "Failed to update quantity");
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setPendingItemId(itemId);
      const response = await removeCartItem(itemId);
      applyCartResponse(response, "Item removed from cart");
    } catch (apiError) {
      toastError(apiError.message || "Failed to remove item");
    } finally {
      setPendingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearing(true);
      const response = await clearCart();
      applyCartResponse(response, "Cart cleared");
    } catch (apiError) {
      toastError(apiError.message || "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading your cart...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ui-eyebrow">Cart</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.92] text-ink">Your selected pieces.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary">
            Review your items, adjust quantities, remove anything you no longer need, and keep the running subtotal accurate.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink shadow-soft transition hover:bg-page"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      {!cart.items.length ? (
        <div className="space-y-6">
          <EmptyState
            title="Your cart is empty"
            description="Add a product from the listing or product detail page to start building the cart flow."
          />
          <Link to="/products">
            <Button className="!text-sm !font-medium !normal-case !tracking-[0.02em]">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {cart.items.map((item) => {
              const imageUrl = buildCatalogImageUrl(item.hero_image);
              const isBusy = pendingItemId === item.id;

              return (
                <article
                  key={item.id}
                  className="grid gap-5 rounded-[30px] border border-line bg-white p-5 shadow-soft md:grid-cols-[160px_1fr]"
                >
                  <div className="overflow-hidden rounded-[24px] bg-page">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.product_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full min-h-[180px] items-end bg-[radial-gradient(circle_at_top,#ffffff_0%,#efe6d9_42%,#ddcdb6_100%)] p-5">
                        <p className="font-display text-3xl leading-none text-ink">{item.product_name}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between gap-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
                          {item.category_name}
                        </p>
                        <Link to={`/products/${item.slug}`} className="mt-3 block font-display text-4xl leading-none text-ink">
                          {item.product_name}
                        </Link>
                        <p className="mt-3 text-sm text-secondary">{item.brand_name}</p>
                        <p className="mt-3 text-sm leading-6 text-secondary">
                          {item.variant
                            ? `Variant: ${item.variant.size} / ${item.variant.color}${item.variant.sku ? ` - SKU ${item.variant.sku}` : ""}`
                            : "Base product selection"}
                        </p>
                        {item.variant?.stock !== null && item.variant?.stock !== undefined ? (
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                            {item.variant.stock} in stock
                          </p>
                        ) : null}
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-secondary">Line Total</p>
                        <p className="mt-2 text-2xl font-semibold text-ink">{formatCatalogPrice(item.line_total)}</p>
                        <p className="mt-2 text-sm text-secondary">
                          {formatCatalogPrice(item.unit_price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="inline-flex items-center gap-3 rounded-full border border-line bg-page px-3 py-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          disabled={isBusy || item.quantity <= 1}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Decrease quantity for ${item.product_name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={isBusy}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Increase quantity for ${item.product_name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-[32px] border border-soft bg-canvas p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-soft">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="ui-eyebrow">Summary</p>
                <h2 className="mt-2 font-display text-3xl text-ink">Cart totals</h2>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-[24px] bg-white p-5">
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Total items</span>
                <span className="font-semibold text-ink">{cart.item_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">{formatCatalogPrice(cart.subtotal)}</span>
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Payable total</p>
                <p className="mt-3 font-display text-5xl leading-none text-ink">
                  {formatCatalogPrice(cart.subtotal)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link to="/checkout" className="block">
                <Button
                  className="w-full !rounded-[16px] !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  Proceed to Checkout
                </Button>
              </Link>
              <Link to="/products" className="block">
                <Button
                  variant="secondary"
                  className="w-full !rounded-[16px] !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  Add More Products
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearCart}
                disabled={clearing}
                className="w-full !rounded-[16px] !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                {clearing ? "Clearing..." : "Clear Cart"}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CartPage;
