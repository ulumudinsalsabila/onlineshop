"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

export type PaginationInfo = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function AdminPagination({ pagination, param = "page" }: { pagination: PaginationInfo; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, pagination.totalPages);
  const page = Math.min(Math.max(1, pagination.page), totalPages);
  function go(target: number) {
    const query = new URLSearchParams(searchParams);
    query.set(param, String(target));
    router.push(`${pathname}?${query}`);
  }
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 2);
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ded8cd] bg-[#faf8f3] px-4 py-3 text-xs text-muted-foreground">
      <span>
        {pagination.total} records · Page {page} of {totalPages} · {pagination.pageSize} per page
      </span>
      <nav aria-label="Admin table pagination" className="flex items-center gap-1">
        <Button type="button" variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
          <CaretLeftIcon aria-hidden />
        </Button>
        {pages.map((item, index) => (
          <span key={item} className="contents">
            {index > 0 && item - pages[index - 1] > 1 ? <span className="px-1">…</span> : null}
            <Button type="button" variant={item === page ? "default" : "outline"} size="icon-sm" onClick={() => go(item)} aria-current={item === page ? "page" : undefined}>
              {item}
            </Button>
          </span>
        ))}
        <Button type="button" variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => go(page + 1)} aria-label="Next page">
          <CaretRightIcon aria-hidden />
        </Button>
      </nav>
    </footer>
  );
}
