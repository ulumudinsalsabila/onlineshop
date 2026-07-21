import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth-guard";

import { logout } from "./actions";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = { title: "Account", ...privateMetadata };

const links = [["Overview", "/account"], ["Profile", "/account/profile"], ["Addresses", "/account/addresses"], ["Orders", "/account/orders"], ["Wishlist", "/account/wishlist"], ["Returns", "/account/returns"], ["Security", "/account/security"]] as const;

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-svh bg-secondary/20">
      <header className="border-b border-border bg-background">
        <Container className="flex h-20 items-center justify-between">
          <Link href="/"><Logo compact /></Link>
          <div className="text-right"><p className="text-xs font-semibold">{user.name}</p><p className="text-[0.625rem] tracking-wider text-muted-foreground uppercase">{user.role}</p></div>
        </Container>
      </header>
      <Container className="grid gap-10 py-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-14">
        <aside>
          <nav aria-label="Account navigation"><ul className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:grid-cols-1">{links.map(([label, href]) => <li key={href}><Link href={href} className="block bg-background px-4 py-3 text-xs font-semibold tracking-wider uppercase hover:bg-secondary">{label}</Link></li>)}</ul></nav>
          <form action={logout}><Button type="submit" variant="ghost" className="mt-4 w-full justify-start"><SignOutIcon aria-hidden /> Logout</Button></form>
        </aside>
        <main id="main-content" className="min-w-0">{children}</main>
      </Container>
    </div>
  );
}
