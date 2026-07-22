import "server-only";
import { cache } from "react";
import { CATALOG_PAGE_SIZE } from "@/constants/catalog";
import { backendApi } from "@/lib/backend-api";
import { queryToSearchParams } from "@/lib/catalog-query";
import type { CatalogPreset, CatalogProduct, CatalogQuery, CatalogResponse } from "@/types/catalog";
import type { Testimonial } from "@/types/storefront";

export type ProductDetail = CatalogProduct & { sku: string; shortDescription: string | null; description: string; completeness: string | null; flawNotes: string | null; purchaseYear: number | null; authenticationStatus: string | null; material: string | null; origin: string | null; images: Array<{ id: string; url: string; alt: string; width: number; height: number }> };
type HomeData = { newArrivals: CatalogProduct[]; prelovedProducts: CatalogProduct[]; brands: Array<{ name: string; slug: string }>; banner: { eyebrow: string | null; title: string; body: string | null; imageUrl: string } | null; testimonials: Testimonial[]; sections: Array<{ key: string; isVisible: boolean; sortOrder: number }> };

export async function listProducts(query: CatalogQuery, preset: CatalogPreset = {}): Promise<CatalogResponse> {
  const params = queryToSearchParams(query);
  if (!query.categories.length && preset.categories?.length) params.set("category", preset.categories.join(","));
  if (!query.brands.length && preset.brands?.length) params.set("brand", preset.brands.join(","));
  if (!query.conditions.length && preset.conditions?.length) params.set("condition", preset.conditions.join(","));
  if (preset.onlyNew) params.set("onlyNew", "1"); if (preset.onSale) params.set("onSale", "1");
  const result = await backendApi<CatalogProduct[]>(`/products?${params}`);
  const total = Number(result.meta?.total ?? result.data.length); const page = Number(result.meta?.page ?? query.page); const pageSize = Number(result.meta?.pageSize ?? CATALOG_PAGE_SIZE); const totalPages = Number(result.meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize)));
  return { items: result.data, recommendations: result.data.filter((product) => product.stock > 0).slice(0, 4), total, page, pageSize, totalPages };
}

export const findProductBySlug = cache(async (slug: string) => { try { return (await backendApi<ProductDetail>(`/products/${encodeURIComponent(slug)}`)).data; } catch { return null; } });
export const findCategoryBySlug = cache(async (slug: string) => { try { return (await backendApi<{ name: string; slug: string; description: string | null }>(`/categories/${encodeURIComponent(slug)}`)).data; } catch { return null; } });
export const findBrandBySlug = cache(async (slug: string) => { try { return (await backendApi<{ name: string; slug: string; description: string | null }>(`/brands/${encodeURIComponent(slug)}`)).data; } catch { return null; } });
export async function featuredProducts(limit = 8) { return (await backendApi<CatalogProduct[]>(`/storefront/featured?limit=${Math.min(limit, 24)}`)).data; }
export async function productsForHome() { return (await backendApi<HomeData>("/storefront/home", { next: { revalidate: 300 } })).data; }
export async function relatedProducts(categorySlug: string, excludeId: string, limit = 4) { return (await backendApi<CatalogProduct[]>(`/storefront/related?category=${encodeURIComponent(categorySlug)}&excludeId=${encodeURIComponent(excludeId)}&limit=${limit}`)).data; }
