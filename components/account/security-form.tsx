"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SecurityForm() { const [message, setMessage] = useState(""); const [pending, setPending] = useState(false); async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); const form = event.currentTarget; const response = await fetch("/api/account/security", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) }); const result = await response.json() as { success: boolean; data?: { message?: string }; error?: { message?: string } }; setMessage(result.success ? result.data?.message ?? "Berhasil." : result.error?.message ?? "Gagal."); if (result.success) form.reset(); setPending(false); } return <form onSubmit={submit} className="mt-8 max-w-xl space-y-5">{[["currentPassword", "Password saat ini"], ["newPassword", "Password baru"], ["confirmPassword", "Konfirmasi password"]].map(([id, label]) => <div key={id}><Label htmlFor={id}>{label}</Label><Input id={id} name={id} type="password" required minLength={id === "currentPassword" ? 1 : 10} className="mt-2" /></div>)}{message ? <p role="status" className="text-sm">{message}</p> : null}<Button type="submit" disabled={pending}>{pending ? "Updating…" : "Update password"}</Button></form>; }
