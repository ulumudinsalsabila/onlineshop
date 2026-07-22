import { redirect } from "next/navigation";
import { getVerifiedUser } from "@/lib/auth-guard";
import { authenticatedBackendApi } from "@/lib/authenticated-backend-api";

export type SellerProfile = { id: string; userId: string; status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"; displayName: string; phone: string; bio: string | null; commissionRate: number | string; bankName: string | null; bankAccountName: string | null; bankAccountNumber: string | null; rejectionReason: string | null };

export async function getSellerForUser() {
  try { return (await authenticatedBackendApi<SellerProfile | null>("/seller/profile", { cache: "no-store" })).data; } catch { return null; }
}
export async function requireSeller(options: { approved?: boolean } = { approved: true }) {
  const user = await getVerifiedUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent("/seller")}`);
  const seller = await getSellerForUser();
  if (!seller) redirect("/sell");
  if (options.approved !== false && seller.status !== "APPROVED") redirect("/seller/application");
  return { user, seller };
}
