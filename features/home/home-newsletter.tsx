"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.string().trim().email("Masukkan alamat email yang valid.");

export function HomeNewsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="flex min-h-28 flex-col items-center justify-center" role="status" aria-live="polite">
        <CheckCircleIcon size={34} weight="light" className="text-accent-foreground" aria-hidden />
        <p className="mt-3 font-serif text-2xl">You’re on the list.</p>
        <p className="mt-1 text-sm text-muted-foreground">Editorial notes berikutnya akan hadir di inbox Anda.</p>
      </div>
    );
  }

  return (
    <form
      className="mx-auto mt-8 max-w-xl"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const result = emailSchema.safeParse(email);
        if (!result.success) {
          setError(result.error.issues[0]?.message ?? "Email tidak valid.");
          return;
        }
        setError("");
        setIsSuccess(true);
      }}
    >
      <label htmlFor="home-newsletter-email" className="sr-only">Alamat email</label>
      <div className="flex border-b border-foreground/35">
        <Input id="home-newsletter-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); if (error) setError(""); }} placeholder="Alamat email Anda" aria-invalid={!!error} aria-describedby={error ? "home-newsletter-error" : undefined} className="h-14 rounded-none border-0 bg-transparent px-0 text-center shadow-none focus-visible:ring-0 sm:text-left" />
        <Button type="submit" variant="ghost" className="h-14 shrink-0 px-4">Join us <ArrowRightIcon aria-hidden /></Button>
      </div>
      <p id="home-newsletter-error" className="mt-2 min-h-5 text-sm text-destructive" aria-live="polite">{error}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">Dengan mendaftar, Anda menyetujui Privacy Policy dan dapat berhenti berlangganan kapan saja.</p>
    </form>
  );
}
