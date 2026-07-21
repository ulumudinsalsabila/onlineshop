import { z } from "zod";

import { apiSuccess, handleApiError } from "@/lib/api-response";
import { authenticateApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await authenticateApi();
    if (!authResult.user) return authResult.response;
    const params = new URL(request.url).searchParams;
    const page = z.coerce.number().int().min(1).max(999).catch(1).parse(params.get("page") ?? 1);
    const pageSize = 10;
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({ where: { userId: authResult.user.id }, orderBy: { placedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, orderNumber: true, status: true, paymentStatus: true, grandTotal: true, currency: true, placedAt: true, _count: { select: { items: true } } } }),
      prisma.order.count({ where: { userId: authResult.user.id } }),
    ]);
    return apiSuccess(orders.map((order) => ({ ...order, grandTotal: Number(order.grandTotal) })), undefined, { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (error) { return handleApiError(error); }
}
