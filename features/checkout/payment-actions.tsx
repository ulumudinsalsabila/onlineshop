"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwiseIcon, CheckIcon, SpinnerGapIcon, XIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function PaymentActions({ orderId, mock }: { orderId: string; mock: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function call(url: string, body?: object) {
    setBusy(true);
    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const result = await response.json() as { success?: boolean; data?: { status?: string }; error?: { message?: string } };
      if (!result.success) throw new Error(result.error?.message ?? "Status tidak dapat diperbarui.");
      toast.success("Status pembayaran diperbarui.");
      const status = result.data?.status;
      router.replace(status === "PAID" ? `/checkout/success?orderId=${orderId}` : ["FAILED", "EXPIRED", "CANCELLED"].includes(status ?? "") ? `/checkout/failed?orderId=${orderId}` : `/checkout/pending?orderId=${orderId}`);
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Terjadi kesalahan."); } finally { setBusy(false); }
  }
  return <div className="mt-7 flex flex-wrap justify-center gap-3"><Button disabled={busy} onClick={() => void call(`/api/payments/${orderId}/sync`)} variant="outline">{busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <ArrowClockwiseIcon aria-hidden />} Sinkronkan status</Button>{mock && <><Button disabled={busy} onClick={() => void call(`/api/payments/mock/${orderId}`, { status: "settlement" })}><CheckIcon aria-hidden /> Simulasikan berhasil</Button><Button disabled={busy} variant="destructive" onClick={() => void call(`/api/payments/mock/${orderId}`, { status: "failure" })}><XIcon aria-hidden /> Simulasikan gagal</Button></>}</div>;
}
