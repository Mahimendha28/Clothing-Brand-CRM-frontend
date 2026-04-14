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
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const registerUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const loginUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const getUserProfile = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const updateUserProfile = async (userId, payload) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const getUserAddresses = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const createUserAddress = async (userId, payload) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateUserAddress = async (addressId, payload) => {
  const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const deleteUserAddress = async (addressId) => {
  const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getUsers = async ({ role = "", status = "" } = {}) => {
  const params = new URLSearchParams();

  if (role) {
    params.append("role", role);
  }

  if (status) {
    params.append("status", status);
  }

  const queryString = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/users${queryString ? `?${queryString}` : ""}`,
    {
      headers: getAuthHeaders()
    }
  );

  return handleResponse(response);
};

export const createAdminUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateAdminUserStatus = async (userId, status) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  return handleResponse(response);
};

export const getCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const createCategory = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateCategory = async (categoryId, payload) => {
  const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const deleteCategory = async (categoryId) => {
  const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getBrands = async () => {
  const response = await fetch(`${API_BASE_URL}/brands`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const createBrand = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/brands`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateBrand = async (brandId, payload) => {
  const response = await fetch(`${API_BASE_URL}/brands/${brandId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const deleteBrand = async (brandId) => {
  const response = await fetch(`${API_BASE_URL}/brands/${brandId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getProductById = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const createProduct = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateProduct = async (productId, payload) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateProductStatus = async (productId, status) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  return handleResponse(response);
};

export const deleteProduct = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const getProductVariants = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/variants`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const createProductVariant = async (productId, payload) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/variants`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateVariant = async (variantId, payload) => {
  const response = await fetch(`${API_BASE_URL}/variants/${variantId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateVariantStatus = async (variantId, status) => {
  const response = await fetch(`${API_BASE_URL}/variants/${variantId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  return handleResponse(response);
};

export const deleteVariant = async (variantId) => {
  const response = await fetch(`${API_BASE_URL}/variants/${variantId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

export const uploadProductImage = async (productId, file) => {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  return handleResponse(response);
};

export const deleteProductImage = async (productId, imageId) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};
