import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import type { RawCatalogSearchParams } from "@/types/catalog";

export function generateMetadata({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) { return catalogMetadata({ title: "Authenticated Preloved", description: "Curated preloved fashion with transparent condition notes and authentication.", pathname: "/preloved", searchParams, preset: { conditions: ["preloved"] } }); }

export default function PrelovedPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/preloved" searchParams={searchParams} config={{ title: "Preloved icons", eyebrow: "Authenticated archive", description: "Every piece has passed an authenticity review and includes transparent condition notes.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Preloved" }], preset: { conditions: ["preloved"] }, lockedFilters: ["condition"] }} />;
}
