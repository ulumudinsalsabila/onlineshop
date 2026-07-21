import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FingerprintIcon, ShieldCheckIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";

import { Container } from "@/components/shared/container";
import { StorefrontBreadcrumb } from "@/components/shared/storefront-breadcrumb";
import { catalogProducts } from "@/constants/catalog";
import { getProductDetails } from "@/constants/product-details";
import { ProductCard } from "@/features/home/product-card";
import { ProductGallery, ProductPurchasePanel, RecentlyViewed } from "@/features/product";

export function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = catalogProducts.find((item) => item.slug === slug);
  return product ? { title: product.name, description: `${product.name} dari ${product.brand}. ${product.category} pilihan dalam kurasi Maison Élan.` } : { title: "Product" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = catalogProducts.find((item) => item.slug === slug);
  if (!product) notFound();
  const details = getProductDetails(product);
  const related = catalogProducts.filter((item) => item.id !== product.id && (item.categorySlug === product.categorySlug || item.brandSlug === product.brandSlug)).slice(0, 4);

  return (
    <div className="pb-(--space-section)">
      <Container className="py-6 sm:py-8"><StorefrontBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.category, href: `/category/${product.categorySlug}` }, { label: product.name }]} /></Container>
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)] lg:gap-14 xl:gap-20">
        <ProductGallery product={product} />
        <ProductPurchasePanel product={product} details={details} />
      </Container>

      <Container className="mt-(--space-section)">
        <div className="grid gap-12 border-y border-border py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
          <div><p className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Product story</p><h2 className="mt-3 font-serif text-(length:--text-heading-2)">Details, considered.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">{details.description} Setiap detail dipilih untuk menciptakan keseimbangan antara fungsi, tactility, dan bentuk.</p></div>
          <dl className="divide-y divide-border border-t border-border">{details.specifications.map((item) => <div key={item.label} className="grid grid-cols-[8rem_1fr] gap-5 py-4 text-sm"><dt className="text-muted-foreground">{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
        </div>

        <section className="grid gap-px bg-border sm:grid-cols-3" aria-label="Authenticity guarantee">
          <Guarantee icon={FingerprintIcon} title="Expert inspection" text="Material, konstruksi, hardware, dan serial diperiksa secara menyeluruh." />
          <Guarantee icon={ShieldCheckIcon} title="Authenticity assured" text="Produk preloved disertai hasil autentikasi dan perlindungan pembelian." />
          <Guarantee icon={SparkleIcon} title="Condition transparent" text="Catatan kondisi ditulis secara jelas sebelum produk ditawarkan." />
        </section>

        {related.length ? <section className="mt-(--space-section)" aria-labelledby="related-title"><p className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Continue exploring</p><h2 id="related-title" className="mt-2 font-serif text-(length:--text-heading-2)">Related products</h2><div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section> : null}
        <RecentlyViewed currentProductId={product.id} />
      </Container>
    </div>
  );
}

function Guarantee({ icon: Icon, title, text }: { icon: typeof FingerprintIcon; title: string; text: string }) {
  return <article className="bg-card p-7 sm:p-9"><Icon size={28} weight="light" aria-hidden /><h3 className="mt-7 font-serif text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>;
}

