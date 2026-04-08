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

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  return query.toString() ? `?${query.toString()}` : "";
};

export const getCrmCustomers = async ({ q = "" } = {}) => {
  const response = await fetch(`${API_BASE_URL}/crm/customers${buildQueryString({ q })}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getInactiveCustomers = async ({ q = "" } = {}) => {
  const response = await fetch(`${API_BASE_URL}/crm/customers/segments/inactive${buildQueryString({ q })}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getTopBuyerCustomers = async ({ q = "", limit = 10 } = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/crm/customers/segments/top-buyers${buildQueryString({ q, limit })}`,
    {
      headers: getAuthHeaders()
    }
  );

  return handleResponse(response);
};

export const getCrmCustomerById = async (customerId) => {
  const response = await fetch(`${API_BASE_URL}/crm/customers/${customerId}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getCrmCustomerOrders = async (customerId) => {
  const response = await fetch(`${API_BASE_URL}/crm/customers/${customerId}/orders`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getCrmCustomerNotes = async (customerId) => {
  const response = await fetch(`${API_BASE_URL}/crm/customers/${customerId}/notes`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const createCrmCustomerNote = async (customerId, noteText) => {
  const response = await fetch(`${API_BASE_URL}/crm/customers/${customerId}/notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ noteText })
  });

  return handleResponse(response);
};
