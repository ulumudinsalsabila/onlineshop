import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettlementButton } from "@/components/admin/settlement-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { ADMIN_PAGE_SIZE, parseAdminQuery, type AdminSearchParams } from "@/lib/admin/query";
import { prisma } from "@/lib/prisma";

export default async function SellersPage({ searchParams }: { searchParams: AdminSearchParams }) {
  await requireAdmin("sellers:read");
  const query = await parseAdminQuery(searchParams);
  const where = {
    deletedAt: null,
    ...(query.status ? { status: query.status as "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" } : {}),
    ...(query.q ? { OR: [{ displayName: { contains: query.q, mode: "insensitive" as const } }, { user: { email: { contains: query.q, mode: "insensitive" as const } } }] } : {}),
  };
  const [sellers, total] = await prisma.$transaction([
    prisma.sellerProfile.findMany({ where, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE, include: { user: true, _count: { select: { submissions: true, payouts: true } } } }),
    prisma.sellerProfile.count({ where }),
  ]);
  return <div><AdminPageHeader title="Sellers" description="Kurasi aplikasi seller, pengajuan preloved, komisi, dan pencairan." breadcrumbs={[{ label: "Sellers" }]} action={<SettlementButton />} /><div className="mb-5 flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/admin/sellers/submissions">Submissions</Link></Button><Button asChild variant="outline"><Link href="/admin/sellers/payouts">Payouts</Link></Button><Button asChild variant="outline"><Link href="/admin/sellers/activity">Activity log</Link></Button></div><AdminDataTable columns={[{ key: "seller", label: "Seller" }, { key: "status", label: "Status" }, { key: "submissions", label: "Submissions" }, { key: "payouts", label: "Payouts" }, { key: "action", label: "" }]} rows={sellers.map((seller) => ({ id: seller.id, cells: { seller: <div><p className="font-semibold">{seller.displayName}</p><p className="text-xs text-muted-foreground">{seller.user.email}</p></div>, status: <Badge variant="outline">{seller.status}</Badge>, submissions: seller._count.submissions, payouts: seller._count.payouts, action: <Button asChild size="icon-sm" variant="ghost"><Link href={`/admin/sellers/${seller.id}`} aria-label={`Review ${seller.displayName}`}><ArrowRightIcon aria-hidden /></Link></Button> } }))} page={query.page} total={total} totalPages={Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))} filters={[{ value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Approved" }, { value: "REJECTED", label: "Rejected" }, { value: "SUSPENDED", label: "Suspended" }]} /> </div>;
}
