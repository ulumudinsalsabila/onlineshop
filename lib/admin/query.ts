import { z } from "zod";

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;
export async function parseAdminQuery(searchParams: AdminSearchParams) {
  const raw = await searchParams;
  return z.object({ q: z.string().trim().max(100).catch(""), page: z.coerce.number().int().min(1).max(9999).catch(1), sort: z.string().trim().max(40).catch("newest"), status: z.string().trim().max(40).catch(""), stock: z.string().trim().max(20).catch("") }).parse({ q: raw.q, page: raw.page, sort: raw.sort, status: raw.status, stock: raw.stock });
}
export const ADMIN_PAGE_SIZE = 12;
