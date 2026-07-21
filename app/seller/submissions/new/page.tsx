import { SellerPageHeader } from "@/components/seller/seller-page-header";
import { SubmissionForm } from "@/components/seller/submission-form";
import { requireSeller } from "@/lib/seller/auth";
import { prisma } from "@/lib/prisma";
export default async function NewSubmissionPage() { await requireSeller(); const [categories, brands] = await Promise.all([prisma.category.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }), prisma.brand.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } })]); return <div><SellerPageHeader title="New submission" description="Mulai sebagai draft, lengkapi detail produk, lalu unggah minimal tiga foto." /><SubmissionForm categories={categories} brands={brands} /></div>; }
