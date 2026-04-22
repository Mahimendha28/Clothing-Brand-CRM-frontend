import { startTransition, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Power, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import CursorPagination from "../components/common/CursorPagination";
import CustomerTableToolbar from "../components/common/CustomerTableToolbar";
import EmptyState from "../components/common/EmptyState";
import IconActionButton from "../components/common/IconActionButton";
import PageHeader from "../components/common/PageHeader";
import StatusPill from "../components/common/StatusPill";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import { useToast } from "../context/ToastContext";
import {
  deleteProduct,
  getProductById,
  getProducts,
  updateProductStatus
} from "../services/authService";
import { formatCatalogPrice } from "../services/catalogService";

const PAGE_SIZE = 8;

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cursor, setCursor] = useState(0);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null);
  const { toastError, toastSuccess } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getProducts();
      const baseProducts = response.products || [];
      const detailedProducts = await Promise.all(
        baseProducts.map(async (product) => {
          try {
            const detailResponse = await getProductById(product.id);
            const variants = detailResponse.product?.variants || [];

            return {
              ...product,
              variant_count: variants.length,
              total_stock: variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0)
            };
          } catch (_error) {
            return {
              ...product,
              variant_count: 0,
              total_stock: 0
            };
          }
        })
      );

      startTransition(() => {
        setProducts(detailedProducts);
      });
    } catch (apiError) {
      setError(apiError.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category_name).filter(Boolean))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.product_name?.toLowerCase().includes(search) ||
        product.slug?.toLowerCase().includes(search) ||
        product.brand_name?.toLowerCase().includes(search);

      const matchesCategory = !categoryFilter || product.category_name === categoryFilter;
      const matchesStatus = !statusFilter || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, products, searchValue, statusFilter]);

  const paginatedProducts = useMemo(
    () => filteredProducts.slice(cursor, cursor + PAGE_SIZE),
    [cursor, filteredProducts]
  );

  useEffect(() => {
    setCursor(0);
  }, [searchValue, categoryFilter, statusFilter]);

  useEffect(() => {
    if (cursor >= filteredProducts.length && cursor !== 0) {
      setCursor(Math.max(0, filteredProducts.length - PAGE_SIZE));
    }
  }, [cursor, filteredProducts.length]);

  const handleStatusToggle = async (product) => {
    try {
      setPendingActionId(product.id);
      setError("");
      const nextStatus = product.status === "active" ? "inactive" : "active";
      await updateProductStatus(product.id, nextStatus);
      setProducts((current) =>
        current.map((entry) => (entry.id === product.id ? { ...entry, status: nextStatus } : entry))
      );
      toastSuccess(`Product status updated to ${nextStatus}`);
    } catch (apiError) {
      toastError(apiError.message || "Failed to update product status");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteTarget) {
      return;
    }

    try {
      setPendingActionId(confirmDeleteTarget.id);
      setError("");
      await deleteProduct(confirmDeleteTarget.id);
      setProducts((current) => current.filter((product) => product.id !== confirmDeleteTarget.id));
      toastSuccess("Product deleted successfully");
      setConfirmDeleteTarget(null);
    } catch (apiError) {
      toastError(apiError.message || "Failed to delete product");
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Product Master"
        title="Products"
        description="Manage the product catalogue with cleaner table controls, quicker actions, and live stock visibility from existing product records."
        actions={
          <Link to="/admin/products/create">
            <Button className="ui-compact-button !min-w-[148px]">Create Product</Button>
          </Link>
        }
      />

      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-5 !p-5 md:!p-6">
        <CustomerTableToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search by product name, slug, or brand"
          totalItems={products.length}
          visibleItems={filteredProducts.length}
          itemLabel="products"
          filters={[
            {
              key: "category",
              label: "Category",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [{ value: "", label: "All categories" }, ...categories.map((category) => ({ value: category, label: category }))]
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]
            }
          ]}
        />

        {loading ? <p className="text-sm text-secondary">Loading products...</p> : null}

        {!loading && !filteredProducts.length ? (
          <EmptyState
            title="No matching products"
            description="Adjust the search or filters to find the product records you need."
          />
        ) : null}

        {filteredProducts.length ? (
          <>
            <div className="overflow-x-auto rounded-[18px] border border-line">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead className="bg-page">
                  <tr>
                    <th className="ui-table-head">Name</th>
                    <th className="ui-table-head">Category</th>
                    <th className="ui-table-head">Price</th>
                    <th className="ui-table-head">Stock</th>
                    <th className="ui-table-head">Status</th>
                    <th className="ui-table-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-b border-line align-top last:border-b-0">
                      <td className="ui-table-cell">
                        <div>
                          <p className="font-semibold text-ink">{product.product_name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-secondary">{product.slug}</p>
                          <p className="mt-1 text-xs text-secondary">{product.brand_name}</p>
                        </div>
                      </td>
                      <td className="ui-table-cell">
                        <p className="font-medium text-ink">{product.category_name}</p>
                      </td>
                      <td className="ui-table-cell font-medium">{formatCatalogPrice(product.base_price)}</td>
                      <td className="ui-table-cell">
                        <p className="font-medium text-ink">{product.total_stock}</p>
                        <p className="mt-1 text-xs text-secondary">{product.variant_count} variants</p>
                      </td>
                      <td className="ui-table-cell">
                        <StatusPill value={product.status} />
                      </td>
                      <td className="ui-table-cell">
                        <div className="flex min-w-[160px] flex-wrap gap-2">
                          <Link to={`/admin/products/${product.id}`}>
                            <IconActionButton icon={Eye} label="View product" variant="secondary" />
                          </Link>
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <IconActionButton icon={Pencil} label="Edit product" />
                          </Link>
                          <IconActionButton
                            icon={Power}
                            label={product.status === "active" ? "Disable product" : "Enable product"}
                            onClick={() => handleStatusToggle(product)}
                            disabled={pendingActionId === product.id}
                            className={pendingActionId === product.id ? "opacity-60" : ""}
                          />
                          <IconActionButton
                            icon={Trash2}
                            label="Delete product"
                            onClick={() => setConfirmDeleteTarget(product)}
                            disabled={pendingActionId === product.id}
                            className="!border-danger/30 !text-danger hover:!bg-danger/5"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <CursorPagination
              cursor={cursor}
              pageSize={PAGE_SIZE}
              totalItems={filteredProducts.length}
              onPrevious={() => setCursor((current) => Math.max(0, current - PAGE_SIZE))}
              onNext={() => setCursor((current) => current + PAGE_SIZE)}
            />
          </>
        ) : null}
      </SurfaceCard>

      <ConfirmDialog
        open={Boolean(confirmDeleteTarget)}
        title="Delete product"
        description={`This will permanently remove ${confirmDeleteTarget?.product_name || "this product"} from the catalogue. This action cannot be undone.`}
        confirmLabel="Delete Product"
        loading={Boolean(confirmDeleteTarget && pendingActionId === confirmDeleteTarget.id)}
        onConfirm={handleDelete}
        onClose={() => {
          if (!pendingActionId) {
            setConfirmDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}

export default Products;
