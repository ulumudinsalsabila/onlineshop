import {
  CATALOG_MAX_PRICE,
  CATALOG_MIN_PRICE,
  catalogBrands,
  catalogCategories,
  catalogColors,
  catalogSizes,
  catalogSortOptions,
} from "@/constants/catalog";
import type { CatalogCondition, CatalogQuery, RawCatalogSearchParams } from "@/types/catalog";

const validCategories = new Set<string>(catalogCategories.map((item) => item.value));
const validBrands = new Set<string>(catalogBrands.map((item) => item.value));
const validColors = new Set<string>(catalogColors.map((item) => item.value));
const validSizes = new Set<string>(catalogSizes);
const validConditions = new Set<CatalogCondition>(["new", "preloved"]);
const validSorts = new Set(catalogSortOptions.map((item) => item.value));

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function list(value: string | string[] | undefined, allowed: Set<string>): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(values.flatMap((item) => item.split(",")).map((item) => item.trim()).filter((item) => allowed.has(item)))];
}

function integer(value: string | string[] | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(first(value), 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export function parseCatalogQuery(raw: RawCatalogSearchParams): CatalogQuery {
  const sortValue = first(raw.sort);
  const minPrice = integer(raw.minPrice, CATALOG_MIN_PRICE, CATALOG_MIN_PRICE, CATALOG_MAX_PRICE);
  const maxPrice = integer(raw.maxPrice, CATALOG_MAX_PRICE, CATALOG_MIN_PRICE, CATALOG_MAX_PRICE);

  return {
    q: first(raw.q).trim().slice(0, 80),
    categories: list(raw.category, validCategories),
    brands: list(raw.brand, validBrands),
    conditions: list(raw.condition, validConditions) as CatalogCondition[],
    minPrice: Math.min(minPrice, maxPrice),
    maxPrice: Math.max(minPrice, maxPrice),
    colors: list(raw.color, validColors),
    sizes: list(raw.size, validSizes),
    inStock: first(raw.availability) === "in-stock",
    minDiscount: integer(raw.discount, 0, 0, 80),
    sort: validSorts.has(sortValue as CatalogQuery["sort"]) ? (sortValue as CatalogQuery["sort"]) : "newest",
    page: integer(raw.page, 1, 1, 999),
  };
}

export function queryToSearchParams(query: CatalogQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.categories.length) params.set("category", query.categories.join(","));
  if (query.brands.length) params.set("brand", query.brands.join(","));
  if (query.conditions.length) params.set("condition", query.conditions.join(","));
  if (query.minPrice > CATALOG_MIN_PRICE) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice < CATALOG_MAX_PRICE) params.set("maxPrice", String(query.maxPrice));
  if (query.colors.length) params.set("color", query.colors.join(","));
  if (query.sizes.length) params.set("size", query.sizes.join(","));
  if (query.inStock) params.set("availability", "in-stock");
  if (query.minDiscount > 0) params.set("discount", String(query.minDiscount));
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

