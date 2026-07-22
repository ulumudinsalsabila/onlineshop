"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwiseIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
export function SettlementButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function settle() {
    setBusy(true);
    try {
      const response = await apiFetch("/api/admin/consignments/settle", {
        method: "POST",
      });
      const result = (await response.json()) as {
        success?: boolean;
        data?: { count: number };
        error?: { message?: string };
      };
      if (!result.success) throw new Error(result.error?.message);
      toast.success(`${result.data?.count ?? 0} consignment completed.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Settlement failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant="outline" disabled={busy} onClick={() => void settle()}>
      {busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <ArrowClockwiseIcon aria-hidden />}
      Run settlement
    </Button>
  );
}
