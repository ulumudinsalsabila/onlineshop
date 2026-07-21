import type { Metadata } from "next";

import { CatalogRoutePage } from "@/features/catalog";
import type { RawCatalogSearchParams } from "@/types/catalog";

export const metadata: Metadata = { title: "Authenticated Preloved", description: "Produk fashion preloved pilihan dengan kondisi transparan dan autentikasi." };

export default function PrelovedPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/preloved" searchParams={searchParams} config={{ title: "Preloved icons", eyebrow: "Authenticated archive", description: "Setiap item telah melalui pemeriksaan keaslian dan dilengkapi catatan kondisi yang transparan.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Preloved" }], preset: { conditions: ["preloved"] }, lockedFilters: ["condition"] }} />;
}

