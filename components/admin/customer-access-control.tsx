"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CustomerAccessControl({ id, initialActive, initialRole }: { id: string; initialActive: boolean; initialRole: string }) { const router = useRouter(); const [active, setActive] = useState(initialActive); const [role, setRole] = useState(initialRole); const [busy, setBusy] = useState(false); async function save() { setBusy(true); try { const response = await fetch(`/api/admin/customers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: active, role }) }); const result = await response.json() as { success?: boolean; error?: { message?: string } }; if (!result.success) throw new Error(result.error?.message); toast.success("Account access updated."); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Update gagal."); } finally { setBusy(false); } } return <div className="space-y-4"><div className="flex items-center gap-3"><Checkbox id="account-active" checked={active} onCheckedChange={(value) => setActive(Boolean(value))} /><Label htmlFor="account-active">Account active</Label></div><div><Label htmlFor="account-role">Role</Label><select id="account-role" value={role} onChange={(event) => setRole(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="CUSTOMER">Customer</option><option value="STAFF">Staff</option><option value="ADMIN">Admin</option></select></div><Button className="w-full" onClick={() => void save()} disabled={busy}>{busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}Save access</Button></div>; }
