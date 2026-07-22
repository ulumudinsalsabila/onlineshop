import { backendApiUrl } from "@/lib/api-url";

export const ACCESS_TOKEN_COOKIE = "ivory_access_token";

function normalizeApiPath(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return path.replace(/^\/api(?=\/|$)/, "") || "/";
}

/**
 * Shared transport for browser and server API calls.
 *
 * Relative paths are resolved against NEXT_PUBLIC_API_URL and credentials are
 * included by default so the backend session cookie is sent consistently.
 */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = /^https?:\/\//i.test(path) ? path : backendApiUrl(normalizeApiPath(path));
  const headers = new Headers(init.headers);
  if (!headers.has("Authorization")) {
    const token = getApiAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });
  if (response.status === 401) clearApiAccessToken();
  return response;
}

export function getApiAccessToken() {
  if (typeof window === "undefined") return null;
  const prefix = `${ACCESS_TOKEN_COOKIE}=`;
  const encoded = document.cookie.split("; ").find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
  return encoded ? decodeURIComponent(encoded) : null;
}

export function setApiAccessToken(token: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax${secure}`;
}

export function clearApiAccessToken() {
  if (typeof document !== "undefined") document.cookie = `${ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
