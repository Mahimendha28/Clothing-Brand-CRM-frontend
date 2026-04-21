const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const handleResponse = async (response) => {
  const responseText = await response.text();
  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (_error) {
    throw new Error("Server returned an unexpected response. Please verify the backend is running correctly.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getHierarchyCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`);
  return handleResponse(response);
};

export const getHierarchySubcategories = async (categoryId = "") => {
  const params = new URLSearchParams();
  if (categoryId) {
    params.append("categoryId", String(categoryId));
  }

  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/subcategories${queryString ? `?${queryString}` : ""}`);
  return handleResponse(response);
};

export const getHierarchyTypes = async (subcategoryId = "") => {
  const params = new URLSearchParams();
  if (subcategoryId) {
    params.append("subcategoryId", String(subcategoryId));
  }

  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/types${queryString ? `?${queryString}` : ""}`);
  return handleResponse(response);
};
