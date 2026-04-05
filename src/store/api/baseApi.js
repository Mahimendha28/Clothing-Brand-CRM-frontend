import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getStoredToken } from "../../utils/auth";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
    prepareHeaders: (headers) => {
      const token = getStoredToken();

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    }
  }),
  endpoints: () => ({})
});

export default baseApi;
