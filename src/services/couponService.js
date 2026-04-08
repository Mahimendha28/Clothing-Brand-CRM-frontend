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
  const headers = {
    "Content-Type": "application/json"
  };
  const token = getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const getCoupons = async ({ status = "" } = {}) => {
  const params = new URLSearchParams();

  if (status) {
    params.append("status", status);
  }

  const response = await fetch(`${API_BASE_URL}/coupons${params.toString() ? `?${params.toString()}` : ""}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const createCoupon = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateCoupon = async (couponId, payload) => {
  const response = await fetch(`${API_BASE_URL}/coupons/${couponId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateCouponStatus = async (couponId, status) => {
  const response = await fetch(`${API_BASE_URL}/coupons/${couponId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  return handleResponse(response);
};

export const getCouponUsages = async (couponId) => {
  const response = await fetch(`${API_BASE_URL}/coupons/${couponId}/usages`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};
