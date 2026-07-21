import type { Metadata } from "next";

import { CatalogRoutePage } from "@/features/catalog";
import type { RawCatalogSearchParams } from "@/types/catalog";

export const metadata: Metadata = { title: "New Arrivals", description: "Pilihan fashion premium terbaru di Maison Élan." };

export default function NewArrivalsPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/new-arrivals" searchParams={searchParams} config={{ title: "New arrivals", eyebrow: "Just landed", description: "Siluet baru, material berkarakter, dan pilihan yang baru tiba dalam kurasi minggu ini.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "New Arrivals" }], preset: { onlyNew: true } }} />;
}

