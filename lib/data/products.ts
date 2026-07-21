import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";

import type { Prisma } from "@/generated/prisma/client";
import { CATALOG_PAGE_SIZE } from "@/constants/catalog";
import { prisma } from "@/lib/prisma";
import { isMockDataMode } from "@/lib/env";
import type { CatalogPreset, CatalogProduct, CatalogQuery, CatalogResponse } from "@/types/catalog";

import { productWithRelations, toCatalogProduct, toProductDetail } from "./product-dto";
import {
  findMockBrandBySlug,
  findMockCategoryBySlug,
  findMockProductBySlug,
  listMockProducts,
  mockFeaturedProducts,
  mockProductsForHome,
  mockRelatedProducts,
} from "./mock-products";

function discountOf(product: CatalogProduct) {
  return product.compareAt && product.compareAt > product.price ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
}

function createWhere(query: CatalogQuery, preset: CatalogPreset): Prisma.ProductWhereInput {
  const conditions = query.conditions.length ? query.conditions.map((condition) => condition.toUpperCase() as "NEW" | "PRELOVED") : preset.conditions?.map((condition) => condition.toUpperCase() as "NEW" | "PRELOVED");
  return {
    deletedAt: null,
    status: "ACTIVE",
    ...(query.q ? { OR: [{ name: { contains: query.q, mode: "insensitive" } }, { description: { contains: query.q, mode: "insensitive" } }, { brand: { name: { contains: query.q, mode: "insensitive" } } }] } : {}),
    category: { isActive: true, deletedAt: null, ...(query.categories.length ? { slug: { in: query.categories } } : preset.categories?.length ? { slug: { in: preset.categories } } : {}) },
    brand: { isActive: true, deletedAt: null, ...(query.brands.length ? { slug: { in: query.brands } } : preset.brands?.length ? { slug: { in: preset.brands } } : {}) },
    ...(conditions?.length ? { condition: { in: conditions } } : {}),
    price: { gte: query.minPrice, lte: query.maxPrice },
    ...(preset.onlyNew ? { isNewArrival: true } : {}),
    ...(preset.onSale || query.minDiscount > 0 ? { compareAtPrice: { not: null } } : {}),
    ...(query.colors.length ? { variants: { some: { isActive: true, color: { in: query.colors } } } } : {}),
    ...(query.sizes.length ? { variants: { some: { isActive: true, size: { in: query.sizes } } } } : {}),
    ...(query.inStock ? { variants: { some: { isActive: true, inventory: { quantity: { gt: 0 } } } } } : {}),
  };
}

export async function listProducts(query: CatalogQuery, preset: CatalogPreset = {}): Promise<CatalogResponse> {
  if (isMockDataMode) return listMockProducts(query, preset);
  const where = createWhere(query, preset);
  const databaseOrder = query.sort === "price-asc" ? { price: "asc" as const } : query.sort === "price-desc" ? { price: "desc" as const } : query.sort === "newest" ? { createdAt: "desc" as const } : null;
  if (databaseOrder && query.minDiscount === 0) {
    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
    const page = Math.min(query.page, totalPages);
    const records = await prisma.product.findMany({ where, include: productWithRelations, orderBy: databaseOrder, skip: (page - 1) * CATALOG_PAGE_SIZE, take: CATALOG_PAGE_SIZE });
    const recommendations = total === 0 ? await recommendationProducts() : [];
    return { items: records.map(toCatalogProduct), recommendations, total, page, totalPages, pageSize: CATALOG_PAGE_SIZE };
  }
  const records = await prisma.product.findMany({ where, include: productWithRelations, take: 300 });
  const products = records.map(toCatalogProduct).filter((product) => discountOf(product) >= query.minDiscount);
  products.sort((a, b) => {
    if (query.sort === "best-selling") return b.salesCount - a.salesCount;
    if (query.sort === "price-asc") return a.price - b.price;
    if (query.sort === "price-desc") return b.price - a.price;
    if (query.sort === "discount-desc") return discountOf(b) - discountOf(a);
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
  const totalPages = Math.max(1, Math.ceil(products.length / CATALOG_PAGE_SIZE));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * CATALOG_PAGE_SIZE;
  const recommendations = products.length ? products.filter((product) => product.stock > 0).slice(0, 4) : await recommendationProducts();
  return { items: products.slice(start, start + CATALOG_PAGE_SIZE), recommendations, total: products.length, page, totalPages, pageSize: CATALOG_PAGE_SIZE };
}

async function recommendationProducts() {
  const records = await prisma.product.findMany({ where: { status: "ACTIVE", deletedAt: null, variants: { some: { inventory: { quantity: { gt: 0 } } } } }, include: productWithRelations, orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }], take: 4 });
  return records.map(toCatalogProduct);
}

