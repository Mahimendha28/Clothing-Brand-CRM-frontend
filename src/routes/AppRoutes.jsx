import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Addresses from "../pages/Addresses";
import AdminUsers from "../pages/AdminUsers";
import AdminUserForm from "../pages/AdminUserForm";
import Categories from "../pages/Categories";
import Brands from "../pages/Brands";
import Products from "../pages/Products";
import AddProduct from "../pages/AddProduct";
import EditProduct from "../pages/EditProduct";
import ProductView from "../pages/ProductView";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addresses" element={<Addresses />} />
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
