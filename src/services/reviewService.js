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

export const getProductReviews = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
  return handleResponse(response);
};

export const createProductReview = async (productId, payload) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateReviewStatus = async (reviewId, status) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  return handleResponse(response);
};

export const deleteReview = async (reviewId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};
