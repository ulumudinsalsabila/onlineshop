"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function PayoutControl({ id, status }: { id: string; status: string }) { const router = useRouter(); const [reference, setReference] = useState(""); const [reason, setReason] = useState(""); const [busy, setBusy] = useState(false); async function update(next: string) { setBusy(true); try { const response = await apiFetch(`/api/admin/payouts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next, providerRef: reference || undefined, reason: reason || undefined }) }); const result = await response.json() as { success?: boolean; error?: { message?: string } }; if (!result.success) throw new Error(result.error?.message); toast.success("Payout updated."); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Update gagal."); } finally { setBusy(false); } } return <div className="flex flex-wrap gap-2">{status === "REQUESTED" && <Button size="sm" disabled={busy} onClick={() => void update("PROCESSING")}>Process</Button>}{status === "PROCESSING" && <><Input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Transfer reference" className="h-8 w-44 bg-white" /><Button size="sm" disabled={busy || !reference} onClick={() => void update("PAID")}>{busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}Mark paid</Button><Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Failure reason" className="h-8 w-40 bg-white" /><Button size="sm" variant="destructive" disabled={!reason} onClick={() => void update("FAILED")}>Fail</Button></>}</div>; }
