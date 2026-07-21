import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import { findBrandBySlug } from "@/lib/data/products";
import type { RawCatalogSearchParams } from "@/types/catalog";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<RawCatalogSearchParams> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await findBrandBySlug(slug);
  return brand ? catalogMetadata({ title: brand.name, description: brand.description ?? `Jelajahi pilihan ${brand.name} dalam kurasi IVORY.`, pathname: `/brand/${slug}`, searchParams, preset: { brands: [slug] } }) : { title: "Brand", robots: { index: false, follow: false } };
}

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<RawCatalogSearchParams> }) {
  const { slug } = await params;
  const brand = await findBrandBySlug(slug);
  if (!brand) notFound();
  return <CatalogRoutePage pathname={`/brand/${slug}`} searchParams={searchParams} config={{ title: brand.name, eyebrow: "Designer focus", description: brand.description ?? `Pilihan ${brand.name} yang kami kurasi karena craft, proporsi, dan point of view yang terasa relevan melampaui musim.`, breadcrumbs: [{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: brand.name }], preset: { brands: [slug] }, lockedFilters: ["brand"] }} />;
}
