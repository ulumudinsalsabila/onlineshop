import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

import { AccountHeading } from "@/components/account/account-heading";
import { formatIDR } from "@/lib/formatters";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() { const user = await requireUser(); const orders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { placedAt: "desc" }, include: { _count: { select: { items: true } } } }); return <div><AccountHeading eyebrow="Purchase history" title="Orders" description="Status dan rincian seluruh pesanan Anda." /><div className="mt-8 divide-y divide-border border-y border-border">{orders.length ? orders.map((order) => <Link key={order.id} href={`/account/orders/${order.id}`} className="grid gap-3 py-5 transition-colors hover:bg-secondary/30 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-4"><div><p className="text-xs font-semibold tracking-wider uppercase">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(order.placedAt)} · {order._count.items} item</p></div><div className="sm:text-right"><p className="font-serif text-lg">{formatIDR(Number(order.grandTotal))}</p><p className="text-[0.625rem] tracking-wider uppercase">{order.status}</p></div><ArrowRightIcon aria-hidden /></Link>) : <p className="py-16 text-center text-sm text-muted-foreground">Belum ada pesanan.</p>}</div></div>; }
