"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

import { EmptyState } from "@/components/shared/empty-state";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchData } from "@/constants/storefront";
import { backendApiUrl } from "@/lib/api-url";
import type { CatalogProduct } from "@/types/catalog";

export function SearchOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([...searchData.recent]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(backendApiUrl(`/search?q=${encodeURIComponent(query.trim())}`), { signal: controller.signal, credentials: "include" })
        .then((response) => response.json())
        .then((result: { success: boolean; data?: { suggestions?: CatalogProduct[] } }) => { if (result.success) setProducts(result.data?.suggestions ?? []); })
        .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === "AbortError")) setProducts([]); });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, query]);

  const hasResults = !normalizedQuery || products.length > 0;

  function chooseSearch(value: string) {
    setQuery(value);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-0 left-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 p-0 sm:max-w-none">
        <div className="mx-auto w-full max-w-5xl px-(--container-gutter) py-5 sm:py-9">
          <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
            <div>
              <DialogTitle className="font-serif text-3xl font-medium sm:text-4xl">Find your next piece</DialogTitle>
              <DialogDescription className="mt-1">Search collections, categories, or styles.</DialogDescription>
            </div>
            <Button aria-label="Close search" variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <XIcon size={20} aria-hidden />
            </Button>
          </div>

          <form role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="site-search" className="sr-only">Search products</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-0 -translate-y-1/2 text-muted-foreground" size={24} aria-hidden />
              <Input
                id="site-search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try ‘shoulder bag’ or ‘silk scarf’"
                className="h-16 rounded-none border-x-0 border-t-0 bg-transparent pr-12 pl-10 font-serif text-xl shadow-none focus-visible:ring-0 sm:text-2xl"
              />
              {query ? (
                <Button type="button" variant="ghost" size="sm" className="absolute top-1/2 right-0 -translate-y-1/2" onClick={() => setQuery("")}>
                  Clear
                </Button>
              ) : null}
            </div>
          </form>

          {!normalizedQuery ? (
            <div className="grid gap-8 py-9 md:grid-cols-2">
              <SearchTerms title="Recent searches" values={recent} onChoose={chooseSearch} action={recent.length ? <button type="button" onClick={() => setRecent([])} className="text-xs font-semibold tracking-wider uppercase underline underline-offset-4">Clear all</button> : null} />
              <SearchTerms title="Popular now" values={searchData.popular} onChoose={chooseSearch} />
            </div>
          ) : null}

          {hasResults ? (
            <section className="border-t border-border py-8" aria-labelledby="suggested-products-title">
              <div className="mb-5 flex items-end justify-between">
                <h2 id="suggested-products-title" className="font-serif text-2xl font-medium">{normalizedQuery ? `Results for “${query.trim()}”` : "Suggested products"}</h2>
                <Link href={`/search?q=${encodeURIComponent(query)}`} prefetch={false} onClick={() => onOpenChange(false)} className="hidden items-center gap-2 text-xs font-semibold tracking-wider uppercase sm:flex">
                  View all <ArrowRightIcon aria-hidden />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`} prefetch={false} onClick={() => onOpenChange(false)} className="group grid grid-cols-[5.5rem_1fr] gap-4 sm:block">
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      <Image src={product.image} alt={product.name} width={1254} height={1254} sizes="(max-width: 640px) 88px, 30vw" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                    </div>
                    <div className="mt-0 self-center sm:mt-3">
                      <p className="text-xs tracking-wider text-muted-foreground uppercase">{product.category}</p>
                      <h3 className="mt-1 font-serif text-lg leading-tight">{product.name}</h3>
                      <Price amount={product.price} className="mt-2 text-sm" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <EmptyState className="mt-8" title="We could not find what you are looking for" description="Try a broader term, such as bags, shoes, or accessories." action={<Button variant="outline" onClick={() => setQuery("")}>Reset search</Button>} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchTerms({ title, values, onChoose, action }: { title: string; values: string[]; onChoose: (value: string) => void; action?: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">{title}</h2>
        {action}
      </div>
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => <button key={value} type="button" onClick={() => onChoose(value)} className="rounded-full border border-border bg-card px-3.5 py-2 text-sm transition-colors hover:border-foreground/30 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{value}</button>)}
        </div>
      ) : <p className="text-sm text-muted-foreground">No recent searches yet.</p>}
    </section>
  );
}
