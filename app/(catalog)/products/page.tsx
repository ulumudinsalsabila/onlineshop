import { CatalogRoutePage } from "@/features/catalog";
import { catalogMetadata } from "@/lib/catalog-metadata";
import type { RawCatalogSearchParams } from "@/types/catalog";

export function generateMetadata({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) { return catalogMetadata({ title: "Semua Produk", description: "Jelajahi seluruh kurasi fashion premium IVORY.", pathname: "/products", searchParams }); }

export default function ProductsPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  return <CatalogRoutePage pathname="/products" searchParams={searchParams} config={{ title: "The complete edit", eyebrow: "All products", description: "Jelajahi seluruh kurasi kami—dari leather goods berstruktur hingga detail yang menyempurnakan keseharian.", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Products" }] }} />;
}
