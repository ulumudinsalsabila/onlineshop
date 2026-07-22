import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { UserRole } from "@/auth";
import { authenticatedBackendApi } from "@/lib/authenticated-backend-api";

export async function getVerifiedUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return (await authenticatedBackendApi<{ id: string; name: string | null; email: string; phone: string | null; role: UserRole; emailVerified: Date | null; createdAt: Date }>("/account/profile", { cache: "no-store" })).data;
}

export async function requireUser() {
  const user = await getVerifiedUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent("/account")}`);
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/account");
  return user;
}
