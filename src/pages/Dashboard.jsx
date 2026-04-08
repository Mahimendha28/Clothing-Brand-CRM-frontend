import AdminDashboard from "./AdminDashboard";
import InventoryDashboardPage from "./InventoryDashboardPage";
import SalesDashboard from "./SalesDashboard";
import { getStoredUser } from "../utils/auth";

function Dashboard() {
  const user = getStoredUser();

  if (user?.role === "sales_executive" || user?.role === "marketing_manager") {
    return <SalesDashboard />;
  }

  if (user?.role === "inventory_manager") {
    return <InventoryDashboardPage />;
  }

  return <AdminDashboard />;
}

export default Dashboard;
