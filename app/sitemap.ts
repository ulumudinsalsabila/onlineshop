import type { MetadataRoute } from "next";

import { catalogBrands, catalogCategories, catalogProducts } from "@/constants/catalog";
import { isMockDataMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/new-arrivals"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/preloved"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/sale"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];
  if (isMockDataMode) {
    return [
      ...staticEntries,
      ...catalogProducts.map((item) => ({ url: absoluteUrl(`/products/${item.slug}`), lastModified: new Date(item.createdAt), changeFrequency: "weekly" as const, priority: 0.8, images: [absoluteUrl(item.image)] })),
      ...catalogCategories.map((item) => ({ url: absoluteUrl(`/category/${item.value}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...catalogBrands.map((item) => ({ url: absoluteUrl(`/brand/${item.value}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ];
  }
  try {
    const [products, categories, brands] = await prisma.$transaction([
      prisma.product.findMany({ where: { status: "ACTIVE", deletedAt: null }, select: { slug: true, updatedAt: true, images: { where: { isPrimary: true }, select: { url: true }, take: 1 } } }),
      prisma.category.findMany({ where: { isActive: true, deletedAt: null }, select: { slug: true, updatedAt: true } }),
      prisma.brand.findMany({ where: { isActive: true, deletedAt: null }, select: { slug: true, updatedAt: true } }),
    ]);
    return [...staticEntries, ...products.map((item) => ({ url: absoluteUrl(`/products/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.8, images: item.images.map((image) => absoluteUrl(image.url)) })), ...categories.map((item) => ({ url: absoluteUrl(`/category/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })), ...brands.map((item) => ({ url: absoluteUrl(`/brand/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 }))];
  } catch {
    return staticEntries;
  }
}
