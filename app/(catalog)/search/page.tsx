import type { Metadata } from "next";

import { CatalogRoutePage } from "@/features/catalog";
import type { RawCatalogSearchParams } from "@/types/catalog";

export const metadata: Metadata = { title: "Search", description: "Cari produk dan brand dalam kurasi Maison Élan." };

export default function SearchPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/search" searchParams={searchParams} config={{ title: "Find your next piece", eyebrow: "Search the collection", description: "Cari melalui nama produk, rumah mode, kategori, warna, atau detail yang Anda ingat.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Search" }], searchMode: true }} />;
}

