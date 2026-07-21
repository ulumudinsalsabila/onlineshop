import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { catalogBrands } from "@/constants/catalog";
import { CatalogRoutePage } from "@/features/catalog";
import type { RawCatalogSearchParams } from "@/types/catalog";

export function generateStaticParams() {
  return catalogBrands.map((brand) => ({ slug: brand.value }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = catalogBrands.find((item) => item.value === slug);
  return brand ? { title: brand.label, description: `Jelajahi pilihan ${brand.label} dalam kurasi Maison Élan.` } : { title: "Brand" };
}

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<RawCatalogSearchParams> }) {
  const { slug } = await params;
  const brand = catalogBrands.find((item) => item.value === slug);
  if (!brand) notFound();
  return <CatalogRoutePage pathname={`/brand/${slug}`} searchParams={searchParams} config={{ title: brand.label, eyebrow: "Designer focus", description: `Pilihan ${brand.label} yang kami kurasi karena craft, proporsi, dan point of view yang terasa relevan melampaui musim.`, breadcrumbs: [{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: brand.label }], preset: { brands: [slug] }, lockedFilters: ["brand"] }} />;
}

