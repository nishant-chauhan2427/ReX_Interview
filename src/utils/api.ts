// // export const API_BASE = "https://rex.vayuz.com/ai-interview/api/v1";
// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// // export const API_BASE = "http://localhost:8000/ai-interview/api/v1";

// // Fetch with timeout to avoid hanging UI when backend is down
// async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, { ...options, signal: controller.signal });
//     console.log("API Response:", res);
//     return res;
//   } catch (e) {
//     if (e.name === "AbortError") {
//       throw new Error(
//         `Request timed out. Cannot reach backend at ${API_BASE}. Please start the server.`,
//       );
//     }
//     // Network or CORS failure
//     throw new Error(
//       `Cannot reach backend at ${API_BASE}. Please start the server.`,
//     );
//   } finally {
//     clearTimeout(id);
//   }
// }

// export async function postForm(endpoint, formData) {
//   const res = await fetchWithTimeout(`${API_BASE}${endpoint}`, {
//     method: "POST",
//     body: formData,
//   });
//   const contentType = res.headers.get("content-type") || "";
//   const payload = contentType.includes("application/json")
//     ? await res.json().catch(() => ({}))
//     : await res.text();
//   if (!res.ok)
//     throw new Error(
//       payload?.error ||
//         payload?.detail ||
//         (typeof payload === "string" && payload) ||
//         "Request failed",
//     );
//   return payload;
// }

// export async function postJSON(endpoint, data) {
//   console.log("hello");
//   const res = await fetchWithTimeout(`${API_BASE}${endpoint}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
//   const payload = await res.json().catch(() => ({}));
//   if (!res.ok) {
//     throw new Error(payload?.detail || payload?.error || "Request failed");
//   }
//   return payload;
// }

// export async function getJSON(endpoint) {
//   const res = await fetchWithTimeout(`${API_BASE}${endpoint}`, {
//     method: "GET",
//   });
//   const contentType = res.headers.get("content-type") || "";
//   const payload = contentType.includes("application/json")
//     ? await res.json().catch(() => ({}))
//     : await res.text();
//   if (!res.ok)
//     throw new Error(
//       payload?.error ||
//         payload?.detail ||
//         (typeof payload === "string" && payload) ||
//         "Request failed",
//     );
//   return payload;
// }
import { apiClient } from "./apiClient";

/**
 * POST multipart/form-data
 */
export async function postForm<T = any>(
  endpoint: string,
  formData: FormData,
): Promise<T> {
  const res = await apiClient.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * POST JSON
 */
export async function postJSON<T = any>(
  endpoint: string,
  data: any,
): Promise<T> {
  const res = await apiClient.post(endpoint, data);
  return res.data;
}

/**
 * GET JSON
 */
export async function getJSON<T = any>(endpoint: string): Promise<T> {
  const res = await apiClient.get(endpoint);
  return res.data;
}
