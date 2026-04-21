/**
 * Instance Axios centralisée.
 * - Injecte automatiquement le token JWT dans chaque requête
 * - Redirige vers /login en cas de 401
 */
import axios, { AxiosError } from "axios";
import { API_BASE_URL, TOKEN_KEY } from "@/config/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor : injecter le Bearer token ──────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor : gérer 401 globalement ────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Redirection douce sans rechargement complet si possible
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
