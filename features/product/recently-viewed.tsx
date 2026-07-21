"use client";

import { useEffect } from "react";

import { useCommerce } from "@/components/shared/commerce-provider";
import { catalogProducts } from "@/constants/catalog";
import { ProductCard } from "@/features/home/product-card";

export function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const { hydrated, recentlyViewedIds, addRecentlyViewed } = useCommerce();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => addRecentlyViewed(currentProductId));
    return () => window.cancelAnimationFrame(frame);
  }, [addRecentlyViewed, currentProductId]);

  const products = recentlyViewedIds.filter((id) => id !== currentProductId).map((id) => catalogProducts.find((product) => product.id === id)).filter((product): product is NonNullable<typeof product> => Boolean(product)).slice(0, 4);
  if (!hydrated || !products.length) return null;

  return <section className="mt-(--space-section) border-t border-border pt-(--space-section)" aria-labelledby="recent-title"><p className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Your browsing history</p><h2 id="recent-title" className="mt-2 font-serif text-(length:--text-heading-2)">Recently viewed</h2><div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
}

