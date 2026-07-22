import Link from "next/link";
import { SellerPageHeader } from "@/components/seller/seller-page-header";
import { authenticatedBackendApi } from "@/lib/authenticated-backend-api";
import { formatIDR } from "@/lib/formatters";
import { requireSeller } from "@/lib/seller/auth";
import type { Money, SellerProduct } from "@/types/seller-api";
type Listed = {
  id: string;
  submissionNumber: string;
  title: string;
  agreedPrice: Money | null;
  product: SellerProduct | null;
};
export default async function ListedPage() {
  await requireSeller();
  const items = (
    await authenticatedBackendApi<Listed[]>("/seller/listed", {
      cache: "no-store",
    })
  ).data;
  return (
    <div>
      <SellerPageHeader title="Listed products" description="Products that passed curation and are currently available in the storefront." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="border border-[#ddd5c7] bg-[#faf8f3] p-5">
            <p className="text-xs text-muted-foreground">{item.submissionNumber}</p>
            <h2 className="mt-2 font-serif text-2xl">{item.product?.name ?? item.title}</h2>
            <p className="mt-3 text-sm">{formatIDR(Number(item.product?.price ?? item.agreedPrice))}</p>
            {item.product && (
              <Link href={`/products/${item.product.slug}`} className="mt-5 inline-block text-xs font-semibold tracking-wider uppercase underline">
                View listing
              </Link>
            )}
          </article>
        ))}
        {!items.length && <p className="text-sm text-muted-foreground">No active products yet.</p>}
      </div>
    </div>
  );
}
