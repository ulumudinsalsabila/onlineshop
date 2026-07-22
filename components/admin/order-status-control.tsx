"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrderStatusControl({ orderId, current }: { orderId: string; current: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(current === "PAID" ? "PROCESSING" : current === "PROCESSING" ? "SHIPPED" : current === "SHIPPED" ? "DELIVERED" : "");
  const [tracking, setTracking] = useState("");
  const [busy, setBusy] = useState(false);
  async function update() {
    if (!status) return;
    setBusy(true);
    try {
      const response = await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingNumber: tracking || undefined }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!result.success) throw new Error(result.error?.message);
      toast.success("Order status updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the status.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="next-status">Next status</Label>
        <select id="next-status" value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-white px-3 text-sm">
          <option value="">Select action</option>
          {current === "PAID" && <option value="PROCESSING">Processing</option>}
          {current === "PROCESSING" && (
            <>
              <option value="SHIPPED">Shipped</option>
              <option value="CANCELLED">Cancelled</option>
            </>
          )}
          {current === "SHIPPED" && <option value="DELIVERED">Delivered</option>}
          {["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(current) && <option value="REFUNDED">Refunded</option>}
        </select>
      </div>
      {status === "SHIPPED" && (
        <div>
          <Label htmlFor="tracking">Tracking number</Label>
          <Input id="tracking" value={tracking} onChange={(event) => setTracking(event.target.value)} className="mt-2 bg-white" />
        </div>
      )}
      <Button onClick={() => void update()} disabled={!status || busy} className="w-full">
        {busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}Update status
      </Button>
    </div>
  );
}
