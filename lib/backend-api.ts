import { apiFetch } from "@/lib/api-client";

type ApiResult<T> = { success: true; data: T; meta?: Record<string, unknown> } | { success: false; error: { code: string; message: string } };

export async function backendApi<T>(path: string, init?: RequestInit): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const headers = new Headers(init?.headers);
  const response = await apiFetch(path, { ...init, headers });
  const result = await response.json() as ApiResult<T>;
  if (!response.ok || !result.success) throw new Error(!result.success ? result.error.message : `Backend request failed (${response.status}).`);
  return { data: reviveDates(result.data), meta: result.meta };
}

export function reviveDates<T>(value: T): T {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return new Date(value) as T;
  if (Array.isArray(value)) return value.map(reviveDates) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, reviveDates(entry)])) as T;
  return value;
}
