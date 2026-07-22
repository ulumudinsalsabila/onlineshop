"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { safeRedirectPath } from "@/lib/safe-redirect";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "register" | "forgot" | "reset";

export function AuthForm({ mode, callbackUrl = "/account", email = "", token = "", verified = false, invalidToken = false }: { mode: Mode; callbackUrl?: string; email?: string; token?: string; verified?: boolean; invalidToken?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(verified ? "Your email has been verified. You can now sign in." : invalidToken ? "This verification link is invalid or has expired." : "");
  const [success, setSuccess] = useState(verified);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(""); setSuccess(false);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === "login") {
        const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email: values.email, password: values.password }) });
        const result = await response.json() as { success: boolean; error?: { message?: string } };
        if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Incorrect email or password.");
        router.push(safeRedirectPath(callbackUrl)); router.refresh(); return;
      }
      const endpoint = mode === "register" ? "/api/auth/register" : mode === "forgot" ? "/api/auth/forgot-password" : "/api/auth/reset-password";
      const body = mode === "reset" ? { ...values, email, token } : values;
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json() as { success: boolean; data?: { message?: string }; error?: { message?: string; details?: { fieldErrors?: Record<string, string[]> } } };
      if (!response.ok || !result.success) {
        const firstFieldError = result.error?.details?.fieldErrors ? Object.values(result.error.details.fieldErrors).flat()[0] : undefined;
        throw new Error(firstFieldError ?? result.error?.message ?? "Your request could not be processed.");
      }
      setSuccess(true); setMessage(result.data?.message ?? "Done.");
      if (mode === "reset") window.setTimeout(() => router.push("/login"), 1200);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong."); } finally { setPending(false); }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      {mode === "register" ? <Field id="name" label="Full name" autoComplete="name" /> : null}
      {mode !== "reset" ? <Field id="email" label="Email" type="email" autoComplete="email" /> : <p className="border border-border bg-secondary/40 px-4 py-3 text-sm">Reset password for <strong>{email}</strong></p>}
      {mode === "login" || mode === "register" || mode === "reset" ? (
        <div><Label htmlFor="password">Password</Label><div className="relative mt-2"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "login" ? 1 : 10} className="pr-12" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 grid w-11 place-items-center"><span aria-hidden>{showPassword ? <EyeSlashIcon /> : <EyeIcon />}</span></button></div></div>
      ) : null}
      {mode === "register" || mode === "reset" ? <Field id="confirmPassword" label="Confirm password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={10} /> : null}
      {message ? <p role="status" className={`flex gap-2 border px-4 py-3 text-sm ${success ? "border-emerald-700/30 bg-emerald-700/8 text-emerald-900" : "border-destructive/30 bg-destructive/8 text-destructive"}`}>{success ? <CheckCircleIcon className="mt-0.5 shrink-0" aria-hidden /> : null}{message}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Processing…" : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : mode === "forgot" ? "Send reset link" : "Update password"}<ArrowRightIcon aria-hidden /></Button>
      {mode === "login" ? <div className="flex justify-between text-xs"><Link href="/register" className="underline-offset-4 hover:underline">Create account</Link><Link href="/forgot-password" className="underline-offset-4 hover:underline">Forgot password?</Link></div> : null}
      {mode !== "login" ? <p className="text-center text-xs text-muted-foreground">Already have an account? <Link href="/login" className="text-foreground underline underline-offset-4">Sign in</Link></p> : null}
    </form>
  );
}

function Field({ id, label, type = "text", ...props }: { id: string; label: string; type?: string } & React.ComponentProps<typeof Input>) {
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} name={id} type={type} required className="mt-2" {...props} /></div>;
}
