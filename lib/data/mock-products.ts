import "server-only";

import {
  CATALOG_PAGE_SIZE,
  catalogBrands,
  catalogCategories,
  catalogProducts,
} from "@/constants/catalog";
import { testimonials } from "@/constants/home";
import type {
  CatalogPreset,
  CatalogProduct,
  CatalogQuery,
  CatalogResponse,
} from "@/types/catalog";

function discountOf(product: CatalogProduct) {
  return product.compareAt && product.compareAt > product.price
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
}

function matchesQuery(product: CatalogProduct, query: CatalogQuery, preset: CatalogPreset) {
  const text = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
  const categories = query.categories.length ? query.categories : (preset.categories ?? []);
  const brands = query.brands.length ? query.brands : (preset.brands ?? []);
  const conditions = query.conditions.length ? query.conditions : (preset.conditions ?? []);

  return (
    (!query.q || text.includes(query.q.toLowerCase())) &&
    (!categories.length || categories.includes(product.categorySlug)) &&
    (!brands.length || brands.includes(product.brandSlug)) &&
    (!conditions.length || conditions.includes(product.conditionType)) &&
    product.price >= query.minPrice &&
    product.price <= query.maxPrice &&
    (!query.colors.length || query.colors.some((color) => product.colors.includes(color))) &&
    (!query.sizes.length || query.sizes.some((size) => product.sizes.includes(size))) &&
    (!query.inStock || product.stock > 0) &&
    (!preset.onlyNew || product.badge === "New") &&
    (!preset.onSale || discountOf(product) > 0) &&
    discountOf(product) >= query.minDiscount
  );
}

export function listMockProducts(query: CatalogQuery, preset: CatalogPreset = {}): CatalogResponse {
  const products = catalogProducts.filter((product) => matchesQuery(product, query, preset));
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
  const recommendations = products.length
    ? products.filter((product) => product.stock > 0).slice(0, 4)
    : catalogProducts.filter((product) => product.stock > 0).slice(0, 4);

  return {
    items: products.slice(start, start + CATALOG_PAGE_SIZE),
    recommendations,
    total: products.length,
    page,
    totalPages,
    pageSize: CATALOG_PAGE_SIZE,
  };
}

export function findMockProductBySlug(slug: string) {
  const product = catalogProducts.find((item) => item.slug === slug);
  if (!product) return null;

  const conditionDetails = product.conditionType === "preloved";
  return {
    ...product,
    sku: `IV-${product.id.toUpperCase()}`,
    shortDescription: `${product.brand} ${product.name} dalam kurasi IVORY.`,
    description: conditionDetails
      ? "Produk preloved terkurasi dengan kondisi yang diperiksa dan dijelaskan secara transparan."
      : "Produk premium terkurasi dengan material berkarakter dan proporsi yang dirancang untuk penggunaan sehari-hari.",
    completeness: conditionDetails ? "Product only, IVORY authenticity card" : null,
    flawNotes: conditionDetails ? "Tanda pemakaian ringan sesuai usia produk." : null,
    purchaseYear: conditionDetails ? 2024 : null,
    authenticationStatus: conditionDetails ? "Authenticated by IVORY" : null,
    material: "Premium materials",
    origin: "Responsibly sourced",
    images: [
      { id: `${product.id}-primary`, url: product.image, alt: product.name, width: 1254, height: 1254 },
      { id: `${product.id}-alternate`, url: product.hoverImage, alt: `${product.name}, alternate view`, width: 1254, height: 1254 },
    ],
  };
}

export function findMockCategoryBySlug(slug: string) {
  const category = catalogCategories.find((item) => item.value === slug);
  return category
    ? { name: category.label, slug: category.value, description: `Koleksi ${category.label.toLowerCase()} premium yang dikurasi oleh IVORY.` }
    : null;
}

export function findMockBrandBySlug(slug: string) {
  const brand = catalogBrands.find((item) => item.value === slug);
  return brand
    ? { name: brand.label, slug: brand.value, description: `Pilihan ${brand.label} dalam kurasi IVORY.` }
    : null;
}

export function mockFeaturedProducts(limit = 8) {
  return catalogProducts.filter((product) => product.stock > 0).slice(0, Math.min(limit, 24));
}

export function mockProductsForHome() {
  return {
    newArrivals: catalogProducts.filter((product) => product.badge === "New").slice(0, 8),
    prelovedProducts: catalogProducts.filter((product) => product.conditionType === "preloved").slice(0, 8),
    brands: catalogBrands.map((brand) => ({ name: brand.label, slug: brand.value })),
    banner: null,
    testimonials,
    sections: [],
  };
}

export function mockRelatedProducts(categorySlug: string, excludeId: string, limit = 4) {
  return catalogProducts
    .filter((product) => product.categorySlug === categorySlug && product.id !== excludeId)
    .slice(0, limit);
}
