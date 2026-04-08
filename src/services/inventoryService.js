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

export const getInventorySummary = async () => {
  const response = await fetch(`${API_BASE_URL}/inventory/summary`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getInventoryLowStock = async () => {
  const response = await fetch(`${API_BASE_URL}/inventory/low-stock`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getInventoryTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/inventory/transactions`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const addOpeningStock = async ({ variantId, quantity, notes = "" }) => {
  const response = await fetch(`${API_BASE_URL}/inventory/opening-stock`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      variantId,
      quantity,
      notes
    })
  });

  return handleResponse(response);
};

export const adjustInventoryStock = async ({ variantId, quantity, type, notes = "" }) => {
  const response = await fetch(`${API_BASE_URL}/inventory/adjust`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      variantId,
      quantity,
      type,
      notes
    })
  });

  return handleResponse(response);
};
