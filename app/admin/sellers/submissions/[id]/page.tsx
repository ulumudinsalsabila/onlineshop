import Image from "next/image";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConsignmentControls } from "@/components/admin/consignment-controls";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/auth";
import { formatIDR } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("sellers:read");
  const id = (await params).id;
  const [submission, categories, brands] = await Promise.all([
    prisma.consignmentSubmission.findUnique({ where: { id }, include: { seller: { include: { user: true } }, category: true, brand: true, images: { orderBy: { sortOrder: "asc" } }, inspections: { orderBy: { inspectedAt: "desc" } }, commission: true, product: true } }),
    prisma.category.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!submission) notFound();
  return <div><AdminPageHeader title={submission.title} description={submission.submissionNumber} breadcrumbs={[{ label: "Sellers", href: "/admin/sellers" }, { label: "Submissions", href: "/admin/sellers/submissions" }, { label: submission.submissionNumber }]} /><div className="grid gap-6 xl:grid-cols-[1fr_23rem]"><div className="space-y-6"><section className="grid gap-4 border bg-[#faf8f3] p-5 sm:grid-cols-2 lg:grid-cols-3"><Info label="Seller">{submission.seller.displayName}</Info><Info label="Status"><Badge variant="outline">{submission.status}</Badge></Info><Info label="Condition">{submission.conditionLabel}</Info><Info label="Brand">{submission.brand?.name || submission.proposedBrand || "—"}</Info><Info label="Category">{submission.category?.name || "—"}</Info><Info label="Completeness">{submission.completeness}</Info><Info label="Expected">{formatIDR(Number(submission.expectedPrice))}</Info><Info label="Estimated">{submission.estimatedPrice ? formatIDR(Number(submission.estimatedPrice)) : "—"}</Info><Info label="Agreed">{submission.agreedPrice ? formatIDR(Number(submission.agreedPrice)) : "—"}</Info></section><section className="border bg-[#faf8f3] p-5"><h2 className="mb-4 font-serif text-2xl">Seller evidence</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{submission.images.map((image) => <div key={image.id} className="relative aspect-square overflow-hidden bg-muted"><Image src={image.url} alt={image.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></div>)}</div>{!submission.images.length && <p className="text-sm text-muted-foreground">Belum ada gambar.</p>}<dl className="mt-5 space-y-3 text-sm"><div><dt className="font-medium">Description</dt><dd className="text-muted-foreground">{submission.description}</dd></div><div><dt className="font-medium">Flaw notes</dt><dd className="text-muted-foreground">{submission.flawNotes || "Tidak dicantumkan"}</dd></div></dl></section><section className="border bg-[#faf8f3] p-5"><h2 className="mb-4 font-serif text-2xl">Inspection history</h2>{submission.inspections.length ? <div className="space-y-3">{submission.inspections.map((inspection) => <div key={inspection.id} className="border-l-2 border-primary pl-4"><Badge variant="outline">{inspection.result}</Badge><p className="mt-1 text-sm">{inspection.notes || "No notes"}</p><p className="text-xs text-muted-foreground">{inspection.inspectedAt.toLocaleString("id-ID")}</p></div>)}</div> : <p className="text-sm text-muted-foreground">Belum diperiksa.</p>}</section></div><aside className="border bg-[#faf8f3] p-5"><ConsignmentControls id={submission.id} status={submission.status} title={submission.title} initialPrice={Number(submission.agreedPrice ?? submission.estimatedPrice ?? submission.expectedPrice)} initialRate={Number(submission.commission?.rate ?? submission.seller.commissionRate)} categories={categories} brands={brands} /></aside></div></div>;
}
function Info({ label, children }: { label: string; children: React.ReactNode }) { return <div><p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p><div className="text-sm">{children}</div></div>; }
