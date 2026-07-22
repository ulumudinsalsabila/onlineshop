"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, SpinnerGapIcon } from "@phosphor-icons/react";

import { apiFetch } from "@/lib/api-client";
import { formatIDR } from "@/lib/formatters";
import { ProductCard } from "@/features/home/product-card";
import type { CatalogProduct } from "@/types/catalog";

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage?: boolean;
};
export type AccountOrder = {
  id: string;
  orderNumber: string;
  placedAt: Date | string;
  grandTotal: number | string;
  status: string;
  _count: { items: number };
};
export type AccountReturn = {
  id: string;
  returnNumber: string;
  reason: string;
  status: string;
  order: { orderNumber: string };
  orderItem: { productName: string } | null;
};
export type WishlistEntry = { id: string; product: CatalogProduct };
type Item = AccountOrder | AccountReturn | WishlistEntry;

export function LazyAccountList({ resource, initialItems, initialMeta }: { resource: "orders" | "returns" | "wishlist"; initialItems: Item[]; initialMeta?: PaginationMeta }) {
  const fallbackMeta = {
    total: initialItems.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasNextPage: false,
  };
  const [items, setItems] = useState(initialItems);
  const [meta, setMeta] = useState(initialMeta ?? fallbackMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = meta.page < meta.totalPages;
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/api/${resource}?page=${meta.page + 1}&limit=${meta.pageSize}`);
      const result = (await response.json()) as {
        success?: boolean;
        data?: Item[];
        meta?: PaginationMeta;
        error?: { message?: string };
      };
      if (!response.ok || !result.success || !result.data || !result.meta) throw new Error(result.error?.message ?? "Could not load more data.");
      setItems((current) => [...current, ...result.data!.filter((item) => !current.some((existing) => existing.id === item.id))]);
      setMeta(result.meta);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load more data.");
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, meta.page, meta.pageSize, resource]);
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (!items.length) return <p className="mt-12 border-y border-border py-16 text-center text-sm text-muted-foreground">No data yet.</p>;
  return (
    <div>
      {resource === "wishlist" ? (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 xl:grid-cols-3">
          {(items as WishlistEntry[]).map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border border-y border-border">
          {resource === "orders"
            ? (items as AccountOrder[]).map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`} className="grid gap-3 py-5 transition-colors hover:bg-secondary/30 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                      }).format(new Date(order.placedAt))}{" "}
                      · {order._count.items} item
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-serif text-lg">{formatIDR(Number(order.grandTotal))}</p>
                    <p className="text-[0.625rem] tracking-wider uppercase">{order.status.replaceAll("_", " ")}</p>
                  </div>
                  <ArrowRightIcon aria-hidden />
                </Link>
              ))
            : (items as AccountReturn[]).map((item) => (
                <article key={item.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase">
                      {item.returnNumber} · {item.order.orderNumber}
                    </p>
                    <p className="mt-2 font-serif text-xl">{item.orderItem?.productName ?? "Order return"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                  <p className="text-xs tracking-wider uppercase">{item.status.replaceAll("_", " ")}</p>
                </article>
              ))}
        </div>
      )}
      <div ref={sentinel} className="flex min-h-16 items-center justify-center pt-5" aria-live="polite">
        {loading ? (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <SpinnerGapIcon className="animate-spin" aria-hidden />
            Loading more data…
          </span>
        ) : error ? (
          <button type="button" className="text-xs text-destructive underline" onClick={() => void loadMore()}>
            {error} Try again
          </button>
        ) : hasMore ? (
          <span className="sr-only">More data will load automatically.</span>
        ) : (
          <span className="text-xs text-muted-foreground">All {meta.total} records have been displayed.</span>
        )}
      </div>
    </div>
  );
}
