import { redirect } from "next/navigation";

import type { UserRole } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getVerifiedUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findFirst({ where: { id: session.user.id, isActive: true, deletedAt: null }, select: { id: true, name: true, email: true, phone: true, role: true, emailVerified: true, createdAt: true } });
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
