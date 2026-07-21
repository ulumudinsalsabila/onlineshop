import Link from "next/link";
import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_PAGE_SIZE, parseAdminQuery, type AdminSearchParams } from "@/lib/admin/query";
import { requireAdmin } from "@/lib/admin/auth";
import { formatIDR } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  await requireAdmin("products:read"); const query = await parseAdminQuery(searchParams);
  const where = { deletedAt: null, ...(query.q ? { OR: [{ name: { contains: query.q, mode: "insensitive" as const } }, { baseSku: { contains: query.q, mode: "insensitive" as const } }] } : {}), ...(query.status ? { status: query.status as "DRAFT" | "ACTIVE" | "ARCHIVED" } : {}), ...(query.stock === "low" ? { variants: { some: { inventory: { quantity: { lte: 2 } } } } } : {}) };
  const orderBy = query.sort === "name" ? { name: "asc" as const } : query.sort === "price-high" ? { price: "desc" as const } : { createdAt: "desc" as const };
  const [products, total] = await prisma.$transaction([prisma.product.findMany({ where, orderBy, skip: (query.page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE, include: { brand: true, category: true, variants: { include: { inventory: true } } } }), prisma.product.count({ where })]);
  return <div><AdminPageHeader title="Products" description="Kelola katalog, gambar, varian, kondisi, autentikasi, publikasi, dan inventori." breadcrumbs={[{ label: "Products" }]} action={<Button asChild><Link href="/admin/products/new"><PlusIcon aria-hidden /> New product</Link></Button>} /><AdminDataTable columns={[{ key: "product", label: "Product" }, { key: "category", label: "Category" }, { key: "price", label: "Price" }, { key: "stock", label: "Stock" }, { key: "status", label: "Status" }, { key: "action", label: "" }]} rows={products.map((product) => ({ id: product.id, cells: { product: <div><p className="font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">{product.brand.name} · {product.baseSku}</p></div>, category: product.category.name, price: formatIDR(Number(product.price)), stock: product.variants.reduce((sum, variant) => sum + Math.max(0, (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0)), 0), status: <div className="flex flex-wrap gap-1"><Badge variant="outline">{product.status}</Badge><Badge variant="secondary">{product.condition}</Badge></div>, action: <Button asChild size="icon-sm" variant="ghost"><Link href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`}><PencilSimpleIcon aria-hidden /></Link></Button> } }))} page={query.page} total={total} totalPages={Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))} bulkEndpoint="/api/admin/products" filters={[{ value: "ACTIVE", label: "Published" }, { value: "DRAFT", label: "Draft" }, { value: "ARCHIVED", label: "Archived" }]} sortOptions={[{ value: "newest", label: "Newest" }, { value: "name", label: "Name" }, { value: "price-high", label: "Highest price" }]} /></div>;
}
