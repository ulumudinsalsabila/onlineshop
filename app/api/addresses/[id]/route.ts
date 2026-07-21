import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { addressSchema } from "@/lib/address-schema";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const id = (await params).id;
    const existing = await prisma.address.findFirst({ where: { id, userId: authResult.user.id } });
    if (!existing) return apiError("NOT_FOUND", "Alamat tidak ditemukan.", 404);
    const data = addressSchema.partial().parse(await request.json());
    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) await tx.address.updateMany({ where: { userId: authResult.user.id, id: { not: id } }, data: { isDefault: false } });
      return tx.address.update({ where: { id }, data: { ...data, line2: data.line2 || null } });
    });
    return apiSuccess(address);
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const id = (await params).id;
    const existing = await prisma.address.findFirst({ where: { id, userId: authResult.user.id } });
    if (!existing) return apiError("NOT_FOUND", "Alamat tidak ditemukan.", 404);
    await prisma.address.delete({ where: { id } });
    if (existing.isDefault) {
      const next = await prisma.address.findFirst({ where: { userId: authResult.user.id }, orderBy: { createdAt: "desc" } });
      if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return apiSuccess({ removed: true });
  } catch (error) { return handleApiError(error); }
}
