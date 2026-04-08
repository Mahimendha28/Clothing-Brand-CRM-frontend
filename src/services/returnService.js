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

export const getReturns = async ({ returnStatus = "", refundStatus = "" } = {}) => {
  const params = new URLSearchParams();

  if (returnStatus) {
    params.append("returnStatus", returnStatus);
  }

  if (refundStatus) {
    params.append("refundStatus", refundStatus);
  }

  const response = await fetch(`${API_BASE_URL}/returns${params.toString() ? `?${params.toString()}` : ""}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getReturnById = async (returnId) => {
  const response = await fetch(`${API_BASE_URL}/returns/${returnId}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const createReturnRequest = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/returns`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateReturnStatus = async (returnId, status, staffNotes = "") => {
  const response = await fetch(`${API_BASE_URL}/returns/${returnId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status,
      staffNotes
    })
  });

  return handleResponse(response);
};

const postReturnAction = async (returnId, action, payload = {}) => {
  const response = await fetch(`${API_BASE_URL}/returns/${returnId}/${action}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const approveReturn = async (returnId, staffNotes = "") =>
  postReturnAction(returnId, "approve", { staffNotes });

export const rejectReturn = async (returnId, staffNotes = "") =>
  postReturnAction(returnId, "reject", { staffNotes });

export const refundReturn = async (returnId, refundReference = "", staffNotes = "") =>
  postReturnAction(returnId, "refund", { refundReference, staffNotes });
