import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { catalogCategories } from "@/constants/catalog";
import { CatalogRoutePage } from "@/features/catalog";
import type { RawCatalogSearchParams } from "@/types/catalog";

const categoryCopy: Record<string, string> = {
  bags: "Struktur yang refined, leather yang lembut, dan proporsi yang dirancang untuk mengikuti ritme setiap hari.",
  shoes: "Dari slingback ringan hingga loafers berkarakter, dipilih untuk kenyamanan dan garis yang bertahan lama.",
  accessories: "Detail kecil dengan kehadiran besar—silk, timepieces, dan finishing touch yang terasa personal.",
  men: "Leather goods dan footwear pria dengan bentuk bersih, material bernuansa, dan fungsi yang dipertimbangkan.",
};

export function generateStaticParams() {
  return catalogCategories.map((category) => ({ slug: category.value }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = catalogCategories.find((item) => item.value === slug);
  return category ? { title: category.label, description: categoryCopy[slug] } : { title: "Category" };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<RawCatalogSearchParams> }) {
  const { slug } = await params;
  const category = catalogCategories.find((item) => item.value === slug);
  if (!category) notFound();
  return <CatalogRoutePage pathname={`/category/${slug}`} searchParams={searchParams} config={{ title: category.label, eyebrow: "Shop by category", description: categoryCopy[slug] ?? "Pilihan terkurasi untuk melengkapi gaya Anda.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: category.label }], preset: { categories: [slug] }, lockedFilters: ["category"] }} />;
}

