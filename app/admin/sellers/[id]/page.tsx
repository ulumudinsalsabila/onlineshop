import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SellerReviewControl } from "@/components/admin/seller-review-control";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/auth";
import { formatIDR } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function SellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("sellers:read");
  const seller = await prisma.sellerProfile.findUnique({ where: { id: (await params).id }, include: { user: true, submissions: { orderBy: { updatedAt: "desc" }, take: 8, include: { commission: true } }, payouts: { orderBy: { requestedAt: "desc" }, take: 5 } } });
  if (!seller || seller.deletedAt) notFound();
  return <div><AdminPageHeader title={seller.displayName} description={seller.user.email} breadcrumbs={[{ label: "Sellers", href: "/admin/sellers" }, { label: seller.displayName }]} /><div className="grid gap-6 xl:grid-cols-[1fr_22rem]"><div className="space-y-6"><section className="grid gap-4 border bg-[#faf8f3] p-5 sm:grid-cols-2"><Info label="Status"><Badge variant="outline">{seller.status}</Badge></Info><Info label="Phone">{seller.phone}</Info><Info label="Identity">{seller.identityNumber ? `••••${seller.identityNumber.slice(-4)}` : "—"}</Info><Info label="Bank">{seller.bankName && seller.bankAccountNumber ? `${seller.bankName} ••••${seller.bankAccountNumber.slice(-4)}` : "Belum diisi"}</Info><Info label="Application note">{seller.applicationNote || "—"}</Info><Info label="Review reason">{seller.rejectionReason || "—"}</Info></section><section className="border bg-[#faf8f3] p-5"><h2 className="mb-4 font-serif text-2xl">Recent submissions</h2><div className="divide-y">{seller.submissions.length ? seller.submissions.map((item) => <Link key={item.id} href={`/admin/sellers/submissions/${item.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-primary"><div><p className="font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.submissionNumber}</p></div><div className="text-right"><Badge variant="outline">{item.status}</Badge><p className="mt-1 text-xs">{formatIDR(Number(item.agreedPrice ?? item.expectedPrice))}</p></div></Link>) : <p className="text-sm text-muted-foreground">Belum ada pengajuan.</p>}</div></section></div><aside className="border bg-[#faf8f3] p-5"><h2 className="mb-4 font-serif text-2xl">Application review</h2><SellerReviewControl id={seller.id} status={seller.status} rate={Number(seller.commissionRate)} /></aside></div></div>;
}
function Info({ label, children }: { label: string; children: React.ReactNode }) { return <div><p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p><div className="text-sm">{children}</div></div>; }
