import { getStoredToken } from "../utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const handleResponse = async (response) => {
  const responseText = await response.text();
  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    throw new Error("Server returned an unexpected response. Please verify the backend is running correctly.");
  }

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
};

const emitCartUpdated = (cart) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("cartUpdated", {
      detail: {
        cart: cart || null
      }
    })
  );
};

const getAuthHeaders = () => {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const getCart = async () => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const addCartItem = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await handleResponse(response);
  emitCartUpdated(data.cart);
  return data;
};

export const updateCartItem = async (cartItemId, payload) => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await handleResponse(response);
  emitCartUpdated(data.cart);
  return data;
};

export const removeCartItem = async (cartItemId) => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  const data = await handleResponse(response);
  emitCartUpdated(data.cart);
  return data;
};

export const clearCart = async () => {
  const response = await fetch(`${API_BASE_URL}/cart/clear`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  const data = await handleResponse(response);
  emitCartUpdated(data.cart);
  return data;
};
