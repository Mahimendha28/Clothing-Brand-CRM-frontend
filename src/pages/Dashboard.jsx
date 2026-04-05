import React from "react";
import { getStoredUser } from "../utils/auth";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

function Dashboard() {
  const user = getStoredUser();

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

export default Dashboard;
