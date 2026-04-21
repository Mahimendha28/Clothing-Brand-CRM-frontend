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

export const formatCatalogPrice = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(Number(value || 0));

export const buildCatalogImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
};

export const getStoreFilters = async () => {
  const response = await fetch(`${API_BASE_URL}/store/filters`);
  return handleResponse(response);
};

export const getStoreProducts = async ({
  category = "",
  subcategory = "",
  type = "",
  brand = "",
  size = "",
  color = "",
  search = "",
  limit = ""
} = {}) => {
  const params = new URLSearchParams();

  if (category) {
    params.append("category", category);
  }

  if (brand) {
    params.append("brand", brand);
  }

  if (subcategory) {
    params.append("subcategory", subcategory);
  }

  if (type) {
    params.append("type", type);
  }

  if (size) {
    params.append("size", size);
  }

  if (color) {
    params.append("color", color);
  }

  if (search) {
    params.append("search", search);
  }

  if (limit) {
    params.append("limit", String(limit));
  }

  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/store/products${queryString ? `?${queryString}` : ""}`);
  return handleResponse(response);
};

export const getStoreProductBySlug = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/store/products/${slug}`);
  return handleResponse(response);
};
