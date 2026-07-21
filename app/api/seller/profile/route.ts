import { apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateSellerApi } from "@/lib/seller/auth";
import { logSellerActivity } from "@/lib/seller/activity";
import { sellerProfileSchema } from "@/lib/seller/schemas";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) { try { const auth = await authenticateSellerApi({ approved: false }); if (!auth.user || !auth.seller) return auth.response; const data = sellerProfileSchema.parse(await request.json()); const profile = await prisma.$transaction(async (tx) => { const updated = await tx.sellerProfile.update({ where: { id: auth.seller.id }, data: { ...data, bio: data.bio || null } }); await logSellerActivity(tx, { sellerId: updated.id, actorUserId: auth.user.id, action: "SELLER_PROFILE_UPDATED", entityType: "SellerProfile", entityId: updated.id }); return updated; }); return apiSuccess({ id: profile.id }); } catch (error) { return handleApiError(error); } }
