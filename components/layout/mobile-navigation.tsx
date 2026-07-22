"use client";

import Link from "next/link";
import { HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon, UserCircleIcon } from "@phosphor-icons/react";

import { Logo } from "@/components/shared/logo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { mainNavigation } from "@/constants/storefront";

interface MobileNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: () => void;
  cartCount: number;
  wishlistCount: number;
}

export function MobileNavigation({ open, onOpenChange, onSearch, cartCount, wishlistCount }: MobileNavigationProps) {
  const navigate = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[min(92vw,25rem)] gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-5 text-left">
          <SheetTitle><Logo /></SheetTitle>
          <SheetDescription className="sr-only">Main store navigation</SheetDescription>
        </SheetHeader>

        <div className="border-b border-border p-4">
          <Button variant="outline" className="w-full justify-start gap-3 normal-case tracking-normal" onClick={() => { onOpenChange(false); onSearch(); }}>
            <MagnifyingGlassIcon size={18} aria-hidden /> Search the collection
          </Button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-5" aria-label="Navigasi mobile">
          <Accordion type="single" collapsible>
            {mainNavigation.map((item) => (
              <AccordionItem key={item.href} value={item.href} className="border-border">
                <AccordionTrigger className={item.featured ? "text-destructive" : undefined}>{item.label}</AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Link href={item.href} prefetch={false} onClick={navigate} className="mb-4 inline-block text-xs font-semibold tracking-wider uppercase underline underline-offset-4">View all {item.label}</Link>
                  <div className="space-y-5 pl-3">
                    {item.groups?.map((group) => (
                      <div key={group.title}>
                        <p className="mb-2 text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{group.title}</p>
                        <ul className="grid gap-2">
                          {group.links.map((link) => <li key={link.href}><Link href={link.href} prefetch={false} onClick={navigate} className="block py-1 text-sm no-underline">{link.label}</Link></li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </nav>

        <div className="grid grid-cols-3 border-t border-border bg-secondary/30">
          <MobileUtilityLink href="/account" label="Account" icon={<UserCircleIcon aria-hidden />} onClick={navigate} />
          <MobileUtilityLink href="/wishlist" label={`Wishlist (${wishlistCount})`} icon={<HeartIcon aria-hidden />} onClick={navigate} />
          <MobileUtilityLink href="/cart" label={`Cart (${cartCount})`} icon={<ShoppingBagIcon aria-hidden />} onClick={navigate} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileUtilityLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  return <Link href={href} prefetch={false} onClick={onClick} className="flex min-w-0 flex-col items-center gap-1.5 border-r border-border px-2 py-4 text-[0.625rem] font-semibold tracking-wide uppercase last:border-r-0 [&_svg]:size-5">{icon}<span className="max-w-full truncate">{label}</span></Link>;
}
