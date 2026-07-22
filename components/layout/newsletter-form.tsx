"use client";

import { useRef } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="mt-6"
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Thank you for joining.", {
          description: "Our editorial notes will arrive in your inbox soon.",
        });
        formRef.current?.reset();
      }}
    >
      <label htmlFor="newsletter-email" className="text-xs font-semibold tracking-[0.14em] uppercase">
        Email address
      </label>
      <div className="mt-2 flex border-b border-foreground/30">
        <Input id="newsletter-email" name="email" type="email" autoComplete="email" required placeholder="name@example.com" className="h-12 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
        <Button type="submit" variant="ghost" size="icon" aria-label="Daftar newsletter" className="shrink-0">
          <ArrowRightIcon size={19} aria-hidden />
        </Button>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">By joining, you agree to our Privacy Policy.</p>
    </form>
  );
}
