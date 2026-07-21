import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { SellerPageHeader } from "@/components/seller/seller-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSeller } from "@/lib/seller/auth";
import { formatIDR } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
export default async function SubmissionsPage() { const { seller } = await requireSeller(); const submissions = await prisma.consignmentSubmission.findMany({ where: { sellerId: seller.id }, include: { brand: true, images: { take: 1 } }, orderBy: { updatedAt: "desc" } }); return <div><SellerPageHeader title="Submissions" description="Setiap pengajuan tetap privat hingga inspection selesai dan admin mempublikasikannya." action={<Button asChild><Link href="/seller/submissions/new"><PlusIcon aria-hidden />Add submission</Link></Button>} /><div className="border border-[#ddd5c7] bg-[#faf8f3]">{submissions.length ? submissions.map((item) => <Link href={`/seller/submissions/${item.id}`} key={item.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ddd5c7] p-5 last:border-0 hover:bg-white"><div><p className="font-serif text-xl">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.submissionNumber} · {item.brand?.name ?? item.proposedBrand}</p></div><div className="text-right"><Badge variant="outline">{item.status.replaceAll("_", " ")}</Badge><p className="mt-2 text-xs">Expected {formatIDR(Number(item.expectedPrice))}</p></div></Link>) : <p className="p-10 text-center text-sm text-muted-foreground">Belum ada submission.</p>}</div></div>; }
