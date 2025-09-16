import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  // baseUrl: "http://localhost:4001",
  // baseUrl: "https://backend.webschema.online",
  baseUrl: "https://backend-photography.webschema.online",
  credentials: "include",
});
/* فثسف */
export const api = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "Plan", "Time", "User", "Status", "Category"],

  endpoints: () => ({}),
});
