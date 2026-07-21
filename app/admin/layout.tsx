import type { ReactNode } from "react";
import type { Metadata } from "next";

import { logout } from "@/app/account/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { privateMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", ...privateMetadata };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  const [pendingOrders, lowStock] = await Promise.all([prisma.order.count({ where: { status: "PENDING_PAYMENT" } }), prisma.inventory.count({ where: { quantity: { gt: 0 }, AND: [{ quantity: { lte: prisma.inventory.fields.lowStockAt } }] } }).catch(() => 0)]);
  return <AdminShell user={user} notifications={{ pendingOrders, lowStock }} logoutAction={logout}>{children}</AdminShell>;
}
