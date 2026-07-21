import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountHeading } from "@/components/account/account-heading";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth-guard";
import { formatIDR } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const order = await prisma.order.findFirst({ where: { id: (await params).id, userId: user.id }, include: { items: true, payments: { orderBy: { createdAt: "desc" } }, shipments: { orderBy: { createdAt: "desc" } } } });
  if (!order) notFound();
  const payment = order.payments[0]; const shipment = order.shipments[0];
  return <div><AccountHeading eyebrow={`Order ${order.orderNumber}`} title="Order details" description={`Dibuat ${new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(order.placedAt)} · ${order.status.replaceAll("_", " ")}`} /><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]"><div className="divide-y divide-border border-y border-border">{order.items.map((item) => <article key={item.id} className="flex justify-between gap-5 py-5"><div><p className="font-serif text-xl">{item.productName}</p><p className="mt-1 text-xs text-muted-foreground">{item.sku} · {item.variantName} · Qty {item.quantity}</p></div><Price amount={Number(item.lineTotal)} /></article>)}</div><aside className="border border-border bg-background p-5"><h2 className="font-serif text-2xl">Summary</h2><dl className="mt-5 space-y-3 text-sm"><Row label="Subtotal" value={formatIDR(Number(order.subtotal))} /><Row label="Discount" value={formatIDR(Number(order.discountTotal))} /><Row label="Shipping" value={formatIDR(Number(order.shippingTotal))} /><Row label="Grand total" value={formatIDR(Number(order.grandTotal))} strong /></dl><div className="mt-6 border-t border-border pt-5 text-xs"><p className="font-semibold tracking-wider uppercase">Payment</p><p className="mt-2 text-muted-foreground">{payment?.provider ?? "-"} · {order.paymentStatus.replaceAll("_", " ")}</p>{order.paymentStatus === "PENDING" && payment?.redirectUrl ? <Button asChild className="mt-4 w-full"><a href={payment.redirectUrl}>Lanjutkan pembayaran</a></Button> : null}</div>{shipment ? <div className="mt-6 border-t border-border pt-5 text-xs"><p className="font-semibold tracking-wider uppercase">Shipment</p><p className="mt-2 text-muted-foreground">{shipment.courier.toUpperCase()} · {shipment.trackingNumber ?? "Tracking pending"}</p><Button asChild variant="outline" className="mt-4 w-full"><Link href={`/account/orders/${order.id}/tracking`}>Lacak pesanan</Link></Button></div> : null}</aside></div></div>;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) { return <div className={`flex justify-between ${strong ? "border-t border-border pt-3 font-semibold" : ""}`}><dt>{label}</dt><dd>{value}</dd></div>; }
