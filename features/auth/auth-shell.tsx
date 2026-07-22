import type { ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <main id="main-content" className="grid min-h-svh bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex items-center px-(--container-gutter) py-14">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" aria-label="IVORY, home"><Logo /></Link>
          <p className="mt-14 text-[0.625rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-(length:--text-heading-1) leading-[0.95]">{title}</h1>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">{description}</p>
          {children}
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#28231f,#8f7d69)] lg:block" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(238,226,208,0.42),transparent_35%)]" />
        <p className="absolute right-12 bottom-12 max-w-sm font-serif text-4xl leading-tight text-white">Private access to considered pieces.</p>
      </aside>
    </main>
  );
}
