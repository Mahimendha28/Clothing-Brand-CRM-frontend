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

const productService = {
    getCategories: async () => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    getSubcategories: async (categoryId) => {
        const response = await fetch(`${API_BASE_URL}/subcategories?categoryId=${categoryId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    getTypes: async (subcategoryId) => {
        const response = await fetch(`${API_BASE_URL}/types?subcategoryId=${subcategoryId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    createProduct: async (productData) => {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });
        return handleResponse(response);
    }
};

export default productService;

