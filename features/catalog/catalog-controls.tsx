"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, CircleNotchIcon, FunnelIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { CATALOG_MAX_PRICE, CATALOG_MIN_PRICE, catalogBrands, catalogCategories, catalogColors, catalogSizes, catalogSortOptions } from "@/constants/catalog";
import { formatIDR } from "@/lib/formatters";
import { queryToSearchParams } from "@/lib/catalog-query";
import { cn } from "@/lib/utils";
import type { CatalogPageConfig, CatalogQuery } from "@/types/catalog";

interface CatalogControlsProps {
  query: CatalogQuery;
  total: number;
  suggestions: string[];
  config: Pick<CatalogPageConfig, "lockedFilters" | "searchMode">;
  children: React.ReactNode;
}

const recentStorageKey = "maison-elan-catalog-searches";

export function CatalogControls({ query, total, suggestions, config, children }: CatalogControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchDraft, setSearchDraft] = useState({
    source: query.q,
    value: query.q,
  });
  const searchValue = searchDraft.source === query.q ? searchDraft.value : query.q;
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(localStorage.getItem(recentStorageKey) ?? "[]") as unknown;
      return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string").slice(0, 5) : [];
    } catch {
      return [];
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [draft, setDraft] = useState(query);

  function navigate(next: CatalogQuery, mode: "push" | "replace" = "push") {
    const params = queryToSearchParams({
      ...next,
      page: Math.max(1, next.page),
    });
    const href = params.size ? `${pathname}?${params}` : pathname;
    startTransition(() => router[mode](href, { scroll: false }));
  }

  useEffect(() => {
    const normalized = searchValue.trim();
    if (normalized === query.q) return;
    const timer = window.setTimeout(() => navigate({ ...query, q: normalized, page: 1 }, "replace"), 400);
    return () => window.clearTimeout(timer);
    // query is intentionally represented by the URL-driven q value here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, query.q, currentSearchParams, pathname]);

  function rememberSearch(value: string) {
    const normalized = value.trim();
    if (!normalized) return;
    const next = [normalized, ...recentSearches.filter((item) => item.toLocaleLowerCase("en") !== normalized.toLocaleLowerCase("en"))].slice(0, 5);
    setRecentSearches(next);
    localStorage.setItem(recentStorageKey, JSON.stringify(next));
  }

  function patch(patchValue: Partial<CatalogQuery>) {
    navigate({ ...query, ...patchValue, page: 1 });
  }

  const locked = new Set(config.lockedFilters ?? []);
  const activeFilterCount = countFilters(query, locked);
  const chips = createChips(query, locked, patch);
  const visibleSuggestions = useMemo(() => {
    const term = searchValue.trim().toLocaleLowerCase("en");
    const source = term ? suggestions.filter((item) => item.toLocaleLowerCase("en").includes(term)) : recentSearches;
    return [...new Set(source)].slice(0, 6);
  }, [recentSearches, searchValue, suggestions]);

  return (
    <>
      <div className={cn("relative z-20", config.searchMode ? "mt-8 max-w-3xl" : "mt-8 max-w-2xl")}>
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            rememberSearch(searchValue);
            setSearchFocused(false);
            navigate({ ...query, q: searchValue.trim(), page: 1 });
          }}
        >
          <Label htmlFor="catalog-search" className="sr-only">
            Search products
          </Label>
          <div className="relative border-b border-foreground/35">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-muted-foreground" size={20} aria-hidden />
            <Input id="catalog-search" type="search" value={searchValue} onChange={(event) => setSearchDraft({ source: query.q, value: event.target.value })} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)} placeholder="Search by product, brand, or category" autoComplete="off" className="h-14 rounded-none border-0 bg-transparent pr-20 pl-8 text-base shadow-none focus-visible:ring-0" />
            <button type="submit" className="absolute top-1/2 right-0 -translate-y-1/2 text-[0.625rem] font-semibold tracking-[0.14em] uppercase focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
              Search
            </button>
          </div>
        </form>

        <AnimatePresence>
          {searchFocused && visibleSuggestions.length ? (
            <m.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute inset-x-0 top-full border border-border bg-popover p-3 shadow-lifted">
              <p className="px-3 py-2 text-[0.625rem] font-semibold tracking-[0.15em] text-muted-foreground uppercase">{searchValue.trim() ? "Suggestions" : "Recent searches"}</p>
              <ul>
                {visibleSuggestions.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setSearchDraft({ source: query.q, value: item });
                        rememberSearch(item);
                        setSearchFocused(false);
                        navigate({ ...query, q: item, page: 1 });
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <MagnifyingGlassIcon size={16} aria-hidden />
                      <HighlightedText text={item} keyword={searchValue} />
                    </button>
                  </li>
                ))}
              </ul>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-10 border-y border-border py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => {
                setDraft(query);
                setMobileOpen(true);
              }}
            >
              <FunnelIcon aria-hidden /> Filters {activeFilterCount ? <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.625rem] text-primary-foreground">{activeFilterCount}</span> : null}
            </Button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground">{total}</span> results
            </p>
            {isPending ? <CircleNotchIcon className="animate-spin text-muted-foreground" aria-label="Updating results" /> : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:inline">Sort by</span>
            <SearchableSelect value={query.sort} onValueChange={(value) => patch({ sort: value as CatalogQuery["sort"] })} options={catalogSortOptions} aria-label="Sort products" searchPlaceholder="Search sorting options…" className="h-10 min-w-44 rounded-none border-border bg-background" />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {chips.length ? (
            <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-2 pt-4">
                {chips.map((chip) => (
                  <m.button layout key={chip.key} type="button" onClick={chip.remove} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    {chip.label}
                    <XIcon size={13} aria-hidden />
                  </m.button>
                ))}
                <button type="button" onClick={() => patch(resetFilters(query))} className="px-2 text-xs font-semibold underline underline-offset-4">
                  Reset filters
                </button>
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Product filters">
          <div className="sticky top-44">
            <FilterFields value={query} locked={locked} onChange={patch} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(92vw,27rem)] gap-0 sm:max-w-md">
          <SheetHeader className="border-b border-border p-5 pr-14">
            <SheetTitle className="font-serif text-2xl">Refine your edit</SheetTitle>
            <SheetDescription>{countFilters(draft, locked)} active filters</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5">
            <FilterFields value={draft} locked={locked} onChange={(value) => setDraft((current) => ({ ...current, ...value }))} />
          </div>
          <SheetFooter className="grid grid-cols-2 border-t border-border p-4">
            <Button
              variant="outline"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  ...resetFilters(current),
                }))
              }
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setMobileOpen(false);
                navigate({ ...query, ...draft, page: 1 });
              }}
            >
              <CheckIcon aria-hidden /> Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

