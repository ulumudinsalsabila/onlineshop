const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");

export const hasBackendApi = Boolean(configuredApiUrl);

export function backendApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return configuredApiUrl ? `${configuredApiUrl}${normalizedPath}` : normalizedPath;
}

type ApiResult<T> = { success: true; data: T; meta?: Record<string, unknown> } | { success: false; error: { code: string; message: string } };

export async function backendApi<T>(path: string, init?: RequestInit): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const response = await fetch(backendApiUrl(path), { ...init, credentials: "include" });
  const result = await response.json() as ApiResult<T>;
  if (!response.ok || !result.success) throw new Error(!result.success ? result.error.message : `Backend request failed (${response.status}).`);
  return { data: result.data, meta: result.meta };
}
