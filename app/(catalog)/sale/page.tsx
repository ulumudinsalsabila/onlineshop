import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import type { RawCatalogSearchParams } from "@/types/catalog";

export function generateMetadata({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) { return catalogMetadata({ title: "Private Sale", description: "Selected seasonal premium fashion at private prices.", pathname: "/sale", searchParams, preset: { onSale: true } }); }

export default function SalePage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/sale" searchParams={searchParams} config={{ title: "The private sale", eyebrow: "A considered reduction", description: "Private prices on seasonal pieces, held to the same standards of material and character.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Sale" }], preset: { onSale: true }, lockedFilters: ["discount"] }} />;
}
