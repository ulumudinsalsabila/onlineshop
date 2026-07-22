import "server-only";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, apiFetch } from "@/lib/api-client";
import { reviveDates } from "@/lib/backend-api";

type ApiResult<T> = { success: true; data: T; meta?: Record<string, unknown> } | { success: false; error: { code: string; message: string } };

export async function authenticatedBackendApi<T>(path: string, init?: RequestInit): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const headers = new Headers(init?.headers);
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? cookieStore.get("ivory_session")?.value;
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  const response = await apiFetch(path, { ...init, headers });
  const result = await response.json() as ApiResult<T>;
  if (!response.ok || !result.success) throw new Error(!result.success ? result.error.message : `Backend request failed (${response.status}).`);
  return { data: reviveDates(result.data), meta: result.meta };
}
