import type { AdminPermission } from "@/lib/admin/permissions";
import { authorizeAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { bannerAdminSchema, brandAdminSchema, bulkIdsSchema, categoryAdminSchema, testimonialAdminSchema, voucherAdminSchema } from "@/lib/admin/schemas";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type Entity = "categories" | "brands" | "vouchers" | "banners" | "testimonials";
const permissions: Record<Entity, { write: AdminPermission; type: string }> = { categories: { write: "categories:write", type: "Category" }, brands: { write: "brands:write", type: "Brand" }, vouchers: { write: "vouchers:write", type: "Voucher" }, banners: { write: "content:write", type: "Banner" }, testimonials: { write: "content:write", type: "Testimonial" } };
function entityOf(value: string): Entity | null { return value in permissions ? value as Entity : null; }

export async function POST(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  try { const entity = entityOf((await params).entity); if (!entity) return apiError("NOT_FOUND", "Entity tidak didukung.", 404); const auth = await authorizeAdminApi(permissions[entity].write); if (!auth.user) return auth.response; const raw = await request.json(); const created = await prisma.$transaction(async (tx) => {
    let record: { id: string };
    if (entity === "categories") { const data = categoryAdminSchema.parse(raw); record = await tx.category.create({ data: { ...data, parentId: data.parentId || null, imageUrl: data.imageUrl || null, description: data.description || null } }); }
    else if (entity === "brands") { const data = brandAdminSchema.parse(raw); record = await tx.brand.create({ data: { ...data, logoUrl: data.logoUrl || null, description: data.description || null } }); }
    else if (entity === "vouchers") { const data = voucherAdminSchema.parse(raw); record = await tx.voucher.create({ data: { ...data, description: data.description || null } }); }
    else if (entity === "banners") { const data = bannerAdminSchema.parse(raw); record = await tx.banner.create({ data: { ...data, body: data.body || null, eyebrow: data.eyebrow || null, href: data.href || null, ctaLabel: data.ctaLabel || null } }); }
    else { const data = testimonialAdminSchema.parse(raw); record = await tx.testimonial.create({ data: { ...data, location: data.location || null } }); }
    await writeAuditLog(tx, { userId: auth.user.id, action: `${permissions[entity].type.toUpperCase()}_CREATED`, entityType: permissions[entity].type, entityId: record.id, request }); return record;
  }); return apiSuccess(created, { status: 201 }); } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  try { const entity = entityOf((await params).entity); if (!entity) return apiError("NOT_FOUND", "Entity tidak didukung.", 404); const auth = await authorizeAdminApi(permissions[entity].write); if (!auth.user) return auth.response; const raw = await request.json() as { id?: unknown }; if (typeof raw.id !== "string") return apiError("VALIDATION_ERROR", "ID tidak valid.", 422); const id = raw.id; const updated = await prisma.$transaction(async (tx) => {
    let record: { id: string };
    if (entity === "categories") { const data = categoryAdminSchema.parse(raw); record = await tx.category.update({ where: { id }, data: { ...data, parentId: data.parentId || null, imageUrl: data.imageUrl || null, description: data.description || null } }); }
    else if (entity === "brands") { const data = brandAdminSchema.parse(raw); record = await tx.brand.update({ where: { id }, data: { ...data, logoUrl: data.logoUrl || null, description: data.description || null } }); }
    else if (entity === "vouchers") { const data = voucherAdminSchema.parse(raw); record = await tx.voucher.update({ where: { id }, data: { ...data, description: data.description || null } }); }
    else if (entity === "banners") { const data = bannerAdminSchema.parse(raw); record = await tx.banner.update({ where: { id }, data: { ...data, body: data.body || null, eyebrow: data.eyebrow || null, href: data.href || null, ctaLabel: data.ctaLabel || null } }); }
    else { const data = testimonialAdminSchema.parse(raw); record = await tx.testimonial.update({ where: { id }, data: { ...data, location: data.location || null } }); }
    await writeAuditLog(tx, { userId: auth.user.id, action: `${permissions[entity].type.toUpperCase()}_UPDATED`, entityType: permissions[entity].type, entityId: id, request }); return record;
  }); return apiSuccess(updated); } catch (error) { return handleApiError(error); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  try { const entity = entityOf((await params).entity); if (!entity) return apiError("NOT_FOUND", "Entity tidak didukung.", 404); const auth = await authorizeAdminApi(permissions[entity].write); if (!auth.user) return auth.response; const { ids } = bulkIdsSchema.parse(await request.json()); await prisma.$transaction(async (tx) => { if (entity === "categories") await tx.category.updateMany({ where: { id: { in: ids } }, data: { isActive: false, deletedAt: new Date() } }); else if (entity === "brands") await tx.brand.updateMany({ where: { id: { in: ids } }, data: { isActive: false, deletedAt: new Date() } }); else if (entity === "vouchers") await tx.voucher.updateMany({ where: { id: { in: ids } }, data: { isActive: false } }); else if (entity === "banners") await tx.banner.updateMany({ where: { id: { in: ids } }, data: { isActive: false, deletedAt: new Date() } }); else await tx.testimonial.updateMany({ where: { id: { in: ids } }, data: { isActive: false, deletedAt: new Date() } }); await writeAuditLog(tx, { userId: auth.user.id, action: `${permissions[entity].type.toUpperCase()}_BULK_DISABLED`, entityType: permissions[entity].type, metadata: { ids }, request }); }); return apiSuccess({ count: ids.length }); } catch (error) { return handleApiError(error); }
}
