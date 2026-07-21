import Link from "next/link";
import { CheckCircleIcon, ClockCountdownIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";

import { StorefrontShell } from "@/components/layout";
import { Container } from "@/components/shared/container";
import { MotionSection } from "@/components/shared/motion-section";
import { Button } from "@/components/ui/button";
import { PaymentActions } from "@/features/checkout/payment-actions";
import { requireUser } from "@/lib/auth-guard";
import { formatIDR } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export async function OrderStatusPage({ mode, searchParams }: { mode: "success" | "pending" | "failed"; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const query = await searchParams;
  const orderId = typeof query.orderId === "string" ? query.orderId : undefined;
  const orderNumber = typeof query.order === "string" ? query.order : undefined;
  const order = await prisma.order.findFirst({ where: { userId: user.id, ...(orderId ? { id: orderId } : { orderNumber }) }, include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
  const content = mode === "success" ? { title: "Pembayaran berhasil", body: "Terima kasih. Pesanan Anda telah dibayar dan segera kami proses.", icon: CheckCircleIcon } : mode === "failed" ? { title: "Pembayaran belum berhasil", body: "Pembayaran gagal, dibatalkan, atau telah kedaluwarsa. Stok yang direservasi telah dilepas.", icon: WarningCircleIcon } : { title: "Menunggu pembayaran", body: "Kami menunggu konfirmasi aman dari penyedia pembayaran. Status dapat disinkronkan kapan saja.", icon: ClockCountdownIcon };
  const Icon = content.icon;
  return <StorefrontShell><Container className="py-20"><MotionSection className="mx-auto max-w-2xl border border-border bg-secondary/25 p-8 text-center sm:p-12"><Icon className="mx-auto size-14 text-accent-foreground" weight="thin" aria-hidden /><p className="mt-6 text-xs tracking-[0.2em] uppercase">Status pembayaran</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">{content.title}</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted-foreground">{content.body}</p>{order ? <div className="mx-auto mt-7 max-w-sm border-y border-border py-5 text-sm"><div className="flex justify-between"><span>{order.orderNumber}</span><span>{formatIDR(Number(order.grandTotal))}</span></div><p className="mt-2 text-xs tracking-wider text-muted-foreground uppercase">{order.paymentStatus}</p></div> : <p className="mt-7 text-sm text-destructive">Pesanan tidak ditemukan dari tautan ini.</p>}{order && mode === "pending" ? <PaymentActions orderId={order.id} mock={order.payments[0]?.provider === "mock"} /> : null}<div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild><Link href={order ? `/account/orders/${order.id}` : "/account/orders"}>Lihat pesanan</Link></Button><Button asChild variant="outline"><Link href="/products">Lanjut belanja</Link></Button></div></MotionSection></Container></StorefrontShell>;
}