function FilterFields({ value, locked, onChange }: { value: CatalogQuery; locked: Set<string>; onChange: (patch: Partial<CatalogQuery>) => void }) {
  return (
    <Accordion type="multiple" defaultValue={["category", "brand", "condition", "price", "color", "size", "availability", "discount"]}>
      {!locked.has("category") ? (
        <FilterSection value="category" title="Category">
          <CheckList options={catalogCategories} selected={value.categories} onChange={(categories) => onChange({ categories })} />
        </FilterSection>
      ) : null}
      {!locked.has("brand") ? (
        <FilterSection value="brand" title="Brand">
          <CheckList options={catalogBrands} selected={value.brands} onChange={(brands) => onChange({ brands })} />
        </FilterSection>
      ) : null}
      {!locked.has("condition") ? (
        <FilterSection value="condition" title="Condition">
          <CheckList
            options={[
              { value: "new", label: "New" },
              { value: "preloved", label: "Preloved" },
            ]}
            selected={value.conditions}
            onChange={(conditions) => onChange({ conditions: conditions as CatalogQuery["conditions"] })}
          />
        </FilterSection>
      ) : null}
      <FilterSection value="price" title="Price range">
        <div className="px-1 pt-2">
          <Slider min={CATALOG_MIN_PRICE} max={CATALOG_MAX_PRICE} step={250_000} value={[value.minPrice, value.maxPrice]} onValueCommit={([minPrice, maxPrice]) => onChange({ minPrice, maxPrice })} aria-label="Price range" />
          <div className="mt-4 flex justify-between text-xs text-muted-foreground">
            <span>{formatIDR(value.minPrice)}</span>
            <span>{formatIDR(value.maxPrice)}</span>
          </div>
        </div>
      </FilterSection>
      <FilterSection value="color" title="Color">
        <CheckList options={catalogColors} selected={value.colors} onChange={(colors) => onChange({ colors })} swatches />
      </FilterSection>
      <FilterSection value="size" title="Size">
        <div className="grid grid-cols-4 gap-2">
          {catalogSizes.map((size) => {
            const active = value.sizes.includes(size);
            return (
              <button key={size} type="button" aria-pressed={active} onClick={() => onChange({ sizes: toggle(value.sizes, size) })} className={cn("min-h-9 border px-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring", active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary", size === "One Size" && "col-span-2")}>
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>
      <FilterSection value="availability" title="Availability">
        <label className="flex cursor-pointer items-center gap-3 py-2 text-sm">
          <Checkbox checked={value.inStock} onCheckedChange={(checked) => onChange({ inStock: checked === true })} /> In stock only
        </label>
      </FilterSection>
      {!locked.has("discount") ? (
        <FilterSection value="discount" title="Discount">
          <div className="grid grid-cols-2 gap-2">
            {[0, 10, 20, 30].map((discount) => (
              <button key={discount} type="button" aria-pressed={value.minDiscount === discount} onClick={() => onChange({ minDiscount: discount })} className={cn("border border-border px-3 py-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring", value.minDiscount === discount && "border-primary bg-primary text-primary-foreground")}>
                {discount ? `${discount}%+` : "All"}
              </button>
            ))}
          </div>
        </FilterSection>
      ) : null}
    </Accordion>
  );
}

function FilterSection({ value, title, children }: { value: string; title: string; children: React.ReactNode }) {
  return (
    <AccordionItem value={value} className="border-border">
      <AccordionTrigger className="rounded-none py-4 text-xs font-semibold tracking-[0.12em] uppercase hover:no-underline">{title}</AccordionTrigger>
      <AccordionContent className="pb-5">{children}</AccordionContent>
    </AccordionItem>
  );
}

function CheckList({ options, selected, onChange, swatches = false }: { options: ReadonlyArray<{ value: string; label: string; swatch?: string }>; selected: string[]; onChange: (items: string[]) => void; swatches?: boolean }) {
  return (
    <div className="space-y-1">
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-3 py-2 text-sm">
          <Checkbox checked={selected.includes(option.value)} onCheckedChange={() => onChange(toggle(selected, option.value))} />
          {swatches ? <span className="size-3 rounded-full border border-black/10" style={{ backgroundColor: option.swatch }} aria-hidden /> : null}
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function resetFilters(query: CatalogQuery): Partial<CatalogQuery> {
  return {
    categories: [],
    brands: [],
    conditions: [],
    minPrice: CATALOG_MIN_PRICE,
    maxPrice: CATALOG_MAX_PRICE,
    colors: [],
    sizes: [],
    inStock: false,
    minDiscount: 0,
    page: 1,
    q: query.q,
    sort: query.sort,
  };
}

function countFilters(query: CatalogQuery, locked: Set<string>): number {
  return (locked.has("category") ? 0 : query.categories.length) + (locked.has("brand") ? 0 : query.brands.length) + (locked.has("condition") ? 0 : query.conditions.length) + query.colors.length + query.sizes.length + (query.minPrice > CATALOG_MIN_PRICE || query.maxPrice < CATALOG_MAX_PRICE ? 1 : 0) + (query.inStock ? 1 : 0) + (locked.has("discount") || !query.minDiscount ? 0 : 1);
}

function createChips(query: CatalogQuery, locked: Set<string>, patch: (value: Partial<CatalogQuery>) => void) {
  const chips: Array<{ key: string; label: string; remove: () => void }> = [];
  if (!locked.has("category"))
    query.categories.forEach((value) =>
      chips.push({
        key: `category-${value}`,
        label: catalogCategories.find((item) => item.value === value)?.label ?? value,
        remove: () =>
          patch({
            categories: query.categories.filter((item) => item !== value),
          }),
      }),
    );
  if (!locked.has("brand"))
    query.brands.forEach((value) =>
      chips.push({
        key: `brand-${value}`,
        label: catalogBrands.find((item) => item.value === value)?.label ?? value,
        remove: () => patch({ brands: query.brands.filter((item) => item !== value) }),
      }),
    );
  if (!locked.has("condition"))
    query.conditions.forEach((value) =>
      chips.push({
        key: `condition-${value}`,
        label: value === "new" ? "New" : "Preloved",
        remove: () =>
          patch({
            conditions: query.conditions.filter((item) => item !== value),
          }),
      }),
    );
  query.colors.forEach((value) =>
    chips.push({
      key: `color-${value}`,
      label: catalogColors.find((item) => item.value === value)?.label ?? value,
      remove: () => patch({ colors: query.colors.filter((item) => item !== value) }),
    }),
  );
  query.sizes.forEach((value) =>
    chips.push({
      key: `size-${value}`,
      label: `Size ${value}`,
      remove: () => patch({ sizes: query.sizes.filter((item) => item !== value) }),
    }),
  );
  if (query.minPrice > CATALOG_MIN_PRICE || query.maxPrice < CATALOG_MAX_PRICE)
    chips.push({
      key: "price",
      label: `${formatIDR(query.minPrice)} – ${formatIDR(query.maxPrice)}`,
      remove: () => patch({ minPrice: CATALOG_MIN_PRICE, maxPrice: CATALOG_MAX_PRICE }),
    });
  if (query.inStock)
    chips.push({
      key: "stock",
      label: "In stock",
      remove: () => patch({ inStock: false }),
    });
  if (!locked.has("discount") && query.minDiscount)
    chips.push({
      key: "discount",
      label: `Discount ${query.minDiscount}%+`,
      remove: () => patch({ minDiscount: 0 }),
    });
  return chips;
}

function HighlightedText({ text, keyword }: { text: string; keyword: string }) {
  const query = keyword.trim();
  if (!query) return <>{text}</>;
  const index = text.toLocaleLowerCase("en").indexOf(query.toLocaleLowerCase("en"));
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-accent/55 text-current">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}
