import { Navigate, Outlet } from "react-router-dom";

import { getStoredUser } from "../utils/auth";

function RoleRoute({ allowedRoles }) {
  const user = getStoredUser();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
