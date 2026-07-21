import type { Prisma } from "@/generated/prisma/client";
import type { CatalogProduct } from "@/types/catalog";

export const productWithRelations = {
  category: true,
  brand: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { where: { isActive: true }, include: { inventory: true, _count: { select: { orderItems: true } } } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productWithRelations }>;

export function toCatalogProduct(product: ProductWithRelations): CatalogProduct {
  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const alternate = product.images.find((image) => image.id !== primary?.id) ?? primary;
  const stock = product.variants.reduce((total, variant) => total + Math.max(0, (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0)), 0);
  const condition = product.conditionLabel && ["Pristine", "Excellent", "Very Good"].includes(product.conditionLabel) ? product.conditionLabel as CatalogProduct["condition"] : undefined;
  return {
    id: product.id,
    slug: product.slug,
    brand: product.brand.name,
    brandSlug: product.brand.slug,
    name: product.name,
    category: product.category.name,
    categorySlug: product.category.slug,
    price: Number(product.price),
    compareAt: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    image: primary?.url ?? "/images/storefront/product-shoulder-bag.png",
    hoverImage: alternate?.url ?? primary?.url ?? "/images/storefront/product-shoulder-bag.png",
    badge: stock < 1 ? "Sold Out" : product.condition === "PRELOVED" ? "Preloved" : product.compareAtPrice && product.compareAtPrice.greaterThan(product.price) ? "Sale" : product.isNewArrival ? "New" : undefined,
    condition,
    conditionType: product.condition === "PRELOVED" ? "preloved" : "new",
    soldOut: stock < 1,
    colors: [...new Set(product.variants.map((variant) => variant.color).filter((value): value is string => Boolean(value)))],
    sizes: [...new Set(product.variants.map((variant) => variant.size).filter((value): value is string => Boolean(value)))],
    stock,
    createdAt: product.createdAt.toISOString(),
    salesCount: product.variants.reduce((total, variant) => total + variant._count.orderItems, 0),
    variants: product.variants.map((variant) => ({ id: variant.id, sku: variant.sku, name: variant.name, color: variant.color, colorHex: variant.colorHex, size: variant.size, price: Number(variant.price ?? product.price), stock: Math.max(0, (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0)) })),
  };
}

export function toProductDetail(product: ProductWithRelations) {
  return {
    ...toCatalogProduct(product),
    sku: product.baseSku,
    shortDescription: product.shortDescription,
    description: product.description,
    completeness: product.completeness,
    flawNotes: product.flawNotes,
    purchaseYear: product.purchaseYear,
    authenticationStatus: product.authenticationStatus,
    material: product.material,
    origin: product.origin,
    images: product.images.map((image) => ({ id: image.id, url: image.url, alt: image.alt, width: image.width, height: image.height })),
  };
}
