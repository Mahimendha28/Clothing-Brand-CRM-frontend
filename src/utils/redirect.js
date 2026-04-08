export const getDefaultRouteForRole = (role) => {
  if (role === "admin") {
    return "/dashboard";
  }

  if (role === "customer") {
    return "/";
  }

  return "/dashboard";
};
