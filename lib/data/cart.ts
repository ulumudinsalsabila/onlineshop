import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

export const cartInclude = {
  items: { orderBy: { createdAt: "asc" as const }, include: { variant: { include: { inventory: true, product: { include: { brand: true, images: { orderBy: { sortOrder: "asc" as const }, take: 1 } } } } } } },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

export function serializeCart(cart: CartWithItems | null) {
  const items = cart?.items.map((item) => {
    const price = item.variant.price ?? item.variant.product.price;
    const availableStock = Math.max(0, (item.variant.inventory?.quantity ?? 0) - (item.variant.inventory?.reserved ?? 0));
    return { id: item.id, variantId: item.variantId, quantity: item.quantity, availableStock, canCheckout: item.quantity <= availableStock && item.variant.isActive, unitPrice: Number(price), lineTotal: Number(price) * item.quantity, variant: { sku: item.variant.sku, name: item.variant.name, color: item.variant.color, size: item.variant.size }, product: { id: item.variant.product.id, slug: item.variant.product.slug, name: item.variant.product.name, brand: item.variant.product.brand.name, image: item.variant.product.images[0]?.url ?? null } };
  }) ?? [];
  return { id: cart?.id ?? null, items, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0), canCheckout: items.length > 0 && items.every((item) => item.canCheckout) };
}

export function findActiveCart(userId: string) {
  return prisma.cart.findUnique({ where: { activeKey: `user:${userId}` }, include: cartInclude });
}
