import type { Metadata } from "next";

import { CatalogRoutePage } from "@/features/catalog";
import type { RawCatalogSearchParams } from "@/types/catalog";

export const metadata: Metadata = { title: "Semua Produk", description: "Jelajahi seluruh kurasi fashion premium Maison Élan." };

export default function ProductsPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/products" searchParams={searchParams} config={{ title: "The complete edit", eyebrow: "All products", description: "Jelajahi seluruh kurasi kami—dari leather goods berstruktur hingga detail yang menyempurnakan keseharian.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Products" }] }} />;
}

