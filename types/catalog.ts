import type { StoreProduct } from "@/types/storefront";

export type CatalogCondition = "new" | "preloved";
export type CatalogSort = "newest" | "best-selling" | "price-asc" | "price-desc" | "discount-desc";

export interface CatalogProduct extends StoreProduct {
  categorySlug: string;
  brandSlug: string;
  conditionType: CatalogCondition;
  colors: string[];
  sizes: string[];
  stock: number;
  createdAt: string;
  salesCount: number;
}

export interface CatalogQuery {
  q: string;
  categories: string[];
  brands: string[];
  conditions: CatalogCondition[];
  minPrice: number;
  maxPrice: number;
  colors: string[];
  sizes: string[];
  inStock: boolean;
  minDiscount: number;
  sort: CatalogSort;
  page: number;
}

export interface CatalogPreset {
  categories?: string[];
  brands?: string[];
  conditions?: CatalogCondition[];
  onlyNew?: boolean;
  onSale?: boolean;
}

export interface CatalogPageConfig {
  title: string;
  description: string;
  eyebrow: string;
  breadcrumbs: { label: string; href?: string }[];
  preset?: CatalogPreset;
  lockedFilters?: Array<"category" | "brand" | "condition" | "discount">;
  searchMode?: boolean;
}

export interface CatalogResponse {
  items: CatalogProduct[];
  recommendations: CatalogProduct[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export type RawCatalogSearchParams = Record<string, string | string[] | undefined>;

