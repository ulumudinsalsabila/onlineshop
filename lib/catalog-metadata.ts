import type { Metadata } from "next";

import { getCatalogProducts } from "@/features/catalog/catalog-service";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { publicMetadata } from "@/lib/seo";
import type { CatalogPreset, RawCatalogSearchParams } from "@/types/catalog";

export async function catalogMetadata(input: { title: string; description: string; pathname: string; searchParams: Promise<RawCatalogSearchParams>; preset?: CatalogPreset; noindex?: boolean }): Promise<Metadata> {
  const query = parseCatalogQuery(await input.searchParams);
  const result = await getCatalogProducts(query, input.preset);
  const canonical = result.page > 1 ? `${input.pathname}?page=${result.page}` : input.pathname;
  const pageTitle = result.page > 1 ? `${input.title} — Page ${result.page}` : input.title;
  const metadata = publicMetadata({ title: pageTitle, description: input.description, path: canonical });
  return {
    ...metadata,
    ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
    pagination: {
      previous: result.page > 1 ? (result.page === 2 ? input.pathname : `${input.pathname}?page=${result.page - 1}`) : null,
      next: result.page < result.totalPages ? `${input.pathname}?page=${result.page + 1}` : null,
    },
  };
}
