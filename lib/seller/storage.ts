import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";

import { env } from "@/lib/env";

export interface ConsignmentImageStorage { save(input: { bytes: Uint8Array; extension: string }): Promise<{ url: string; storageKey: string }> }
export class LocalConsignmentImageStorage implements ConsignmentImageStorage { async save(input: { bytes: Uint8Array; extension: string }) { const name = `${randomUUID()}.${input.extension}`; const relative = path.join("uploads", "consignments", name); const directory = path.join(process.cwd(), "public", "uploads", "consignments"); await mkdir(directory, { recursive: true }); await writeFile(path.join(directory, name), input.bytes); return { url: `/${relative.replaceAll("\\", "/")}`, storageKey: relative }; } }

export class CloudinaryConsignmentImageStorage implements ConsignmentImageStorage {
  constructor(private config: { cloudName: string; apiKey: string; apiSecret: string }) {}
  async save(input: { bytes: Uint8Array; extension: string }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "ivory/consignments";
    const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${this.config.apiSecret}`).digest("hex");
    const form = new FormData();
    form.set("file", new Blob([Buffer.from(input.bytes)], { type: `image/${input.extension === "jpg" ? "jpeg" : input.extension}` }), `consignment.${input.extension}`);
    form.set("api_key", this.config.apiKey); form.set("timestamp", String(timestamp)); form.set("folder", folder); form.set("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(this.config.cloudName)}/image/upload`, { method: "POST", body: form });
    const result = await response.json() as { secure_url?: string; public_id?: string };
    if (!response.ok || !result.secure_url || !result.public_id) throw new Error("IMAGE_STORAGE_FAILED");
    return { url: result.secure_url, storageKey: result.public_id };
  }
}

export function getConsignmentImageStorage() {
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) return new CloudinaryConsignmentImageStorage({ cloudName: env.CLOUDINARY_CLOUD_NAME, apiKey: env.CLOUDINARY_API_KEY, apiSecret: env.CLOUDINARY_API_SECRET });
  return new LocalConsignmentImageStorage();
}
