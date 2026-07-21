import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import type { RawCatalogSearchParams } from "@/types/catalog";

export function generateMetadata({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) { return catalogMetadata({ title: "New Arrivals", description: "Discover the latest premium-fashion arrivals at IVORY.", pathname: "/new-arrivals", searchParams, preset: { onlyNew: true } }); }

export default function NewArrivalsPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/new-arrivals" searchParams={searchParams} config={{ title: "New arrivals", eyebrow: "Just landed", description: "New silhouettes, expressive materials, and this week’s most recent additions.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "New Arrivals" }], preset: { onlyNew: true } }} />;
}
