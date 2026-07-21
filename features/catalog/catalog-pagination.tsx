import Link from "next/link";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import { queryToSearchParams } from "@/lib/catalog-query";
import type { CatalogQuery } from "@/types/catalog";

export function CatalogPagination({ query, page, totalPages }: { query: CatalogQuery; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const visible = [...new Set([1, page - 1, page, page + 1, totalPages].filter((item) => item >= 1 && item <= totalPages))];
  const hrefFor = (target: number) => `?${queryToSearchParams({ ...query, page: target })}`;

  return (
    <Pagination className="mt-14 border-t border-border pt-8">
      <PaginationContent>
        <PaginationItem><Button asChild variant="ghost" size="icon" disabled={page === 1}><Link aria-label="Halaman sebelumnya" aria-disabled={page === 1} tabIndex={page === 1 ? -1 : undefined} href={hrefFor(Math.max(1, page - 1))} scroll={false}><CaretLeftIcon aria-hidden /></Link></Button></PaginationItem>
        {visible.map((item, index) => <PaginationItem key={item}>{index > 0 && visible[index - 1] !== item - 1 ? <PaginationEllipsis /> : null}<Button asChild variant={item === page ? "outline" : "ghost"} size="icon"><Link href={hrefFor(item)} scroll={false} aria-current={item === page ? "page" : undefined} aria-label={`Halaman ${item}`}>{item}</Link></Button></PaginationItem>)}
        <PaginationItem><Button asChild variant="ghost" size="icon" disabled={page === totalPages}><Link aria-label="Halaman berikutnya" aria-disabled={page === totalPages} tabIndex={page === totalPages ? -1 : undefined} href={hrefFor(Math.min(totalPages, page + 1))} scroll={false}><CaretRightIcon aria-hidden /></Link></Button></PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

