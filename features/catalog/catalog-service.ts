import "server-only";

import { CATALOG_PAGE_SIZE, catalogProducts } from "@/constants/catalog";
import type { CatalogPreset, CatalogProduct, CatalogQuery, CatalogResponse } from "@/types/catalog";

function discountOf(product: CatalogProduct): number {
  return product.compareAt && product.compareAt > product.price ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
}

function includesSearch(product: CatalogProduct, query: string): boolean {
  if (!query) return true;
  const haystack = [product.name, product.brand, product.category, product.condition, ...product.colors].filter(Boolean).join(" ").toLocaleLowerCase("id");
  return query.toLocaleLowerCase("id").split(/\s+/).every((term) => haystack.includes(term));
}

export async function getCatalogProducts(query: CatalogQuery, preset: CatalogPreset = {}): Promise<CatalogResponse> {
  const filtered = catalogProducts.filter((product) => {
    if (!includesSearch(product, query.q)) return false;
    if (preset.categories?.length && !preset.categories.includes(product.categorySlug)) return false;
    if (preset.brands?.length && !preset.brands.includes(product.brandSlug)) return false;
    if (preset.conditions?.length && !preset.conditions.includes(product.conditionType)) return false;
    if (preset.onlyNew && product.badge !== "New") return false;
    if (preset.onSale && discountOf(product) === 0) return false;
    if (query.categories.length && !query.categories.includes(product.categorySlug)) return false;
    if (query.brands.length && !query.brands.includes(product.brandSlug)) return false;
    if (query.conditions.length && !query.conditions.includes(product.conditionType)) return false;
    if (product.price < query.minPrice || product.price > query.maxPrice) return false;
    if (query.colors.length && !query.colors.some((color) => product.colors.includes(color))) return false;
    if (query.sizes.length && !query.sizes.some((size) => product.sizes.includes(size))) return false;
    if (query.inStock && product.stock < 1) return false;
    if (discountOf(product) < query.minDiscount) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (query.sort === "best-selling") return b.salesCount - a.salesCount;
    if (query.sort === "price-asc") return a.price - b.price;
    if (query.sort === "price-desc") return b.price - a.price;
    if (query.sort === "discount-desc") return discountOf(b) - discountOf(a);
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * CATALOG_PAGE_SIZE;
  const recommendations = catalogProducts.filter((product) => product.stock > 0 && !filtered.some((item) => item.id === product.id)).sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);

  return { items: filtered.slice(start, start + CATALOG_PAGE_SIZE), recommendations, total: filtered.length, page, totalPages, pageSize: CATALOG_PAGE_SIZE };
}

