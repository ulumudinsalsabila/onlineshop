import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import { findCategoryBySlug } from "@/lib/data/products";
import type { RawCatalogSearchParams } from "@/types/catalog";

const categoryCopy: Record<string, string> = {
  bags: "Struktur yang refined, leather yang lembut, dan proporsi yang dirancang untuk mengikuti ritme setiap hari.",
  shoes: "Dari slingback ringan hingga loafers berkarakter, dipilih untuk kenyamanan dan garis yang bertahan lama.",
  accessories: "Detail kecil dengan kehadiran besar—silk, timepieces, dan finishing touch yang terasa personal.",
  men: "Leather goods dan footwear pria dengan bentuk bersih, material bernuansa, dan fungsi yang dipertimbangkan.",
};

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<RawCatalogSearchParams> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  return category ? catalogMetadata({ title: category.name, description: category.description ?? categoryCopy[slug] ?? `Koleksi ${category.name} IVORY.`, pathname: `/category/${slug}`, searchParams, preset: { categories: [slug] } }) : { title: "Category", robots: { index: false, follow: false } };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<RawCatalogSearchParams> }) {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  if (!category) notFound();
  return <CatalogRoutePage pathname={`/category/${slug}`} searchParams={searchParams} config={{ title: category.name, eyebrow: "Shop by category", description: category.description ?? categoryCopy[slug] ?? "Pilihan terkurasi untuk melengkapi gaya Anda.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: category.name }], preset: { categories: [slug] }, lockedFilters: ["category"] }} />;
}
