const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isTrustedMutationRequest(request: Request, publicAppUrl?: string) {
  if (!unsafeMethods.has(request.method.toUpperCase())) return true;
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const allowed = new Set<string>();
  try { allowed.add(new URL(request.url).origin); } catch { return false; }
  if (publicAppUrl) try { allowed.add(new URL(publicAppUrl).origin); } catch { return false; }
  return allowed.has(origin);
}
