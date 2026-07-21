"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import * as m from "motion/react-m";

import { Container } from "@/components/shared/container";
import type { NavigationItem } from "@/types/storefront";

export function MegaMenu({ item, onNavigate }: { item: NavigationItem; onNavigate: () => void }) {
  return (
    <m.div
      id={`mega-menu-${item.label.toLowerCase().replaceAll(" ", "-")}`}
      role="region"
      aria-label={`Menu ${item.label}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-x-0 top-full z-40 border-y border-border bg-popover shadow-lifted"
    >
      <Container className="grid grid-cols-[1fr_17rem] gap-12 py-9">
        <div className="grid grid-cols-3 gap-10">
          {item.groups?.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-[0.6875rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">{group.title}</p>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link className="text-sm transition-colors hover:text-accent-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href={link.href} prefetch={false} onClick={onNavigate}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link href="/edits/quiet-luxury" prefetch={false} onClick={onNavigate} className="group relative aspect-[4/3] overflow-hidden bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <Image src="/images/storefront/mega-menu-campaign.png" alt="Tas kulit taupe dalam studio bernuansa hangat" width={1122} height={1402} sizes="272px" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          <span className="absolute inset-x-3 bottom-3 flex items-center justify-between bg-background/92 px-4 py-3 backdrop-blur-sm">
            <span>
              <span className="block text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">The campaign</span>
              <span className="font-serif text-lg">Quiet Structure</span>
            </span>
            <ArrowUpRightIcon size={18} aria-hidden />
          </span>
        </Link>
      </Container>
    </m.div>
  );
}
