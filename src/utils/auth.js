const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export const saveAuth = (token, user) => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify(user));
};

export const getStoredToken = () => {
  return getStorage()?.getItem("token") || null;
};

export const getStoredUser = () => {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const user = storage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    storage.removeItem("user");
    return null;
  }
};

export const updateStoredUser = (user) => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem("user", JSON.stringify(user));
};

export const isAuthenticated = () => {
  return Boolean(getStoredToken());
};

export const clearAuth = () => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem("token");
  storage.removeItem("user");
};
