"use client";
import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function CustomerAccessControl({ id, initialActive, initialRole, initialVerified }: { id: string; initialActive: boolean; initialRole: string; initialVerified: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [role, setRole] = useState(initialRole);
  const [verified, setVerified] = useState(initialVerified);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      const response = await apiFetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: active,
          role,
          emailVerified: verified,
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!result.success) throw new Error(result.error?.message);
      toast.success("Account access updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Checkbox id="account-active" checked={active} onCheckedChange={(value) => setActive(Boolean(value))} />
        <Label htmlFor="account-active">Account active</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="email-verified" checked={verified} onCheckedChange={(value) => setVerified(Boolean(value))} />
        <Label htmlFor="email-verified">Email verified</Label>
      </div>
      <div>
        <Label htmlFor="account-role">Role</Label>
        <SearchableSelect
          id="account-role"
          value={role}
          onValueChange={setRole}
          options={[
            { value: "CUSTOMER", label: "Customer" },
            { value: "STAFF", label: "Staff" },
            { value: "ADMIN", label: "Admin" },
          ]}
          searchPlaceholder="Search roles…"
          className="mt-2"
        />
      </div>
      <Button className="w-full" onClick={() => void save()} disabled={busy}>
        {busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}Save access
      </Button>
    </div>
  );
}
