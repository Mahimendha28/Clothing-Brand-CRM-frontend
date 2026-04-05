export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getStoredToken = () => {
  return localStorage.getItem("token");
};

export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const updateStoredUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const isAuthenticated = () => {
  return Boolean(getStoredToken());
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
