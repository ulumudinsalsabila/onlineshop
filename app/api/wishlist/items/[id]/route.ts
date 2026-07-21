import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const id = (await params).id;
    const item = await prisma.wishlistItem.findFirst({ where: { id, wishlist: { userId: authResult.user.id } } });
    if (!item) return apiError("NOT_FOUND", "Wishlist item tidak ditemukan.", 404);
    await prisma.wishlistItem.delete({ where: { id } });
    return apiSuccess({ removed: true });
  } catch (error) { return handleApiError(error); }
}
