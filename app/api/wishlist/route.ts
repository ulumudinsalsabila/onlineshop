import { z } from "zod";

import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { productWithRelations, toCatalogProduct } from "@/lib/data/product-dto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: authResult.user.id }, include: { items: { orderBy: { createdAt: "desc" }, include: { product: { include: productWithRelations } } } } });
    return apiSuccess({ id: wishlist?.id ?? null, items: wishlist?.items.map((item) => ({ id: item.id, product: toCatalogProduct(item.product), createdAt: item.createdAt })) ?? [] });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const { productId } = z.object({ productId: z.string().cuid() }).parse(await request.json());
    const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE", deletedAt: null }, select: { id: true } });
    if (!product) return apiError("NOT_FOUND", "Produk tidak ditemukan.", 404);
    const wishlist = await prisma.wishlist.upsert({ where: { userId: authResult.user.id }, update: {}, create: { userId: authResult.user.id } });
    const item = await prisma.wishlistItem.upsert({ where: { wishlistId_productId: { wishlistId: wishlist.id, productId } }, update: {}, create: { wishlistId: wishlist.id, productId } });
    return apiSuccess(item, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
