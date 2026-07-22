"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, SpinnerGapIcon, XIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function SellerReviewControl({ id, status, rate }: { id: string; status: string; rate: number }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [commissionRate, setRate] = useState(rate);
  const [busy, setBusy] = useState(false);
  async function update(next: string) {
    setBusy(true);
    try {
      const response = await apiFetch(`/api/admin/sellers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, reason, commissionRate }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!result.success) throw new Error(result.error?.message);
      toast.success("Seller status updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="commission-rate">Commission rate (%)</Label>
        <Input id="commission-rate" type="number" min={0} max={100} value={commissionRate} onChange={(event) => setRate(Number(event.target.value))} className="mt-2 bg-white" />
      </div>
      <div>
        <Label htmlFor="seller-reason">Reason / review note</Label>
        <textarea id="seller-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 min-h-24 w-full rounded-md border border-input bg-white p-3 text-sm" />
      </div>
      <div className="flex gap-2">
        {["PENDING", "SUSPENDED"].includes(status) && (
          <Button className="flex-1" disabled={busy} onClick={() => void update("APPROVED")}>
            {busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <CheckIcon aria-hidden />}
            Approve
          </Button>
        )}
        {status === "PENDING" && (
          <Button className="flex-1" variant="destructive" disabled={busy || !reason} onClick={() => void update("REJECTED")}>
            <XIcon aria-hidden />
            Reject
          </Button>
        )}
        {status === "APPROVED" && (
          <Button className="flex-1" variant="destructive" disabled={busy || !reason} onClick={() => void update("SUSPENDED")}>
            <XIcon aria-hidden />
            Suspend
          </Button>
        )}
      </div>
    </div>
  );
}