export const findProductBySlug = cache(async (slug: string) => {
  if (isMockDataMode) return findMockProductBySlug(slug);
  const product = await prisma.product.findFirst({ where: { slug, status: "ACTIVE", deletedAt: null }, include: productWithRelations });
  return product ? toProductDetail(product) : null;
});

export const findCategoryBySlug = cache((slug: string) => isMockDataMode ? Promise.resolve(findMockCategoryBySlug(slug)) : prisma.category.findFirst({ where: { slug, isActive: true, deletedAt: null }, select: { name: true, slug: true, description: true } }));
export const findBrandBySlug = cache((slug: string) => isMockDataMode ? Promise.resolve(findMockBrandBySlug(slug)) : prisma.brand.findFirst({ where: { slug, isActive: true, deletedAt: null }, select: { name: true, slug: true, description: true } }));

export async function featuredProducts(limit = 8) {
  if (isMockDataMode) return mockFeaturedProducts(limit);
  const products = await prisma.product.findMany({ where: { status: "ACTIVE", deletedAt: null, isFeatured: true }, include: productWithRelations, orderBy: { publishedAt: "desc" }, take: Math.min(limit, 24) });
  return products.map(toCatalogProduct);
}

const loadProductsForHome = async () => {
  const now = new Date();
  const [newRecords, prelovedRecords, brands, banner, testimonials, sections] = await prisma.$transaction([
    prisma.product.findMany({ where: { status: "ACTIVE", deletedAt: null, isNewArrival: true }, include: productWithRelations, orderBy: { publishedAt: "desc" }, take: 8 }),
    prisma.product.findMany({ where: { status: "ACTIVE", deletedAt: null, condition: "PRELOVED" }, include: productWithRelations, orderBy: { publishedAt: "desc" }, take: 8 }),
    prisma.brand.findMany({ where: { isActive: true, deletedAt: null }, orderBy: [{ isFeatured: "desc" }, { name: "asc" }], take: 12, select: { name: true, slug: true } }),
    prisma.banner.findFirst({ where: { placement: "HOME_HERO", isActive: true, deletedAt: null, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] }, orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ where: { isActive: true, deletedAt: null }, orderBy: { sortOrder: "asc" }, take: 8 }),
    prisma.homepageSection.findMany({ select: { key: true, isVisible: true, sortOrder: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { newArrivals: newRecords.map(toCatalogProduct), prelovedProducts: prelovedRecords.map(toCatalogProduct), brands, banner, testimonials, sections };
};

const cachedProductsForHome = unstable_cache(loadProductsForHome, ["storefront-home"], { revalidate: 300, tags: ["homepage", "products"] });

export async function productsForHome() {
  return isMockDataMode ? mockProductsForHome() : cachedProductsForHome();
}

export async function relatedProducts(categorySlug: string, excludeId: string, limit = 4) {
  if (isMockDataMode) return mockRelatedProducts(categorySlug, excludeId, limit);
  const products = await prisma.product.findMany({ where: { status: "ACTIVE", deletedAt: null, id: { not: excludeId }, category: { slug: categorySlug } }, include: productWithRelations, orderBy: { publishedAt: "desc" }, take: limit });
  return products.map(toCatalogProduct);
}
