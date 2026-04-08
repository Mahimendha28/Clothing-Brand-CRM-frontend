import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import StorefrontLayout from "../layouts/StorefrontLayout";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MyOrdersPage from "../pages/MyOrdersPage";
import NotificationsPage from "../pages/NotificationsPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import OrderQueuePage from "../pages/OrderQueuePage";
import ReturnManagementPage from "../pages/ReturnManagementPage";
import ReturnRequestPage from "../pages/ReturnRequestPage";
import ReturnsPage from "../pages/ReturnsPage";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import Profile from "../pages/Profile";
import Addresses from "../pages/Addresses";
import ProductListing from "../pages/ProductListing";
import ProductDetail from "../pages/ProductDetail";
import WishlistPage from "../pages/WishlistPage";
import WorkspaceSection from "../pages/WorkspaceSection";
import AdminUsers from "../pages/AdminUsers";
import AdminUserForm from "../pages/AdminUserForm";
import Categories from "../pages/Categories";
import Brands from "../pages/Brands";
import Products from "../pages/Products";
import AddProduct from "../pages/AddProduct";
import EditProduct from "../pages/EditProduct";
import ProductView from "../pages/ProductView";
import StaffOrderDetailPage from "../pages/StaffOrderDetailPage";
import CustomerListPage from "../pages/CustomerListPage";
import CustomerDetailLayout from "../pages/CustomerDetailLayout";
import CustomerDetailOverviewPage from "../pages/CustomerDetailOverviewPage";
import CustomerOrderHistoryPage from "../pages/CustomerOrderHistoryPage";
import CustomerNotesPage from "../pages/CustomerNotesPage";
import CouponManagementPage from "../pages/CouponManagementPage";
import SalesDashboard from "../pages/SalesDashboard";
import InventoryDashboardPage from "../pages/InventoryDashboardPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<StorefrontLayout />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/my-orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/returns/new/:orderId" element={<ReturnRequestPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<WorkspaceSection />} />
          <Route path="/settings" element={<WorkspaceSection />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addresses" element={<Addresses />} />
        </Route>

        <Route
          element={
            <RoleRoute
              allowedRoles={["admin", "sales_executive", "marketing_manager", "inventory_manager", "fulfillment_executive"]}
            />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin", "sales_executive", "marketing_manager"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/sales" element={<SalesDashboard />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin", "inventory_manager"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/inventory" element={<InventoryDashboardPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin", "inventory_manager"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/inventory" element={<Inventory />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin", "sales_executive", "fulfillment_executive"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/orders" element={<OrderQueuePage />} />
            <Route path="/orders/:orderId" element={<StaffOrderDetailPage />} />
            <Route path="/dashboard/returns" element={<ReturnManagementPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin", "sales_executive", "marketing_manager"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/customers/:customerId" element={<CustomerDetailLayout />}>
              <Route index element={<CustomerDetailOverviewPage />} />
              <Route path="orders" element={<CustomerOrderHistoryPage />} />
              <Route path="notes" element={<CustomerNotesPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin", "marketing_manager"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/coupons" element={<CouponManagementPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/create" element={<AdminUserForm />} />
            <Route path="/admin/users/:userId/edit" element={<AdminUserForm />} />
            <Route path="/admin/users/:userId" element={<Profile />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/brands" element={<Brands />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/products/create" element={<AddProduct />} />
            <Route path="/admin/products/:productId/edit" element={<EditProduct />} />
            <Route path="/admin/products/:productId" element={<ProductView />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
