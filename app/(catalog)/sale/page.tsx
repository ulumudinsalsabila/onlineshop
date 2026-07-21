import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import type { RawCatalogSearchParams } from "@/types/catalog";

export function generateMetadata({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) { return catalogMetadata({ title: "Private Sale", description: "Pilihan seasonal fashion premium dengan harga khusus.", pathname: "/sale", searchParams, preset: { onSale: true } }); }

export default function SalePage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/sale" searchParams={searchParams} config={{ title: "The private sale", eyebrow: "A considered reduction", description: "Harga khusus untuk pilihan seasonal—tetap dikurasi dengan standar material dan karakter yang sama.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Sale" }], preset: { onSale: true }, lockedFilters: ["discount"] }} />;
}
