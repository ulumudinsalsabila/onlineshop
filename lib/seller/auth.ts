import { redirect } from "next/navigation";
import { authenticateApi } from "@/lib/api-auth";
import { apiError } from "@/lib/api-response";
import { getVerifiedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function getSellerForUser(userId: string) { return prisma.sellerProfile.findFirst({ where: { userId, deletedAt: null } }); }
export async function requireSeller(options: { approved?: boolean } = { approved: true }) { const user = await getVerifiedUser(); if (!user) redirect(`/login?callbackUrl=${encodeURIComponent("/seller")}`); const seller = await getSellerForUser(user.id); if (!seller) redirect("/sell"); if (options.approved !== false && seller.status !== "APPROVED") redirect("/seller/application"); return { user, seller }; }
export async function authenticateSellerApi(options: { approved?: boolean } = { approved: true }) { const auth = await authenticateApi(); if (!auth.user) return { user: null, seller: null, response: auth.response } as const; const seller = await getSellerForUser(auth.user.id); if (!seller) return { user: null, seller: null, response: apiError("SELLER_PROFILE_REQUIRED", "Ajukan akun seller terlebih dahulu.", 403) } as const; if (options.approved !== false && seller.status !== "APPROVED") return { user: null, seller: null, response: apiError("SELLER_NOT_APPROVED", "Akun seller belum disetujui.", 403) } as const; return { user: auth.user, seller, response: null } as const; }
