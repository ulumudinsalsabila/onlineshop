import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import type { RawCatalogSearchParams } from "@/types/catalog";

export function generateMetadata({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) { return catalogMetadata({ title: "All Products", description: "Explore the complete IVORY premium-fashion curation.", pathname: "/products", searchParams }); }

export default function ProductsPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/products" searchParams={searchParams} config={{ title: "The complete edit", eyebrow: "All products", description: "Explore our complete curation—from structured leather goods to details that elevate the everyday.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Products" }] }} />;
}
