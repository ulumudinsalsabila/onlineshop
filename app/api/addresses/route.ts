import { apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { addressSchema } from "@/lib/address-schema";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    return apiSuccess(await prisma.address.findMany({ where: { userId: authResult.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }));
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const data = addressSchema.parse(await request.json());
    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) await tx.address.updateMany({ where: { userId: authResult.user.id }, data: { isDefault: false } });
      const count = await tx.address.count({ where: { userId: authResult.user.id } });
      return tx.address.create({ data: { ...data, line2: data.line2 || null, isDefault: data.isDefault || count === 0, userId: authResult.user.id } });
    });
    return apiSuccess(address, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
