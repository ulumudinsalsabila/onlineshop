import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import { findCategoryBySlug } from "@/lib/data/products";
import type { RawCatalogSearchParams } from "@/types/catalog";

const categoryCopy: Record<string, string> = {
  bags: "Refined structure, supple leather, and proportions designed for the rhythm of every day.",
  shoes: "From light slingbacks to characterful loafers, selected for comfort and enduring lines.",
  accessories: "Small details with a distinct presence—silk, timepieces, and personal finishing touches.",
  men: "Men’s leather goods and footwear with clean forms, nuanced materials, and considered function.",
};

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<RawCatalogSearchParams> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  return category ? catalogMetadata({ title: category.name, description: category.description ?? categoryCopy[slug] ?? `The IVORY ${category.name} collection.`, pathname: `/category/${slug}`, searchParams, preset: { categories: [slug] } }) : { title: "Category", robots: { index: false, follow: false } };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<RawCatalogSearchParams> }) {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  if (!category) notFound();
  return <CatalogRoutePage pathname={`/category/${slug}`} searchParams={searchParams} config={{ title: category.name, eyebrow: "Shop by category", description: category.description ?? categoryCopy[slug] ?? "A considered selection to complete your wardrobe.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: category.name }], preset: { categories: [slug] }, lockedFilters: ["category"] }} />;
}
