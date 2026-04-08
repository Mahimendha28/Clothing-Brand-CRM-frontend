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
    throw new Error(data.message || "Request failed");
  }

  return data;
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

export const getWishlist = async () => {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const addWishlistItem = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/wishlist/items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const deleteWishlistItem = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/wishlist/items/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};
