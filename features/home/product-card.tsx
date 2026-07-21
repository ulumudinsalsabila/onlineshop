"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon, PlusIcon } from "@phosphor-icons/react";
import * as m from "motion/react-m";
import { toast } from "sonner";

import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { catalogProducts } from "@/constants/catalog";
import { useCommerce } from "@/components/shared/commerce-provider";
import type { ProductBadge, StoreProduct } from "@/types/storefront";

const badgeStyles: Record<ProductBadge, string> = {
  New: "bg-primary text-primary-foreground",
  Preloved: "bg-[#6b6257] text-white",
  Sale: "bg-destructive text-white",
  "Sold Out": "bg-muted text-muted-foreground",
};

export function ProductCard({ product }: { product: StoreProduct }) {
  const { addToCart, toggleWishlist: toggleWishlistItem, wishlistIds } = useCommerce();
  const [isLoaded, setIsLoaded] = useState(false);
  const commerceId = catalogProducts.find((item) => item.id === product.id || item.slug === product.slug)?.id ?? product.id;
  const isWishlisted = wishlistIds.includes(commerceId);
  const discount = product.compareAt && product.compareAt > product.price
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : null;

  function toggleWishlist() {
    const next = toggleWishlistItem(commerceId);
    toast(next ? "Ditambahkan ke wishlist" : "Dihapus dari wishlist", { description: product.name });
  }

  function quickAdd() {
    const added = addToCart(commerceId);
    if (added) toast.success("Ditambahkan ke shopping bag", { description: product.name });
    else toast.error("Produk sedang tidak tersedia", { description: product.name });
  }

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden bg-secondary">
        <Link href={`/products/${product.slug}`} prefetch={false} aria-label={`Lihat ${product.name}`} className="relative block aspect-[4/5] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring">
          {!isLoaded ? <Skeleton className="absolute inset-0 z-10 size-full rounded-none" /> : null}
          <Image
            src={product.image}
            alt={product.name}
            width={1254}
            height={1254}
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 24vw"
            className={cn("absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.015]", isLoaded ? "opacity-100" : "opacity-0")}
            onLoad={() => setIsLoaded(true)}
          />
          <Image
            src={product.hoverImage}
            alt=""
            aria-hidden
            width={1254}
            height={1254}
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 24vw"
            className="absolute inset-0 hidden size-full object-cover opacity-0 transition-[opacity,transform] duration-500 group-hover:scale-[1.015] lg:block lg:group-hover:opacity-100"
          />
        </Link>

        <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-1.5">
          {product.badge ? <Badge className={cn("rounded-sm border-0 px-2.5 py-1 text-[0.625rem] tracking-[0.12em] uppercase", badgeStyles[product.badge])}>{product.badge}</Badge> : null}
          {product.condition ? <Badge variant="outline" className="rounded-sm border-white/70 bg-background/90 px-2.5 py-1 text-[0.625rem] tracking-[0.1em] uppercase backdrop-blur-sm">{product.condition}</Badge> : null}
          {discount ? <Badge className="rounded-sm border-0 bg-accent px-2.5 py-1 text-[0.625rem] font-bold text-accent-foreground">-{discount}%</Badge> : null}
        </div>

        <m.button
          type="button"
          aria-label={isWishlisted ? `Hapus ${product.name} dari wishlist` : `Tambahkan ${product.name} ke wishlist`}
          aria-pressed={isWishlisted}
          onClick={toggleWishlist}
          animate={{ scale: isWishlisted ? [1, 1.18, 1] : 1 }}
          className="absolute top-3 right-3 z-20 grid size-10 place-items-center rounded-full bg-background/92 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <HeartIcon size={19} weight={isWishlisted ? "fill" : "regular"} className={isWishlisted ? "text-destructive" : undefined} aria-hidden />
        </m.button>

        <Button
          type="button"
          disabled={product.soldOut}
          onClick={quickAdd}
          className="absolute inset-x-3 bottom-3 z-20 opacity-100 shadow-lifted transition-[opacity,transform] lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:focus-visible:translate-y-0 lg:focus-visible:opacity-100"
        >
          {product.soldOut ? "Sold out" : <><PlusIcon aria-hidden /> Quick add</>}
        </Button>
      </div>

      <div className="pt-4">
        <p className="text-[0.625rem] font-semibold tracking-[0.15em] text-muted-foreground uppercase">{product.brand}</p>
        <Link href={`/products/${product.slug}`} prefetch={false} className="mt-1 block font-serif text-xl leading-tight transition-colors hover:text-accent-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{product.name}</Link>
        <Price amount={product.price} compareAt={product.compareAt} className="mt-2 text-sm" />
      </div>
    </article>
  );
}
