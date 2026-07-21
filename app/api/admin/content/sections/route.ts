import { z } from "zod";
import { authorizeAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { invalidateStorefront } from "@/lib/cache-invalidation";

const schema = z.object({ sections: z.array(z.object({ id: z.string().min(1).max(100), isVisible: z.boolean(), sortOrder: z.number().int().min(0) })).min(1).max(30) });
export async function PATCH(request: Request) { try { const auth = await authorizeAdminApi("content:write"); if (!auth.user) return auth.response; const { sections } = schema.parse(await request.json()); await prisma.$transaction(async (tx) => { for (const section of sections) await tx.homepageSection.update({ where: { id: section.id }, data: { isVisible: section.isVisible, sortOrder: section.sortOrder } }); await writeAuditLog(tx, { userId: auth.user.id, action: "HOMEPAGE_SECTIONS_UPDATED", entityType: "HomepageSection", metadata: { sections }, request }); }); invalidateStorefront(); return apiSuccess({ count: sections.length }); } catch (error) { return handleApiError(error); } }
