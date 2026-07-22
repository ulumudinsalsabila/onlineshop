"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwiseIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

const TERMINAL_FAILURES = new Set(["FAILED", "EXPIRED", "CANCELLED"]);
const MAX_AUTOMATIC_SYNCS = 12;
const SYNC_INTERVAL_MS = 10_000;

export function PaymentActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [automaticSyncs, setAutomaticSyncs] = useState(0);
  const inFlight = useRef(false);

  const syncStatus = useCallback(async (notify: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true);
    try {
      const response = await apiFetch(`/api/payments/${orderId}/sync`, { method: "POST", headers: { "Content-Type": "application/json" } });
      const result = await response.json() as { success?: boolean; data?: { status?: string }; error?: { message?: string } };
      if (!response.ok || !result.success) throw new Error(result.error?.message ?? "The payment status could not be synchronized.");
      const status = result.data?.status ?? "PENDING";
      if (status === "PAID") { if (notify) toast.success("Payment has been confirmed."); router.replace(`/checkout/success?orderId=${orderId}`); router.refresh(); return; }
      if (TERMINAL_FAILURES.has(status)) { router.replace(`/checkout/failed?orderId=${orderId}`); router.refresh(); return; }
      if (notify) toast.info("Payment is still awaiting confirmation from Midtrans.");
    } catch (error) {
      if (notify) toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally { inFlight.current = false; setBusy(false); }
  }, [orderId, router]);

  useEffect(() => {
    let active = true; let attempts = 0;
    const run = () => {
      if (!active || document.visibilityState === "hidden" || attempts >= MAX_AUTOMATIC_SYNCS) return;
      attempts += 1; setAutomaticSyncs(attempts); void syncStatus(false);
    };
    const initial = window.setTimeout(run, 0);
    const interval = window.setInterval(run, SYNC_INTERVAL_MS);
    const onVisible = () => { if (document.visibilityState === "visible") run(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; window.clearTimeout(initial); window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [syncStatus]);

  return <div className="mt-7"><p role="status" className="mb-3 text-xs text-muted-foreground">Status is checked automatically every 10 seconds{automaticSyncs >= MAX_AUTOMATIC_SYNCS ? ". Automatic checks have finished." : " while this page is active."}</p><Button disabled={busy} onClick={() => void syncStatus(true)} variant="outline">{busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <ArrowClockwiseIcon aria-hidden />} Check status now</Button></div>;
}
