"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

export function CompleteOrderButton({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false); const router = useRouter();
  async function complete() {
    if (!window.confirm("Confirm that this order has arrived and is complete?")) return;
    setBusy(true);
    try { const response = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}/complete`, { method: "POST" }); const result = await response.json() as { success: boolean; error?: { message?: string } }; if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Could not complete order."); toast.success("Order completed"); router.refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not complete order."); }
    finally { setBusy(false); }
  }
  return <Button className="mt-4 w-full" onClick={complete} disabled={busy}>{busy ? "Confirming…" : "Order received"}</Button>;
}
