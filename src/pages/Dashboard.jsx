import AdminDashboard from "./AdminDashboard";
import Inventory from "./Inventory";
import InventoryDashboardPage from "./InventoryDashboardPage";
import SalesDashboard from "./SalesDashboard";
import SalesExecutiveOverview from "./SalesExecutiveOverview";
import UserDashboard from "./UserDashboard";
import { getStoredUser } from "../utils/auth";

function Dashboard() {
  const user = getStoredUser();

  if (user?.role === "sales_executive") {
    return <SalesExecutiveOverview />;
  }

  if (user?.role === "marketing_manager") {
    return <SalesDashboard />;
  }

  if (user?.role === "inventory_manager") {
    return <Inventory />;
  }

  if (user?.role === "customer") {
    return <UserDashboard />;
  }

  return <AdminDashboard />;
}

export default Dashboard;
