import { startTransition, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import StatusBanner from "../components/common/StatusBanner";
import ProductReviewsSection from "../components/store/ProductReviewsSection";
import {
  buildCatalogImageUrl,
  formatCatalogPrice,
  getStoreProductBySlug
} from "../services/catalogService";
import { addCartItem } from "../services/cartService";
import { addWishlistItem } from "../services/wishlistService";
import { isAuthenticated } from "../utils/auth";

function ProductDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [cartError, setCartError] = useState("");
  const [cartNotice, setCartNotice] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [wishlistNotice, setWishlistNotice] = useState("");
  const [savingWishlist, setSavingWishlist] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getStoreProductBySlug(slug);

        if (!ignore) {
          startTransition(() => {
            setProduct(response.product || null);
          });
          setCartError("");
          setCartNotice("");
          setWishlistError("");
          setWishlistNotice("");
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load product detail");
          setProduct(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const galleryImages = product.images?.length
      ? product.images
      : product.hero_image
        ? [{ id: "hero", image_url: product.hero_image }]
        : [];
    const firstVariant = product.variants?.[0] || null;

    setActiveImage(galleryImages[0]?.image_url || "");
    setSelectedSize(firstVariant?.size || "");
    setSelectedColor(firstVariant?.color || "");
  }, [product]);

  useEffect(() => {
    if (!product?.variants?.length || !selectedSize) {
      return;
    }

    const availableColorsForSize = product.variants
      .filter((variant) => variant.size === selectedSize)
      .map((variant) => variant.color);

    if (!availableColorsForSize.includes(selectedColor)) {
      setSelectedColor(availableColorsForSize[0] || "");
    }
  }, [product, selectedColor, selectedSize]);

  if (loading) {
    return <p className="text-sm text-secondary">Loading product detail...</p>;
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <StatusBanner tone="danger">{error || "Product not found"}</StatusBanner>
        <EmptyState
          title="This product is unavailable"
          description="The requested product detail page could not be opened. Please return to the listing and choose another active product."
        />
      </div>
    );
  }

  const galleryImages = product.images?.length
    ? product.images
    : product.hero_image
      ? [{ id: "hero", image_url: product.hero_image }]
      : [];
  const sizeOptions = [...new Set((product.variants || []).map((variant) => variant.size))];
  const colorOptions = [
    ...new Set(
      (product.variants || [])
        .filter((variant) => !selectedSize || variant.size === selectedSize)
        .map((variant) => variant.color)
    )
  ];
  const selectedVariant =
    product.variants?.find((variant) => variant.size === selectedSize && variant.color === selectedColor) ||
    product.variants?.[0] ||
    null;
  const activeImageUrl = buildCatalogImageUrl(activeImage || galleryImages[0]?.image_url || product.hero_image);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price_from || product.base_price;
  const currentStock = selectedVariant ? selectedVariant.stock : null;
  const isAddDisabled = addingToCart || currentStock === 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      setAddingToCart(true);
      setCartError("");
      setCartNotice("");
      const response = await addCartItem({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        quantity: 1
      });
      setCartNotice(response.message || "Item added to cart successfully");
    } catch (apiError) {
      setCartNotice("");
      setCartError(apiError.message || "Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      setSavingWishlist(true);
      setWishlistError("");
      setWishlistNotice("");
      const response = await addWishlistItem({
        productId: product.id,
        variantId: selectedVariant?.id || null
      });
      setWishlistNotice(response.message || "Wishlist updated successfully");
    } catch (apiError) {
      setWishlistNotice("");
      setWishlistError(apiError.message || "Failed to save to wishlist");
    } finally {
      setSavingWishlist(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        <Link
          to={product.category_id ? `/products?category=${product.category_id}` : "/products"}
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-ink"
        >
          More from {product.category_name}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <StatusBanner tone="danger">{error}</StatusBanner>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[34px] border border-line bg-white shadow-float">
            {activeImageUrl ? (
              <img src={activeImageUrl} alt={product.product_name} className="h-[680px] w-full object-cover" />
            ) : (
              <div className="flex h-[680px] items-end bg-[radial-gradient(circle_at_top,#ffffff_0%,#efe5d7_48%,#ddccb2_100%)] p-10">
                <div>
                  <p className="ui-eyebrow !text-[#7a6858]">{product.brand_name}</p>
                  <h1 className="mt-4 font-display text-6xl leading-none text-ink">{product.product_name}</h1>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            {galleryImages.map((image) => {
              const thumbnailUrl = buildCatalogImageUrl(image.image_url);

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(image.image_url)}
                  className={`overflow-hidden rounded-[22px] border ${
                    activeImage === image.image_url || (!activeImage && galleryImages[0]?.id === image.id)
                      ? "border-ink"
                      : "border-line"
                  } bg-white shadow-soft`}
                >
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={product.product_name} className="h-28 w-full object-cover" />
                  ) : (
                    <div className="flex h-28 items-center justify-center text-xs uppercase tracking-[0.2em] text-muted">
                      Preview
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[34px] border border-line bg-white p-8 shadow-soft">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">{product.category_name}</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.92] text-ink">{product.product_name}</h1>
            <p className="mt-3 text-sm text-secondary">{product.brand_name}</p>
            <p className="mt-6 text-3xl font-semibold text-ink">{formatCatalogPrice(currentPrice)}</p>
            <p className="mt-5 text-sm leading-7 text-secondary">
              {product.description || "A premium product page with real gallery images, active variants, and customer-side selection controls."}
            </p>

            <div className="mt-6 space-y-3">
              <StatusBanner tone="danger">{cartError}</StatusBanner>
              <StatusBanner tone="success">{cartNotice}</StatusBanner>
              <StatusBanner tone="danger">{wishlistError}</StatusBanner>
              <StatusBanner tone="success">{wishlistNotice}</StatusBanner>
            </div>

            {sizeOptions.length ? (
              <div className="mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Select size</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        selectedSize === size
                          ? "bg-ink text-white"
                          : "border border-line bg-page text-ink hover:bg-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {colorOptions.length ? (
              <div className="mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Select color</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        selectedColor === color
                          ? "bg-[#6d6c6a] text-white"
                          : "border border-line bg-white text-ink hover:bg-page"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] bg-page p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Selected variant</p>
                <p className="mt-3 text-lg font-semibold text-ink">
                  {selectedVariant ? `${selectedVariant.size} / ${selectedVariant.color}` : "Base product"}
                </p>
                {selectedVariant ? <p className="mt-2 text-sm text-secondary">SKU {selectedVariant.sku}</p> : null}
              </div>

              <div className="rounded-[22px] bg-page p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Availability</p>
                <p className="mt-3 text-lg font-semibold text-ink">
                  {currentStock === null ? "Available on request" : currentStock > 0 ? `${currentStock} in stock` : "Currently unavailable"}
                </p>
                <p className="mt-2 text-sm text-secondary">
                  Active variants only are shown on the customer storefront.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddDisabled}
                className="!px-7 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                {addingToCart ? "Adding..." : isAuthenticated() ? "Add to Cart" : "Sign In to Add"}
              </Button>
              <Link to="/cart">
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-7 !text-sm !font-medium !normal-case !tracking-[0.02em]"
                >
                  View Cart
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddToWishlist}
                disabled={savingWishlist}
                className="!gap-2 !px-7 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                <Heart className="h-4 w-4" />
                {savingWishlist ? "Saving..." : isAuthenticated() ? "Add to Wishlist" : "Sign In to Save"}
              </Button>
            </div>
          </div>

          <div className="rounded-[34px] border border-line bg-[#f3eee6] p-8 shadow-soft">
            <p className="ui-eyebrow">Product Notes</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-secondary">
              <p>This detail page is connected to the live product API, so gallery images and variant selectors reflect the active catalog rather than placeholder content.</p>
              <p>Customers can move back to the listing with filters intact, then open a new product detail page from any product card.</p>
              <p>The product price shown here updates to the selected active variant when size and color are changed.</p>
            </div>
          </div>
        </div>
      </div>

      <ProductReviewsSection productId={product.id} productName={product.product_name} />
    </div>
  );
}

export default ProductDetail;
