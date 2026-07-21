import type { Metadata } from "next";

import { CatalogRoutePage } from "@/features/catalog";
import type { RawCatalogSearchParams } from "@/types/catalog";

export const metadata: Metadata = { title: "Private Sale", description: "Pilihan seasonal fashion premium dengan harga khusus." };

export default function SalePage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/sale" searchParams={searchParams} config={{ title: "The private sale", eyebrow: "A considered reduction", description: "Harga khusus untuk pilihan seasonal—tetap dikurasi dengan standar material dan karakter yang sama.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Sale" }], preset: { onSale: true }, lockedFilters: ["discount"] }} />;
}

