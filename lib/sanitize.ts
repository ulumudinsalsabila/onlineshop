export function sanitizeText(value: string, maxLength = 500) {
  return value
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 120);
}
