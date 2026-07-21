import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { addCartItemSchema } from "@/lib/cart-schemas";
import { cartInclude, findActiveCart, serializeCart } from "@/lib/data/cart";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    return apiSuccess(serializeCart(await findActiveCart(authResult.user.id)));
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const data = addCartItemSchema.parse(await request.json());
    const cart = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({ where: { id: data.variantId, isActive: true, product: { status: "ACTIVE", deletedAt: null } }, include: { inventory: true } });
      const available = (variant?.inventory?.quantity ?? 0) - (variant?.inventory?.reserved ?? 0);
      if (!variant || available < data.quantity) throw new Error("INSUFFICIENT_STOCK");
      const activeKey = `user:${authResult.user.id}`;
      const activeCart = await tx.cart.upsert({ where: { activeKey }, update: { status: "ACTIVE" }, create: { userId: authResult.user.id, activeKey, status: "ACTIVE" } });
      const existing = await tx.cartItem.findUnique({ where: { cartId_variantId: { cartId: activeCart.id, variantId: variant.id } } });
      const nextQuantity = (existing?.quantity ?? 0) + data.quantity;
      if (nextQuantity > available) throw new Error("INSUFFICIENT_STOCK");
      await tx.cartItem.upsert({ where: { cartId_variantId: { cartId: activeCart.id, variantId: variant.id } }, update: { quantity: nextQuantity }, create: { cartId: activeCart.id, variantId: variant.id, quantity: data.quantity } });
      return tx.cart.findUniqueOrThrow({ where: { id: activeCart.id }, include: cartInclude });
    }, { isolationLevel: "Serializable" });
    return apiSuccess(serializeCart(cart), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") return apiError("INSUFFICIENT_STOCK", "Jumlah melebihi stok yang tersedia.", 409);
    return handleApiError(error);
  }
}
