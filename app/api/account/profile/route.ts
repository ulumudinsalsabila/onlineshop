import { z } from "zod";

import { apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

export async function PATCH(request: Request) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const data = z.object({ name: z.string().trim().min(2).max(80), phone: z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/).optional().or(z.literal("")) }).parse(await request.json());
    const user = await prisma.user.update({ where: { id: authResult.user.id }, data: { name: sanitizeText(data.name, 80), phone: data.phone || null }, select: { id: true, name: true, email: true, phone: true } });
    return apiSuccess(user);
  } catch (error) { return handleApiError(error); }
}
