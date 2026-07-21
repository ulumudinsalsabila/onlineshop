import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() { await requireAdmin("products:write"); const [categories, brands] = await Promise.all([prisma.category.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }), prisma.brand.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } })]); return <div><AdminPageHeader title="New product" description="Create a complete product with imagery, variants, and stock." breadcrumbs={[{ label: "Products", href: "/admin/products" }, { label: "New" }]} /><ProductForm categories={categories} brands={brands} /></div>; }
