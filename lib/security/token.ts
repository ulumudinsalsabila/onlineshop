import { createHash, randomBytes } from "node:crypto";

export function createSecureToken() {
  const raw = randomBytes(32).toString("base64url");
  return { raw, digest: digestToken(raw) };
}

export function digestToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}
