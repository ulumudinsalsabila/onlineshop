import { Fragment } from "react";
import Link from "next/link";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export function StorefrontBreadcrumb({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <><JsonLd data={breadcrumbJsonLd(items)} /><Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !item.href ? <BreadcrumbPage>{item.label}</BreadcrumbPage> : <BreadcrumbLink asChild><Link href={item.href}>{item.label}</Link></BreadcrumbLink>}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb></>
  );
}
