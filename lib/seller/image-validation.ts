const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_CONSIGNMENT_IMAGE_BYTES = 5 * 1024 * 1024;

export function inspectImage(bytes: Uint8Array, declaredType: string) {
  if (!allowedTypes.has(declaredType)) throw new Error("IMAGE_TYPE_NOT_ALLOWED");
  if (!bytes.length || bytes.length > MAX_CONSIGNMENT_IMAGE_BYTES) throw new Error("IMAGE_SIZE_INVALID");
  let detected: "image/png" | "image/jpeg" | "image/webp"; let dimensions: { width: number; height: number } | null = null;
  if (isPng(bytes)) { detected = "image/png"; dimensions = { width: readU32(bytes, 16), height: readU32(bytes, 20) }; }
  else if (isJpeg(bytes)) { detected = "image/jpeg"; dimensions = jpegDimensions(bytes); }
  else if (isWebp(bytes)) { detected = "image/webp"; dimensions = webpDimensions(bytes); }
  else throw new Error("IMAGE_SIGNATURE_INVALID");
  if (detected !== declaredType || !dimensions) throw new Error("IMAGE_CONTENT_INVALID");
  if (dimensions.width < 600 || dimensions.height < 600 || dimensions.width > 8000 || dimensions.height > 8000) throw new Error("IMAGE_DIMENSIONS_INVALID");
  return { mimeType: detected, ...dimensions, sizeBytes: bytes.length, extension: detected === "image/jpeg" ? "jpg" : detected.split("/")[1] };
}
function isPng(b: Uint8Array) { return b.length > 24 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => b[index] === value); }
function isJpeg(b: Uint8Array) { return b.length > 4 && b[0] === 0xff && b[1] === 0xd8; }
function isWebp(b: Uint8Array) { return b.length > 30 && text(b, 0, 4) === "RIFF" && text(b, 8, 12) === "WEBP"; }
function readU32(b: Uint8Array, offset: number) { return ((b[offset] << 24) | (b[offset + 1] << 16) | (b[offset + 2] << 8) | b[offset + 3]) >>> 0; }
function text(b: Uint8Array, start: number, end: number) { return String.fromCharCode(...b.slice(start, end)); }
function jpegDimensions(b: Uint8Array) { let i = 2; while (i + 8 < b.length) { if (b[i] !== 0xff) { i += 1; continue; } const marker = b[i + 1]; const length = (b[i + 2] << 8) + b[i + 3]; if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { height: (b[i + 5] << 8) + b[i + 6], width: (b[i + 7] << 8) + b[i + 8] }; if (length < 2) break; i += 2 + length; } return null; }
function webpDimensions(b: Uint8Array) { const chunk = text(b, 12, 16); if (chunk === "VP8X") return { width: 1 + b[24] + (b[25] << 8) + (b[26] << 16), height: 1 + b[27] + (b[28] << 8) + (b[29] << 16) }; return null; }
