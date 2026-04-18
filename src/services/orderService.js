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

export const createOrder = async ({ addressId = "", paymentMethod = "cod", couponCode = "", paymentIntentId = "" } = {}) => {
  const payload = {
    paymentMethod
  };

  if (addressId) {
    payload.addressId = Number(addressId);
  }

  if (couponCode) {
    payload.couponCode = couponCode;
  }

  if (paymentIntentId) {
    payload.paymentIntentId = paymentIntentId;
  }

  const response = await fetch(`${API_BASE_URL}/checkout/create-order`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const getMyOrders = async () => {
  const response = await fetch(`${API_BASE_URL}/my-orders`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getOrders = async ({ status = "" } = {}) => {
  const params = new URLSearchParams();

  if (status) {
    params.append("status", status);
  }

  const response = await fetch(`${API_BASE_URL}/orders${params.toString() ? `?${params.toString()}` : ""}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getOrderById = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const updateOrderStatus = async (orderId, status, notes = "") => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status,
      notes
    })
  });

  return handleResponse(response);
};

const postOrderAction = async (orderId, action, notes = "") => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/${action}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ notes })
  });

  return handleResponse(response);
};

export const confirmOrder = async (orderId, notes = "") => postOrderAction(orderId, "confirm", notes);
export const packOrder = async (orderId, notes = "") => postOrderAction(orderId, "pack", notes);
export const shipOrder = async (orderId, notes = "") => postOrderAction(orderId, "ship", notes);
export const deliverOrder = async (orderId, notes = "") => postOrderAction(orderId, "deliver", notes);
export const cancelOrder = async (orderId, notes = "") => postOrderAction(orderId, "cancel", notes);

export const getShipments = async ({ status = "" } = {}) => {
  const params = new URLSearchParams();

  if (status) {
    params.append("status", status);
  }

  const response = await fetch(`${API_BASE_URL}/shipments${params.toString() ? `?${params.toString()}` : ""}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getShipmentById = async (shipmentId) => {
  const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const createShipment = async ({ orderId, trackingNumber = "", carrier = "", notes = "" }) => {
  const response = await fetch(`${API_BASE_URL}/shipments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      orderId,
      trackingNumber,
      carrier,
      notes
    })
  });

  return handleResponse(response);
};

export const updateShipmentStatus = async (shipmentId, status) => {
  const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  return handleResponse(response);
};

export const updateShipmentTracking = async (shipmentId, { trackingNumber, carrier = "", notes = "" }) => {
  const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/tracking`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      trackingNumber,
      carrier,
      notes
    })
  });

  return handleResponse(response);
};

export const downloadOrderInvoicePdf = async (orderId) => {
  const token = getStoredToken();
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice-pdf`, {
    headers
  });

  if (!response.ok) {
    const responseText = await response.text();
    let message = "Failed to download invoice";

    try {
      const parsed = responseText ? JSON.parse(responseText) : {};
      message = parsed.message || message;
    } catch (_error) {
      // ignore parse failure
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = `invoice-order-${orderId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
};
