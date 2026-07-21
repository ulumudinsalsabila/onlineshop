import { notFound } from "next/navigation";

import { AccountHeading } from "@/components/account/account-heading";
import { TrackingPanel } from "@/features/checkout/tracking-panel";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const id = (await params).id;
  const order = await prisma.order.findFirst({ where: { id, userId: user.id }, include: { shipments: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!order) notFound(); const shipment = order.shipments[0];
  return <div><AccountHeading eyebrow={order.orderNumber} title="Track delivery" description={shipment?.trackingNumber ? `${shipment.courier.toUpperCase()} · ${shipment.trackingNumber}` : "Your delivery is being prepared."} /><TrackingPanel orderId={id} initial={{ status: shipment?.status ?? "PENDING", trackingNumber: shipment?.trackingNumber ?? null, events: [] }} /></div>;
}
