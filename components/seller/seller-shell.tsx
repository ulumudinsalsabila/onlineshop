"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BankIcon, ChartLineIcon, ListIcon, PackageIcon, PlusCircleIcon, StorefrontIcon, UserCircleIcon, WalletIcon, XIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  ["Overview", "/seller", ChartLineIcon],
  ["Submissions", "/seller/submissions", ListIcon],
  ["Add submission", "/seller/submissions/new", PlusCircleIcon],
  ["Listed products", "/seller/listed", PackageIcon],
  ["Sales", "/seller/sales", StorefrontIcon],
  ["Balance", "/seller/balance", WalletIcon],
  ["Payout history", "/seller/payouts", BankIcon],
  ["Profile", "/seller/profile", UserCircleIcon],
] as const;
export function SellerShell({ children, seller }: { children: ReactNode; seller: { displayName: string; status: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-[#f5f1e9]">
      <header className="sticky top-0 z-30 border-b border-[#ddd5c7] bg-[#faf8f3]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Buka menu seller">
                  <ListIcon aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-[#25241f] p-0 text-white">
                <SheetHeader className="flex-row items-center justify-between border-b border-white/10 p-5">
                  <SheetTitle className="text-white">
                    <Logo />
                  </SheetTitle>
                  <button onClick={() => setOpen(false)} aria-label="Tutup menu">
                    <XIcon aria-hidden />
                  </button>
                </SheetHeader>
                <SellerNav pathname={pathname} close={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <Link href="/">
              <Logo />
            </Link>
            <span className="hidden border-l border-[#ddd5c7] pl-4 text-xs tracking-wider uppercase sm:block">Seller Studio</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold">{seller.displayName}</p>
            <p className="text-[0.625rem] tracking-wider text-muted-foreground uppercase">{seller.status}</p>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100dvh-5rem)] border-r border-[#ddd5c7] bg-[#25241f] text-white lg:block">
          <SellerNav pathname={pathname} />
        </aside>
        <main id="main-content" className="min-w-0 p-4 sm:p-7 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
function SellerNav({ pathname, close }: { pathname: string; close?: () => void }) {
  return (
    <nav aria-label="Seller navigation" className="p-4">
      <ul className="space-y-1">
        {links.map(([label, href, Icon]) => {
          const active = href === "/seller" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} onClick={close} className={cn("flex items-center gap-3 rounded-md px-4 py-3 text-xs font-semibold tracking-wider uppercase", active ? "bg-[#b7a271] text-[#25241f]" : "text-white/65 hover:bg-white/10 hover:text-white")}>
                <Icon className="size-5" weight={active ? "fill" : "regular"} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
