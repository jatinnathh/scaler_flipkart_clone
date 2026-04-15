const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const { token, ...fetchOptions } = options || {};

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || errorData.message || `API Error: ${res.status}`);
  }

  return res.json();
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, token?: string | null) =>
    apiFetch<T>(endpoint, { method: "GET", token }),

  post: <T = any>(endpoint: string, data?: any, token?: string | null) =>
    apiFetch<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      token,
    }),

  patch: <T = any>(endpoint: string, data?: any, token?: string | null) =>
    apiFetch<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      token,
    }),

  delete: <T = any>(endpoint: string, token?: string | null) =>
    apiFetch<T>(endpoint, { method: "DELETE", token }),
};
