import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { updateCartItemSchema } from "@/lib/cart-schemas";
import { cartInclude, serializeCart } from "@/lib/data/cart";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const { quantity } = updateCartItemSchema.parse(await request.json());
    const id = (await params).id;
    const cart = await prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({ where: { id, cart: { activeKey: `user:${authResult.user.id}` } }, include: { variant: { include: { inventory: true } } } });
      if (!item) throw new Error("NOT_FOUND");
      const available = (item.variant.inventory?.quantity ?? 0) - (item.variant.inventory?.reserved ?? 0);
      if (quantity > available) throw new Error("INSUFFICIENT_STOCK");
      await tx.cartItem.update({ where: { id }, data: { quantity } });
      return tx.cart.findUniqueOrThrow({ where: { id: item.cartId }, include: cartInclude });
    }, { isolationLevel: "Serializable" });
    return apiSuccess(serializeCart(cart));
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("NOT_FOUND", "Item cart tidak ditemukan.", 404);
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") return apiError("INSUFFICIENT_STOCK", "Jumlah melebihi stok yang tersedia.", 409);
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const id = (await params).id;
    const item = await prisma.cartItem.findFirst({ where: { id, cart: { activeKey: `user:${authResult.user.id}` } } });
    if (!item) return apiError("NOT_FOUND", "Item cart tidak ditemukan.", 404);
    await prisma.cartItem.delete({ where: { id } });
    return apiSuccess({ removed: true });
  } catch (error) { return handleApiError(error); }
}
