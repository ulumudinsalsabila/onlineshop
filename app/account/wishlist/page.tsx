import { AccountHeading } from "@/components/account/account-heading";
import { ProductCard } from "@/features/home/product-card";
import { authenticatedBackendApi as backendApi } from "@/lib/authenticated-backend-api";
import { requireUser } from "@/lib/auth-guard";
import type { CatalogProduct } from "@/types/catalog";

export default async function AccountWishlistPage() {
  await requireUser();
  const wishlist = (await backendApi<{ items: Array<{ product: CatalogProduct }> }>("/wishlist", { cache: "no-store" })).data;
  const products = wishlist.items.map((item) => item.product);
  return <div><AccountHeading eyebrow="Saved pieces" title="Wishlist" description="Your saved pieces are synchronised with this account." />{products.length ? <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p className="mt-12 border-y border-border py-16 text-center text-sm text-muted-foreground">Your wishlist is empty.</p>}</div>;
}
