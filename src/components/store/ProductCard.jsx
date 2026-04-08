import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { buildCatalogImageUrl, formatCatalogPrice } from "../../services/catalogService";

function ProductCard({ product }) {
  const imageUrl = buildCatalogImageUrl(product.hero_image);
  const priceLabel =
    Number(product.price_from) !== Number(product.price_to)
      ? `${formatCatalogPrice(product.price_from)} - ${formatCatalogPrice(product.price_to)}`
      : formatCatalogPrice(product.price_from || product.base_price);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-[28px] border border-line bg-card shadow-soft transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(160deg,#ede5da_0%,#f7f3ed_100%)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.product_name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-[radial-gradient(circle_at_top,#ffffff_0%,#efe6d9_42%,#ddcdb6_100%)] p-6">
            <div>
              <p className="ui-eyebrow !text-[#7a6858]">{product.brand_name}</p>
              <h3 className="mt-3 font-display text-4xl leading-none text-ink">{product.product_name}</h3>
            </div>
          </div>
        )}

        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/75 text-ink backdrop-blur-sm transition group-hover:bg-white">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">{product.category_name}</p>
            <h3 className="mt-2 font-display text-3xl leading-none text-ink">{product.product_name}</h3>
          </div>
          <p className="text-sm font-semibold text-ink">{priceLabel}</p>
        </div>

        <p className="min-h-[3rem] text-sm leading-6 text-secondary">
          {product.description || `${product.brand_name} essentials shaped for a quieter editorial wardrobe.`}
        </p>

        <div className="flex flex-wrap gap-2">
          {product.available_sizes.slice(0, 3).map((size) => (
            <span
              key={`${product.id}-${size}`}
              className="rounded-full border border-line bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary"
            >
              {size}
            </span>
          ))}
          {!product.available_sizes.length ? (
            <span className="rounded-full border border-line bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
              Made to order
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
