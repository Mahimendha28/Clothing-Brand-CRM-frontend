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

  const checkoutAddressState = {
    fromCheckout: true,
    returnTo: "/checkout"
  };

  useEffect(() => {
    let ignore = false;

    const loadCheckoutBase = async () => {
      if (!user?.id) {
        toastError("Customer session unavailable");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [cartResponse, addressResponse] = await Promise.all([getCart(), getUserAddresses(user.id)]);

        if (ignore) {
          return;
        }

        const nextCart = cartResponse.cart || emptyCart;
        const nextAddresses = addressResponse.addresses || [];
        const preferredAddress = location.state?.preferredAddressId
          ? nextAddresses.find((address) => String(address.id) === String(location.state.preferredAddressId))
          : null;
        const defaultAddress = preferredAddress || nextAddresses.find((address) => address.is_default) || nextAddresses[0] || null;

        startTransition(() => {
          setCart(nextCart);
          setAddresses(nextAddresses);
          setSelectedAddressId(defaultAddress ? String(defaultAddress.id) : "");
        });
      } catch (apiError) {
        if (!ignore) {
          toastError(apiError.message || "Failed to load checkout details");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadCheckoutBase();

    return () => {
      ignore = true;
    };
  }, [location.state?.preferredAddressId, user?.id]);

  useEffect(() => {
    let ignore = false;

    const loadPreview = async () => {
      if (!cart.items.length) {
        startTransition(() => {
          setPreview(emptyPreview);
        });
        return;
      }

      try {
        setPreviewLoading(true);
        const response = await getCheckoutPricePreview({
          addressId: selectedAddressId,
          paymentMethod,
          couponCode: appliedCouponCode
        });

        if (!ignore) {
          startTransition(() => {
            setPreview(response.preview || emptyPreview);
          });
        }
      } catch (apiError) {
        if (!ignore) {
          toastError(apiError.message || "Failed to generate checkout preview");
        }
      } finally {
        if (!ignore) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      ignore = true;
    };
  }, [cart.items.length, paymentMethod, selectedAddressId, appliedCouponCode]);

  const applyCouponByCode = async (couponCode) => {
    const normalizedCode = couponCode.trim();

    if (!normalizedCode) {
      toastError("Enter a coupon code before applying it");
      return false;
    }

    try {
      setCouponLoading(true);
      const response = await applyCheckoutCoupon({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: normalizedCode
      });

      startTransition(() => {
        setAppliedCouponCode(response.preview?.coupon?.code || normalizedCode.toUpperCase());
        setCouponInput(response.preview?.coupon?.code || normalizedCode.toUpperCase());
        setPreview(response.preview || emptyPreview);
      });
      toastSuccess(response.message || "Coupon applied successfully");
      return true;
    } catch (apiError) {
      toastError(apiError.message || "Failed to apply coupon");
      return false;
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    await applyCouponByCode(couponInput);
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode("");
    setCouponInput("");
    toastInfo("Coupon removed from checkout");
  };

  useEffect(() => {
    if (!prefilledCouponCode || !cart.items.length || appliedCouponCode === prefilledCouponCode || couponLoading) {
      return;
    }

    setCouponInput(prefilledCouponCode);
    void applyCouponByCode(prefilledCouponCode);
  }, [prefilledCouponCode, cart.items.length, appliedCouponCode, couponLoading, paymentMethod, selectedAddressId]);

  useEffect(() => {
    let ignore = false;

    const finalizeStripeCheckout = async () => {
      if (stripeReturnState !== "success" || !stripeSessionId) {
        if (stripeReturnState === "cancel" && !ignore) {
          toastInfo("Stripe checkout was canceled. You can try again.");
        }
        return;
      }

      try {
        setRestoringCheckout(true);
        toastInfo("Verifying Stripe payment and creating your order...");
        const sessionResponse = await getCheckoutSessionStatus(stripeSessionId);

        if (sessionResponse.payment_status !== "paid" || !sessionResponse.payment_intent_id) {
          throw new Error("Stripe session is not paid yet");
        }

        const orderResponse = await createOrder({
          addressId: sessionResponse.address_id || selectedAddressId,
          paymentMethod: "stripe",
          couponCode: sessionResponse.coupon_code || appliedCouponCode,
          paymentIntentId: sessionResponse.payment_intent_id
        });

        if (!ignore && orderResponse.order?.id) {
          toastSuccess("Payment successful. Order created.");
          navigate(`/my-orders/${orderResponse.order.id}`, { replace: true });
        }
      } catch (apiError) {
        if (!ignore) {
          const message = apiError.message || "Failed to finalize Stripe checkout";
          toastError(message);
        }
      } finally {
        if (!ignore) {
          setRestoringCheckout(false);
        }
      }
    };

    void finalizeStripeCheckout();

    return () => {
      ignore = true;
    };
  }, [
    stripeReturnState,
    stripeSessionId,
    selectedAddressId,
    appliedCouponCode,
    navigate
  ]);

  const handlePlaceOrder = async () => {
    let createdOrder = null;

    if (!selectedAddressId) {
      toastError("Please select a delivery address before placing the order");
      return;
    }

    try {
      setPlacingOrder(true);

      if (paymentMethod === "stripe") {
        const sessionResponse = await createCheckoutSession({
          addressId: selectedAddressId,
          couponCode: appliedCouponCode
        });

        if (!sessionResponse.checkout_url) {
          throw new Error("Stripe checkout URL could not be created");
        }

        toastInfo("Redirecting to Stripe Checkout...");
        window.location.assign(sessionResponse.checkout_url);
        return;
      } else {
        const orderResponse = await createOrder({
          addressId: selectedAddressId,
          paymentMethod,
          couponCode: appliedCouponCode
        });
        createdOrder = orderResponse.order;
      }

      toastSuccess("Order placed successfully");
      navigate(`/my-orders/${createdOrder.id}`, { replace: true });
    } catch (apiError) {
      const message =
        createdOrder?.id
          ? `${apiError.message || "Checkout could not be completed"}. The order was created and is visible in My Orders.`
          : apiError.message || "Failed to complete checkout";
      toastError(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading checkout...</p>;
  }

  return (
    <div className="ui-page-wrap space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ui-eyebrow">Checkout</p>
          <h1 className="ui-hero-title">Complete your order.</h1>
          <p className="ui-hero-copy">
            Review selected products, apply a coupon if available, choose a delivery address, and finish with COD or secure online payment.
          </p>
        </div>

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink shadow-soft transition hover:bg-page"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      {!cart.items.length ? (
        <div className="space-y-6">
          <EmptyState
            title="Your cart is empty"
            description="Add products to the cart before opening the checkout flow."
          />
          <Link to="/products">
            <Button className="!text-sm !font-medium !normal-case !tracking-[0.02em]">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-page text-ink">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="ui-eyebrow">Selected Products</p>
                  <h2 className="mt-2 font-display text-3xl text-ink">Cart review</h2>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {preview.selected_products.map((item) => {
                  const imageUrl = buildCatalogImageUrl(item.hero_image);

                  return (
                    <div key={item.id} className="grid gap-4 rounded-[24px] border border-line bg-page p-4 md:grid-cols-[110px_1fr]">
                      <div className="overflow-hidden rounded-[18px] bg-white">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex min-h-[110px] items-end bg-[radial-gradient(circle_at_top,#ffffff_0%,#efe6d9_42%,#ddcdb6_100%)] p-4">
                            <p className="font-display text-2xl leading-none text-ink">{item.product_name}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{item.category_name}</p>
                          <h3 className="mt-2 font-display text-3xl leading-none text-ink">{item.product_name}</h3>
                          <p className="mt-3 text-sm text-secondary">{item.brand_name}</p>
                          <p className="mt-3 text-sm leading-6 text-secondary">
                            {item.variant
                              ? `Variant: ${item.variant.size} / ${item.variant.color}${item.variant.sku ? ` - SKU ${item.variant.sku}` : ""}`
                              : "Base product selection"}
                          </p>
                          <p className="mt-2 text-sm text-secondary">Quantity: {item.quantity}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-secondary">Line total</p>
                          <p className="mt-2 text-xl font-semibold text-ink">{formatCatalogPrice(item.line_total)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-page text-ink">
                  <TicketPercent className="h-5 w-5" />
                </div>
                <div>
                  <p className="ui-eyebrow">Coupon</p>
                  <h2 className="mt-2 font-display text-3xl text-ink">Apply discount</h2>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 md:flex-row">
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="ui-input"
                />
                <Button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  {couponLoading ? "Applying..." : "Apply Coupon"}
                </Button>
                {appliedCouponCode ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRemoveCoupon}
                    className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                  >
                    Remove
                  </Button>
                ) : null}
              </div>

              {preview.coupon ? (
                <div className="mt-5 rounded-[24px] bg-page p-5">
                  <p className="font-medium text-ink">{preview.coupon.code}</p>
                  <p className="mt-2 text-sm text-secondary">{preview.coupon.title}</p>
                  <p className="mt-2 text-sm text-secondary">
                    Discount applied: {formatCatalogPrice(preview.summary.discount_total)}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-page text-ink">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="ui-eyebrow">Address Selection</p>
                    <h2 className="mt-2 font-display text-3xl text-ink">Delivery destination</h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/addresses"
                    state={checkoutAddressState}
                    className="inline-flex items-center rounded-full border border-line bg-page px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
                  >
                    Add Address
                  </Link>
                  <Link
                    to="/addresses"
                    state={checkoutAddressState}
                    className="inline-flex items-center rounded-full border border-line bg-page px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
                  >
                    Manage Addresses
                  </Link>
                </div>
              </div>

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
                      className={`block cursor-pointer rounded-[24px] border p-5 transition ${
                        selectedAddressId === String(address.id) ? "border-ink bg-page" : "border-line bg-white hover:bg-page"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === String(address.id)}
                          onChange={() => setSelectedAddressId(String(address.id))}
                          className="mt-1"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-ink">{address.full_name}</p>
                            <span className="rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-secondary">
                              {address.address_type}
                            </span>
                            {address.is_default ? (
                              <span className="rounded-full border border-line px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-muted">
                                Default
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-3 text-sm leading-6 text-secondary">
                            {address.address_line_1}
                            {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                            {`, ${address.city}, ${address.state} - ${address.postal_code}, ${address.country}`}
                          </p>
                          <p className="mt-2 text-sm text-secondary">Phone: {address.phone}</p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedAddressId(String(address.id))}
                              className="text-sm font-medium text-ink underline underline-offset-4"
                            >
                              {selectedAddressId === String(address.id) ? "Selected for checkout" : "Use this address"}
                            </button>
                            <Link
                              to="/addresses"
                              state={{
                                ...checkoutAddressState,
                                editAddressId: address.id
                              }}
                              className="text-sm font-medium text-ink underline underline-offset-4"
                            >
                              Edit address
                            </Link>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-page text-ink">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="ui-eyebrow">Payment Method</p>
                  <h2 className="mt-2 font-display text-3xl text-ink">Choose payment</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
              {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`block cursor-pointer rounded-[24px] border p-5 transition ${
                      paymentMethod === method.value ? "border-ink bg-page" : "border-line bg-white hover:bg-page"
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
    </div>
  );
}

export default CheckoutPage;
