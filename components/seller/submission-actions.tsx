"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, PaperPlaneTiltIcon, SpinnerGapIcon, XIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
export function SubmissionActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function act(payload: object) {
    setBusy(true);
    try {
      const response = await apiFetch(`/api/seller/submissions/${id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!result.success) throw new Error(result.error?.message);
      toast.success("Submission status updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  if (["DRAFT", "NEEDS_REVISION"].includes(status))
    return (
      <Button disabled={busy} onClick={() => void act({ status: "SUBMITTED" })}>
        {busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <PaperPlaneTiltIcon aria-hidden />}
        Submit for review
      </Button>
    );
  if (status === "APPROVED")
    return (
      <div className="flex gap-2">
        <Button disabled={busy} onClick={() => void act({ status: "WAITING_FOR_ITEM", decision: "ACCEPTED" })}>
          <CheckIcon aria-hidden />
          Accept estimate
        </Button>
        <Button
          disabled={busy}
          variant="outline"
          onClick={() =>
            void act({
              status: "CANCELLED",
              decision: "REJECTED",
              reason: "Seller rejected estimated price",
            })
          }
        >
          <XIcon aria-hidden />
          Decline
        </Button>
      </div>
    );
  return null;
}
