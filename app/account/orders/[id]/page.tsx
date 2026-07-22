import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountHeading } from "@/components/account/account-heading";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { authenticatedBackendApi } from "@/lib/authenticated-backend-api";
import { requireUser } from "@/lib/auth-guard";
import { formatIDR } from "@/lib/formatters";

type Order = {
  id: string;
  orderNumber: string;
  placedAt: Date;
  status: string;
  paymentStatus: string;
  subtotal: string | number;
  discountTotal: string | number;
  shippingTotal: string | number;
  grandTotal: string | number;
  shippingCourierName: string | null;
  shippingServiceName: string | null;
  shippingDescription: string | null;
  shippingEtd: string | null;
  trackingNumber: string | null;
  items: Array<{
    id: string;
    productName: string;
    sku: string;
    variantName: string;
    quantity: number;
    lineTotal: string | number;
  }>;
  payments: Array<{ provider: string; redirectUrl: string | null }>;
  shipments: Array<{
    courier: string;
    service: string | null;
    trackingNumber: string | null;
  }>;
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = (await params).id;
  const order = (await authenticatedBackendApi<Order | null>(`/orders/${encodeURIComponent(id)}`, { cache: "no-store" })).data;
  if (!order) notFound();
  const payment = order.payments[0];
  const shipment = order.shipments[0];
  const tracking = order.trackingNumber ?? shipment?.trackingNumber;
  return (
    <div>
      <AccountHeading eyebrow={`Order ${order.orderNumber}`} title="Order details" description={`Placed ${new Intl.DateTimeFormat("en-ID", { dateStyle: "long" }).format(order.placedAt)} · ${order.status.replaceAll("_", " ")}`} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="divide-y divide-border border-y border-border">
          {order.items.map((item) => (
            <article key={item.id} className="flex justify-between gap-5 py-5">
              <div>
                <p className="font-serif text-xl">{item.productName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.sku} · {item.variantName} · Qty {item.quantity}
                </p>
              </div>
              <Price amount={Number(item.lineTotal)} />
            </article>
          ))}
        </div>
        <aside className="border border-border bg-background p-5">
          <h2 className="font-serif text-2xl">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Subtotal" value={formatIDR(Number(order.subtotal))} />
            <Row label="Discount" value={formatIDR(Number(order.discountTotal))} />
            <Row label="Shipping" value={formatIDR(Number(order.shippingTotal))} />
            <Row label="Grand total" value={formatIDR(Number(order.grandTotal))} strong />
          </dl>
          <div className="mt-6 border-t border-border pt-5 text-xs">
            <p className="font-semibold tracking-wider uppercase">Payment</p>
            <p className="mt-2 text-muted-foreground">
              {payment?.provider ?? "-"} · {order.paymentStatus.replaceAll("_", " ")}
            </p>
            {order.paymentStatus === "PENDING" && payment?.redirectUrl ? (
              <Button asChild className="mt-4 w-full">
                <a href={payment.redirectUrl}>Continue payment</a>
              </Button>
            ) : null}
          </div>
          {shipment || order.shippingCourierName ? (
            <div className="mt-6 border-t border-border pt-5 text-xs">
              <p className="font-semibold tracking-wider uppercase">Shipment</p>
              <p className="mt-2 font-medium">
                {order.shippingCourierName ?? shipment?.courier.toUpperCase()} · {order.shippingServiceName ?? shipment?.service ?? "-"}
              </p>
              {order.shippingDescription && <p className="mt-1 text-muted-foreground">{order.shippingDescription}</p>}
              <p className="mt-1 text-muted-foreground">Estimated arrival: {order.shippingEtd ?? "unavailable"}</p>
              <p className="mt-2 text-muted-foreground">Tracking number: {tracking ?? "Not issued yet"}</p>
              {tracking && (
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href={`/account/orders/${order.id}/tracking`}>View shipment</Link>
                </Button>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-border pt-3 font-semibold" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
