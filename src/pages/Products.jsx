import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import {
  deleteProduct,
  getProducts,
  updateProductStatus
} from "../services/authService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.products);
    } catch (apiError) {
      setError(apiError.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStatusToggle = async (product) => {
    try {
      setError("");
      setMessage("");
      const nextStatus = product.status === "active" ? "inactive" : "active";
      await updateProductStatus(product.id, nextStatus);
      setMessage(`Product status updated to ${nextStatus}`);
      loadProducts();
    } catch (apiError) {
      setError(apiError.message || "Failed to update product status");
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Do you want to delete this product?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await deleteProduct(productId);
      setMessage("Product deleted successfully");
      loadProducts();
    } catch (apiError) {
      setError(apiError.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Product Master"
        title="Product list"
        description="Manage product records, move into add, edit, and view screens, and toggle active status directly from the listing."
        actions={
          <Link to="/admin/products/create">
            <Button>Create Product</Button>
          </Link>
        }
      />

      <SurfaceCard className="space-y-5">
        <StatusBanner tone="success">{message}</StatusBanner>
        <StatusBanner tone="danger">{error}</StatusBanner>

        {loading ? <p className="text-sm text-secondary">Loading products...</p> : null}

        {!loading && products.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Create your first product to complete the product master flow."
          />
        ) : null}

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Hierarchy</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <p className="font-semibold text-ink">{product.product_name}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">{product.slug}</p>
                      </div>
                    </td>
                    <td>{product.category_name}</td>
                    <td>
                      <p className="text-sm text-ink">{product.subcategory_name || "-"}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">{product.type_name || "-"}</p>
                    </td>
                    <td>Rs. {Number(product.base_price).toFixed(2)}</td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          product.status === "active"
                            ? "bg-success/15 text-success"
                            : "bg-danger/15 text-danger"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-3">
                        <Link to={`/admin/products/${product.id}`}>
                          <Button variant="secondary">View</Button>
                        </Link>
                        <Link to={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline">Edit</Button>
                        </Link>
                        <Button type="button" variant="outline" onClick={() => handleStatusToggle(product)}>
                          {product.status === "active" ? "Disable" : "Enable"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleDelete(product.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

export default Products;
