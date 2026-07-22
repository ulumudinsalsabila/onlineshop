"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { HeartIcon, ListIcon, MagnifyingGlassIcon, ShoppingBagIcon, UserCircleIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";

import { Container } from "@/components/shared/container";
import { useCommerce } from "@/components/shared/commerce-provider";
import { IconButton } from "@/components/shared/icon-button";
import { Logo } from "@/components/shared/logo";
import { mainNavigation } from "@/constants/storefront";
import type { NavigationItem } from "@/types/storefront";

import { AnnouncementBar } from "./announcement-bar";
import { MegaMenu } from "./mega-menu";
import { MobileNavigation } from "./mobile-navigation";

const SearchOverlay = dynamic(() => import("./search-overlay").then((module) => module.SearchOverlay));

export function SiteHeader() {
  const { cartCount, wishlistIds, setCartOpen, hydrated } = useCommerce();
  const wishlistCount = hydrated ? wishlistIds.length : 0;
  const visibleCartCount = hydrated ? cartCount : 0;
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<NavigationItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const updateShadow = () => setHasScrolled(window.scrollY > 8);
    updateShadow();
    window.addEventListener("scroll", updateShadow, { passive: true });
    return () => window.removeEventListener("scroll", updateShadow);
  }, []);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setActiveMenu(null);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((event.key === "/" && !isTyping) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function closeMenus() {
    setActiveMenu(null);
  }

  return (
    <>
      <header className={`sticky top-0 z-40 bg-background/96 backdrop-blur-md transition-shadow duration-300 ${hasScrolled ? "shadow-soft" : "shadow-none"}`}>
        <AnnouncementBar />
        <Container className="grid h-16 grid-cols-3 items-center gap-2 px-3 sm:h-20 sm:gap-4 sm:px-(--container-gutter)">
          <div className="flex items-center gap-1 lg:hidden">
            <IconButton aria-label="Open menu" variant="ghost" onClick={() => setMobileOpen(true)}>
              <ListIcon size={21} aria-hidden />
            </IconButton>
            <IconButton aria-label="Search" variant="ghost" onClick={() => setSearchOpen(true)}>
              <MagnifyingGlassIcon size={20} aria-hidden />
            </IconButton>
          </div>
          <button type="button" onClick={() => setSearchOpen(true)} className="hidden w-fit items-center gap-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:flex">
            <MagnifyingGlassIcon size={19} aria-hidden /> Search <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-sans text-[0.625rem]">/</kbd>
          </button>
          <Link href="/" aria-label="IVORY, home" className="min-w-0 justify-self-center focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <Logo compact />
          </Link>
          <div className="flex items-center justify-end gap-0.5">
            <div className="hidden items-center sm:flex">
              <HeaderUtilityLink href="/account" label="Account">
                <UserCircleIcon aria-hidden />
              </HeaderUtilityLink>
              <HeaderUtilityLink href="/wishlist" label="Wishlist" count={wishlistCount}>
                <HeartIcon aria-hidden />
              </HeaderUtilityLink>
            </div>
            <HeaderUtilityButton label="Shopping cart" count={visibleCartCount} onClick={() => setCartOpen(true)}>
              <ShoppingBagIcon aria-hidden />
            </HeaderUtilityButton>
          </div>
        </Container>

        <div className="relative hidden border-t border-border lg:block" onMouseLeave={closeMenus}>
          <Container>
            <nav aria-label="Navigasi utama">
              <ul className="flex h-12 items-center justify-center gap-7 xl:gap-9">
                {mainNavigation.map((item) => {
                  const isOpen = activeMenu?.href === item.href;
                  const menuId = `mega-menu-${item.label.toLowerCase().replaceAll(" ", "-")}`;
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={menuId}
                        onMouseEnter={() => setActiveMenu(item)}
                        onFocus={() => setActiveMenu(item)}
                        onClick={() => setActiveMenu(isOpen ? null : item)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") closeMenus();
                        }}
                        className={`relative h-12 text-[0.7rem] font-semibold tracking-[0.12em] uppercase transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-foreground after:transition-transform hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100 aria-expanded:after:scale-x-100 ${item.featured ? "text-destructive" : ""}`}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </Container>
          <AnimatePresence>{activeMenu ? <MegaMenu key={activeMenu.href} item={activeMenu} onNavigate={closeMenus} /> : null}</AnimatePresence>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
      <MobileNavigation open={mobileOpen} onOpenChange={setMobileOpen} onSearch={() => setSearchOpen(true)} cartCount={visibleCartCount} wishlistCount={wishlistCount} />
    </>
  );
}

function HeaderUtilityButton({ label, count, onClick, children }: { label: string; count?: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={count ? `${label}, ${count} item` : label} className="relative inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-5">
      {children}
      {count ? <span className="absolute top-0.5 right-0 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[0.5625rem] leading-4 font-bold text-accent-foreground">{count}</span> : null}
    </button>
  );
}

function HeaderUtilityLink({ href, label, count, className = "", children }: { href: string; label: string; count?: number; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} prefetch={false} aria-label={count ? `${label}, ${count} item` : label} className={`relative inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-5 ${className}`}>
      {children}
      {count ? <span className="absolute top-0.5 right-0 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[0.5625rem] leading-4 font-bold text-accent-foreground">{count}</span> : null}
    </Link>
  );
}
