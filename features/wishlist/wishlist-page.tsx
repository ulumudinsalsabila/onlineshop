"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon, ShoppingBagIcon, TrashIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { toast } from "sonner";

import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Price } from "@/components/shared/price";
import { StorefrontBreadcrumb } from "@/components/shared/storefront-breadcrumb";
import { useCommerce } from "@/components/shared/commerce-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { catalogProducts } from "@/constants/catalog";

export function WishlistPage() {
  const { hydrated, wishlistIds, toggleWishlist, moveWishlistToCart } = useCommerce();
  const products = wishlistIds.map((id) => catalogProducts.find((product) => product.id === id)).filter((product): product is NonNullable<typeof product> => Boolean(product));
  if (!hydrated) return <WishlistLoading />;

  return (
    <Container className="py-10 sm:py-14">
      <StorefrontBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <div className="mt-8"><p className="text-[0.625rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Saved for later</p><h1 className="mt-2 font-serif text-(length:--text-heading-1)">Your wishlist</h1><p className="mt-4 text-sm text-muted-foreground">{products.length} saved pieces</p></div>
      {!products.length ? <EmptyState icon={HeartIcon} className="mt-10 min-h-[28rem]" title="Your wishlist is empty" description="Use the heart icon to save pieces you would like to revisit." action={<Button asChild><Link href="/products">Explore products</Link></Button>} /> : (
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          <AnimatePresence initial={false}>
            {products.map((product) => (
              <m.article key={product.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}>
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary"><Link href={`/products/${product.slug}`} className="absolute inset-0"><Image src={product.image} alt={product.name} width={1254} height={1254} sizes="(max-width: 640px) 50vw, 25vw" className="size-full object-cover transition-transform duration-500 hover:scale-[1.02]" /></Link><button type="button" onClick={() => { toggleWishlist(product.id); toast("Removed from wishlist"); }} aria-label={`Remove ${product.name} from wishlist`} className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-background/90 shadow-sm"><TrashIcon aria-hidden /></button></div>
                <p className="mt-4 text-[0.625rem] font-semibold tracking-wider text-muted-foreground uppercase">{product.brand}</p><Link href={`/products/${product.slug}`} className="mt-1 block font-serif text-xl leading-tight">{product.name}</Link><Price amount={product.price} compareAt={product.compareAt} className="mt-2 text-sm" />
                <Button className="mt-4 w-full" disabled={product.stock < 1 || product.soldOut} onClick={() => { const moved = moveWishlistToCart(product.id); toast(moved ? "Moved to shopping bag" : "This product is currently unavailable"); }}>{product.soldOut ? "Sold out" : <><ShoppingBagIcon aria-hidden /> Move to cart</>}</Button>
              </m.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Container>
  );
}

function WishlistLoading() { return <Container className="py-14"><Skeleton className="h-4 w-48" /><Skeleton className="mt-8 h-14 w-72" /><div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="aspect-[4/5] rounded-none" />)}</div></Container>; }
