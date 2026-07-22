import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { AccountHeading } from "@/components/account/account-heading";
import { authenticatedBackendApi as backendApi } from "@/lib/authenticated-backend-api";
import { formatIDR } from "@/lib/formatters";
import { requireUser } from "@/lib/auth-guard";

type Order = { id: string; orderNumber: string; placedAt: Date; grandTotal: number | string; status: string; _count: { items: number } };

export default async function OrdersPage() {
  await requireUser();
  const orders = (await backendApi<Order[]>("/orders", { cache: "no-store" })).data;
  return <div><AccountHeading eyebrow="Purchase history" title="Orders" description="Status and details for all your orders." /><div className="mt-8 divide-y divide-border border-y border-border">{orders.length ? orders.map((order) => <Link key={order.id} href={`/account/orders/${order.id}`} className="grid gap-3 py-5 transition-colors hover:bg-secondary/30 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-4"><div><p className="text-xs font-semibold tracking-wider uppercase">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat("en-ID", { dateStyle: "medium" }).format(order.placedAt)} · {order._count.items} item</p></div><div className="sm:text-right"><p className="font-serif text-lg">{formatIDR(Number(order.grandTotal))}</p><p className="text-[0.625rem] tracking-wider uppercase">{order.status}</p></div><ArrowRightIcon aria-hidden /></Link>) : <p className="py-16 text-center text-sm text-muted-foreground">There are no orders yet.</p>}</div></div>;
}
