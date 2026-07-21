import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

import { Container } from "@/components/shared/container";
import { StorefrontBreadcrumb } from "@/components/shared/storefront-breadcrumb";
import { Button } from "@/components/ui/button";
import { popularCatalogKeywords } from "@/constants/catalog";
import { queryToSearchParams, parseCatalogQuery } from "@/lib/catalog-query";
import type { CatalogPageConfig, RawCatalogSearchParams } from "@/types/catalog";
import { ProductCard } from "@/features/home/product-card";

import { CatalogControls } from "./catalog-controls";
import { CatalogEmptyState } from "./catalog-empty-state";
import { CatalogGridTransition } from "./catalog-grid-transition";
import { CatalogListingSkeleton } from "./catalog-listing-skeleton";
import { CatalogPagination } from "./catalog-pagination";
import { getCatalogProducts } from "./catalog-service";

interface CatalogRoutePageProps {
  config: CatalogPageConfig;
  pathname: string;
  searchParams: Promise<RawCatalogSearchParams>;
}

export function CatalogRoutePage(props: CatalogRoutePageProps) {
  return <Suspense fallback={<CatalogListingSkeleton />}><CatalogPageContent {...props} /></Suspense>;
}

async function CatalogPageContent({ config, pathname, searchParams }: CatalogRoutePageProps) {
  const query = parseCatalogQuery(await searchParams);
  const response = await getCatalogProducts(query, config.preset);
  const resolvedQuery = { ...query, page: response.page };
  const queryKey = queryToSearchParams(resolvedQuery).toString() || "all";
  const suggestions = [...response.items, ...response.recommendations].flatMap((product) => [product.name, product.brand, product.category]);
  const heading = config.searchMode && query.q ? `Hasil untuk “${query.q}”` : config.title;

  return (
    <div className="pb-(--space-section)">
      <header className="border-b border-border bg-secondary/35 py-10 sm:py-14">
        <Container>
          <StorefrontBreadcrumb items={config.breadcrumbs} />
          <p className="mt-9 text-[0.625rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">{config.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl font-serif text-(length:--text-heading-1) leading-[0.94] font-medium">{heading}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{config.description}</p>
          {config.searchMode && !query.q ? (
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="mr-2 text-[0.625rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Popular now</span>
              {popularCatalogKeywords.map((keyword) => <Link key={keyword} href={`/search?q=${encodeURIComponent(keyword)}`} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{keyword}</Link>)}
            </div>
          ) : null}
        </Container>
      </header>

      <Container>
        <CatalogControls query={resolvedQuery} total={response.total} suggestions={suggestions} config={config}>
          <CatalogGridTransition transitionKey={queryKey}>
            {response.items.length ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 xl:grid-cols-3">
                {response.items.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <>
                <CatalogEmptyState action={<Button asChild variant="outline"><Link href={pathname}>Reset pencarian</Link></Button>} />
                {response.recommendations.length ? (
                  <section className="mt-14" aria-labelledby="recommendations-title">
                    <div className="flex items-end justify-between gap-5"><div><p className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">You may also like</p><h2 id="recommendations-title" className="mt-2 font-serif text-3xl">Pilihan yang sedang diminati</h2></div><Link href="/products" className="hidden items-center gap-2 text-xs font-semibold tracking-wider uppercase sm:flex">View all <ArrowRightIcon aria-hidden /></Link></div>
                    <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 xl:grid-cols-4">{response.recommendations.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                  </section>
                ) : null}
              </>
            )}
          </CatalogGridTransition>
          <CatalogPagination query={resolvedQuery} page={response.page} totalPages={response.totalPages} />
        </CatalogControls>
      </Container>
    </div>
  );
}
