"use client";

import { apiFetch } from "@/lib/api-client";

import { useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ initialName, email, initialPhone }: { initialName: string; email: string; initialPhone: string }) {
  const [message, setMessage] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); const data = Object.fromEntries(new FormData(event.currentTarget)); const response = await apiFetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const result = await response.json() as { success: boolean; data?: { name?: string }; error?: { message?: string } }; setMessage(result.success ? "Profile updated." : result.error?.message ?? "The profile could not be updated."); setPending(false); }
  return <form onSubmit={submit} className="mt-8 max-w-xl space-y-5"><div><Label htmlFor="name">Full name</Label><Input id="name" name="name" defaultValue={initialName} className="mt-2" required /></div><div><Label htmlFor="profile-email">Email</Label><Input id="profile-email" value={email} disabled className="mt-2" /></div><div><Label htmlFor="phone">Phone number</Label><Input id="phone" name="phone" defaultValue={initialPhone} className="mt-2" /></div>{message ? <p role="status" className="flex items-center gap-2 text-sm"><CheckCircleIcon aria-hidden />{message}</p> : null}<Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button></form>;
}
