"use client";

import { useState } from "react";
import { ArrowClockwiseIcon, PackageIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Tracking = { status: string; trackingNumber: string | null; events: { status: string; note: string; occurredAt: string }[] };
export function TrackingPanel({ orderId, initial }: { orderId: string; initial: Tracking }) {
  const [tracking, setTracking] = useState(initial); const [busy, setBusy] = useState(false);
  async function refresh() { setBusy(true); try { const response = await fetch(`/api/orders/${orderId}/tracking`, { cache: "no-store" }); const result = await response.json() as { success?: boolean; data?: Tracking; error?: { message?: string } }; if (!result.success || !result.data) throw new Error(result.error?.message); setTracking(result.data); } catch (error) { toast.error(error instanceof Error ? error.message : "Tracking could not be loaded."); } finally { setBusy(false); } }
  return <div className="mt-8"><div className="flex items-center justify-between gap-4"><div><p className="text-xs tracking-wider text-muted-foreground uppercase">Current status</p><p className="mt-1 font-serif text-3xl">{tracking.status.replaceAll("_", " ")}</p></div><Button variant="outline" onClick={() => void refresh()} disabled={busy}>{busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <ArrowClockwiseIcon aria-hidden />} Refresh</Button></div><ol className="mt-8 border-l border-border pl-6">{tracking.events.length ? tracking.events.map((event, index) => <li key={`${event.occurredAt}-${index}`} className="relative pb-7 last:pb-0"><span className="absolute top-1 -left-[1.85rem] size-3 rounded-full border-2 border-background bg-primary" /><p className="text-xs font-semibold tracking-wider uppercase">{event.status}</p><p className="mt-1 text-sm text-muted-foreground">{event.note}</p><time className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat("en-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.occurredAt))}</time></li>) : <li className="flex gap-3 text-sm text-muted-foreground"><PackageIcon aria-hidden /> Tracking details and transit history will appear after the parcel is handed to the courier.</li>}</ol></div>;
}
