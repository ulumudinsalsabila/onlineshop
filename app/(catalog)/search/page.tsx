import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import type { RawCatalogSearchParams } from "@/types/catalog";

export function generateMetadata({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) { return catalogMetadata({ title: "Search", description: "Search products and brands in the IVORY curation.", pathname: "/search", searchParams, noindex: true }); }

export default function SearchPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/search" searchParams={searchParams} config={{ title: "Find your next piece", eyebrow: "Search the collection", description: "Search by product name, fashion house, category, colour, or any detail you remember.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Search" }], searchMode: true }} />;
}
