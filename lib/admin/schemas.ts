import { z } from "zod";

const clean = (max: number) => z.string().trim().min(1).max(max).transform((value) => value.replace(/[<>]/g, ""));
const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value.replace(/[<>]/g, "")).optional().or(z.literal(""));
const slug = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const money = z.coerce.number().nonnegative().max(999_999_999_999);
const assetUrl = z.string().trim().max(500).refine((value) => value.startsWith("/") || /^https:\/\//i.test(value), "Gunakan path lokal atau URL HTTPS.");
const optionalAssetUrl = z.string().trim().max(500).refine((value) => !value || value.startsWith("/") || /^https:\/\//i.test(value), "Gunakan path lokal atau URL HTTPS.").optional();

export const productAdminSchema = z.object({
  name: clean(160), slug, baseSku: z.string().trim().min(2).max(80).regex(/^[A-Z0-9_-]+$/i), categoryId: z.string().cuid(), brandId: z.string().cuid(),
  description: clean(10_000), shortDescription: optionalText(300), condition: z.enum(["NEW", "PRELOVED"]), conditionLabel: optionalText(80), completeness: optionalText(300), flawNotes: optionalText(2000), authenticationStatus: optionalText(100),
  price: money, compareAtPrice: money.optional().nullable(), costPrice: money.optional().nullable(), status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]), isFeatured: z.boolean().default(false), isNewArrival: z.boolean().default(false), weightGrams: z.coerce.number().int().positive().max(100_000).optional().nullable(),
  images: z.array(z.object({ id: z.string().cuid().optional(), url: assetUrl, alt: clean(180), width: z.coerce.number().int().positive().default(1200), height: z.coerce.number().int().positive().default(1500), isPrimary: z.boolean().default(false) })).min(1).max(12),
  variants: z.array(z.object({ id: z.string().cuid().optional(), sku: z.string().trim().min(2).max(80).regex(/^[A-Z0-9_-]+$/i), name: clean(100), color: optionalText(60), colorHex: z.string().regex(/^#[0-9a-f]{6}$/i).optional().or(z.literal("")), size: optionalText(30), price: money.optional().nullable(), compareAtPrice: money.optional().nullable(), stock: z.coerce.number().int().nonnegative().max(1_000_000), lowStockAt: z.coerce.number().int().nonnegative().max(10_000).default(2), isActive: z.boolean().default(true) })).min(1).max(100),
});

export const categoryAdminSchema = z.object({ name: clean(100), slug, description: optionalText(1000), parentId: z.preprocess((value) => value === "" ? null : value, z.string().cuid().optional().nullable()), imageUrl: optionalAssetUrl.or(z.literal("")), isActive: z.boolean().default(true), sortOrder: z.coerce.number().int().min(0).max(10_000).default(0) });
export const brandAdminSchema = z.object({ name: clean(100), slug, description: optionalText(2000), logoUrl: optionalAssetUrl.or(z.literal("")), isFeatured: z.boolean().default(false), isActive: z.boolean().default(true) });
export const voucherAdminSchema = z.object({ code: z.string().trim().toUpperCase().min(3).max(40).regex(/^[A-Z0-9_-]+$/), name: clean(100), description: optionalText(500), type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]), value: money, minSpend: money.optional().nullable(), maxDiscount: money.optional().nullable(), usageLimit: z.coerce.number().int().positive().optional().nullable(), usagePerUser: z.coerce.number().int().positive().max(100).default(1), startsAt: z.coerce.date(), endsAt: z.coerce.date(), isActive: z.boolean().default(true) }).refine((data) => data.endsAt > data.startsAt, { path: ["endsAt"], message: "Tanggal selesai harus setelah tanggal mulai." });
export const bannerAdminSchema = z.object({ name: clean(100), placement: clean(60), eyebrow: optionalText(100), title: clean(200), body: optionalText(1000), imageUrl: assetUrl, imageAlt: clean(180), href: z.string().trim().max(300).regex(/^(?:|\/[^\s]*|https:\/\/[^\s]+)$/i).optional().or(z.literal("")), ctaLabel: optionalText(80), isActive: z.boolean().default(true), sortOrder: z.coerce.number().int().min(0).default(0) });
export const testimonialAdminSchema = z.object({ name: clean(100), location: optionalText(100), quote: clean(2000), rating: z.coerce.number().int().min(1).max(5), isActive: z.boolean().default(true), sortOrder: z.coerce.number().int().min(0).default(0) });
export const customerStatusSchema = z.object({ isActive: z.boolean(), role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional() });
export const bulkIdsSchema = z.object({ ids: z.array(z.string().min(1).max(100)).min(1).max(100) });
