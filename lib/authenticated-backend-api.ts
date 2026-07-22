import "server-only";

import { cookies } from "next/headers";
import { backendApiUrl } from "@/lib/api-url";
import { reviveDates } from "@/lib/backend-api";

type ApiResult<T> = { success: true; data: T; meta?: Record<string, unknown> } | { success: false; error: { code: string; message: string } };

export async function authenticatedBackendApi<T>(path: string, init?: RequestInit): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const headers = new Headers(init?.headers);
  const cookieHeader = (await cookies()).toString();
  if (cookieHeader) headers.set("cookie", cookieHeader);
  const response = await fetch(backendApiUrl(path), { ...init, headers, credentials: "include" });
  const result = await response.json() as ApiResult<T>;
  if (!response.ok || !result.success) throw new Error(!result.success ? result.error.message : `Backend request failed (${response.status}).`);
  return { data: reviveDates(result.data), meta: result.meta };
}
