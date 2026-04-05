export const getDefaultRouteForRole = (role) => {
  if (role === "admin") {
    return "/admin/users";
  }

  return "/dashboard";
};
