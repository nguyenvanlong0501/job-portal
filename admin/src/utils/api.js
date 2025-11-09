import axios from "axios";

const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: base,
  headers: { "Content-Type": "application/json" },
});

export default api;
