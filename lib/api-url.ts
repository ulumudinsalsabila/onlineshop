const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");

export function backendApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!configuredApiUrl) throw new Error("NEXT_PUBLIC_API_URL wajib dikonfigurasi.");
  return `${configuredApiUrl}${normalizedPath}`;
}
