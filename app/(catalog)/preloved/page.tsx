import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import type { RawCatalogSearchParams } from "@/types/catalog";

export function generateMetadata({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) { return catalogMetadata({ title: "Authenticated Preloved", description: "Produk fashion preloved pilihan dengan kondisi transparan dan autentikasi.", pathname: "/preloved", searchParams, preset: { conditions: ["preloved"] } }); }

export default function PrelovedPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/preloved" searchParams={searchParams} config={{ title: "Preloved icons", eyebrow: "Authenticated archive", description: "Setiap item telah melalui pemeriksaan keaslian dan dilengkapi catatan kondisi yang transparan.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Preloved" }], preset: { conditions: ["preloved"] }, lockedFilters: ["condition"] }} />;
}
