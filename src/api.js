import axios from "axios";

export const api = axios.create({ baseURL: "/" });

// attach admin token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const rupee = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
