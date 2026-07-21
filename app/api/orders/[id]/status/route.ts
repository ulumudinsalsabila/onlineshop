import { z } from "zod";

import { authorizeAdminApi } from "@/lib/admin/auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { canTransitionOrder } from "@/lib/orders/status";
import { prisma } from "@/lib/prisma";

const schema = z.object({ status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]), trackingNumber: z.string().trim().min(5).max(100).optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authorizeAdminApi("orders:write");
    if (!authResult.user) return authResult.response;
    const data = schema.parse(await request.json());
    const order = await prisma.order.findUnique({ where: { id: (await params).id }, include: { shipments: { orderBy: { createdAt: "desc" }, take: 1 } } });
    if (!order) return apiError("NOT_FOUND", "Pesanan tidak ditemukan.", 404);
    if (!canTransitionOrder(order.status, data.status)) return apiError("INVALID_TRANSITION", `Status ${order.status} tidak dapat diubah menjadi ${data.status}.`, 409);
    if (data.status === "SHIPPED" && !data.trackingNumber) return apiError("TRACKING_REQUIRED", "Nomor resi wajib untuk status shipped.", 422);
    const updated = await prisma.$transaction(async (tx) => {
      if (order.shipments[0] && data.status === "SHIPPED") await tx.shipment.update({ where: { id: order.shipments[0].id }, data: { status: "IN_TRANSIT", trackingNumber: data.trackingNumber, shippedAt: new Date() } });
      if (order.shipments[0] && data.status === "DELIVERED") await tx.shipment.update({ where: { id: order.shipments[0].id }, data: { status: "DELIVERED", deliveredAt: new Date() } });
      await tx.auditLog.create({ data: { userId: authResult.user.id, action: "ORDER_STATUS_UPDATED", entityType: "Order", entityId: order.id, metadata: { from: order.status, to: data.status } } });
      return tx.order.update({ where: { id: order.id }, data: { status: data.status, cancelledAt: data.status === "CANCELLED" ? new Date() : order.cancelledAt } });
    });
    return apiSuccess({ id: updated.id, status: updated.status });
  } catch (error) { return handleApiError(error); }
}
