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

export const createPaymentIntent = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderId })
  });

  return handleResponse(response);
};

export const verifyPayment = async ({ orderId, paymentId, cardNumber, cardholderName = "", expiry = "", cvc = "" }) => {
  const response = await fetch(`${API_BASE_URL}/payments/verify`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      orderId,
      paymentId,
      cardNumber,
      cardholderName,
      expiry,
      cvc
    })
  });

  return handleResponse(response);
};

export const getPaymentsForOrder = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/payments/${orderId}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};
