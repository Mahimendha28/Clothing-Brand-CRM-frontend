import { startTransition, useEffect, useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import { addCartItem } from "../services/cartService";
import { buildCatalogImageUrl, formatCatalogPrice } from "../services/catalogService";
import { deleteWishlistItem, getWishlist } from "../services/wishlistService";

const emptyWishlist = {
  id: null,
  item_count: 0,
  items: []
};

function WishlistPage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(emptyWishlist);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingProductId, setPendingProductId] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadWishlist = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getWishlist();

        if (!ignore) {
          startTransition(() => {
            setWishlist(response.wishlist || emptyWishlist);
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load your wishlist");
          setWishlist(emptyWishlist);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      ignore = true;
    };
  }, []);

  const applyWishlistResponse = (response, successMessage) => {
    startTransition(() => {
      setWishlist(response.wishlist || emptyWishlist);
    });
    setError("");
    setNotice(successMessage || response.message || "Wishlist updated successfully");
  };

  const handleRemove = async (productId) => {
    try {
      setPendingProductId(productId);
      setNotice("");
      const response = await deleteWishlistItem(productId);
      applyWishlistResponse(response, "Removed from wishlist");
    } catch (apiError) {
      setNotice("");
      setError(apiError.message || "Failed to remove wishlist item");
    } finally {
      setPendingProductId(null);
    }
  };

  const handleMoveToCart = async (item) => {
    if (item.requires_variant_selection) {
      navigate(`/products/${item.slug}`);
      return;
    }

    try {
      setPendingProductId(item.product_id);
      setNotice("");
      await addCartItem({
        productId: item.product_id,
        variantId: item.variant?.id || null,
        quantity: 1
      });
      const response = await deleteWishlistItem(item.product_id);
      applyWishlistResponse(response, "Wishlist item moved to cart");
    } catch (apiError) {
      setNotice("");
      setError(apiError.message || "Failed to move wishlist item to cart");
    } finally {
      setPendingProductId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-secondary">Loading your wishlist...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ui-eyebrow">Wishlist</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.92] text-ink">Saved for later.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary">
            Keep products aside, remove anything you no longer need, or move saved items directly into the cart when you are ready.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink shadow-soft transition hover:bg-page"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Browsing
        </Link>
      </div>

      <StatusBanner tone="danger">{error}</StatusBanner>
      <StatusBanner tone="success">{notice}</StatusBanner>

      {!wishlist.items.length ? (
        <div className="space-y-6">
          <EmptyState
            title="Your wishlist is empty"
            description="Save products from the product detail page to revisit them later or move them into the cart."
          />
          <Link to="/products">
            <Button className="!text-sm !font-medium !normal-case !tracking-[0.02em]">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {wishlist.items.map((item) => {
              const imageUrl = buildCatalogImageUrl(item.hero_image);
              const isBusy = pendingProductId === item.product_id;

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
                            ? `Saved variant: ${item.variant.size} / ${item.variant.color}${item.variant.sku ? ` - SKU ${item.variant.sku}` : ""}`
                            : item.requires_variant_selection
                              ? "Select a size and color before moving this item to cart."
                              : "Base product saved in wishlist"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-secondary">Preview Price</p>
                        <p className="mt-2 text-2xl font-semibold text-ink">
                          {formatCatalogPrice(item.preview_price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={() => handleMoveToCart(item)}
                        disabled={isBusy}
                        className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                      >
                        {item.requires_variant_selection ? "Choose Variant" : "Move to Cart"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemove(item.product_id)}
                        disabled={isBusy}
                        className="!px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-[32px] border border-soft bg-canvas p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-soft">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="ui-eyebrow">Wishlist Summary</p>
                <h2 className="mt-2 font-display text-3xl text-ink">Saved products</h2>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-[24px] bg-white p-5">
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Saved items</span>
                <span className="font-semibold text-ink">{wishlist.item_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Ready to move</span>
                <span className="font-semibold text-ink">
                  {wishlist.items.filter((item) => !item.requires_variant_selection).length}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link to="/cart" className="block">
                <Button
                  variant="secondary"
                  className="w-full !rounded-[16px] !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  Open Cart
                </Button>
              </Link>
              <Link to="/products" className="block">
                <Button
                  variant="outline"
                  className="w-full !rounded-[16px] !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  Save More Products
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
