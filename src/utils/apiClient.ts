import axios, { AxiosError } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Central axios instance
 */
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 6000, // replaces fetchWithTimeout
  withCredentials: false,
});

/**
 * Global response interceptor
 * This is where ALL error normalization happens
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // ⏱ Timeout
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error(
          `Request timed out. Cannot reach backend at ${API_BASE}. Please try again.`,
        ),
      );
    }

    // 🌐 Network / CORS / server down
    if (!error.response) {
      return Promise.reject(
        new Error(
          `Cannot reach backend at ${API_BASE}. Please check your connection.`,
        ),
      );
    }

    // 🎯 Backend responded with error
    const data = error.response.data as any;

    const message =
      data?.error ||
      data?.detail ||
      data?.message ||
      "Request failed";

    return Promise.reject(new Error(message));
  },
);
